import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { ExamResult } from './components/ExamResult';
import { questions } from './data';
import { QuestionState, Question } from './types';
import { loadProgress, saveProgress } from './services/storageService';
import { getNextQuestion, updateQuestionState, getInitialState } from './services/srsService';

type ViewMode = 'home' | 'quiz' | 'result';
type QuizMode = 'srs' | 'exam' | 'review';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('home');
  const [quizMode, setQuizMode] = useState<QuizMode>('srs');
  const [progress, setProgress] = useState<Record<number, QuestionState>>({});
  
  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Exam State
  const [examQueue, setExamQueue] = useState<Question[]>([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examScore, setExamScore] = useState(0);
  const [examMistakes, setExamMistakes] = useState<Question[]>([]);

  // Review State
  const [reviewQueue, setReviewQueue] = useState<Question[]>([]);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
  }, []);

  // --- SRS Logic ---
  const startSRSSession = () => {
    setQuizMode('srs');
    const next = getNextQuestion(questions, progress);
    if (next) {
      setCurrentQuestion(next);
      setView('quiz');
    } else {
      alert("Tutte le domande sono state completate per ora!");
    }
  };

  const handleSRSAnswer = (questionId: number, isCorrect: boolean) => {
    // Update SRS progress only in SRS mode
    const currentState = progress[questionId] || getInitialState(questionId);
    const newState = updateQuestionState(currentState, isCorrect);
    
    const newProgress = {
      ...progress,
      [questionId]: newState
    };

    setProgress(newProgress);
    saveProgress(newProgress);

    const next = getNextQuestion(questions, newProgress);
    if (next) {
        setCurrentQuestion(next);
    } else {
        setView('home');
    }
  };

  // --- Exam Logic ---
  const startExamSession = () => {
    setQuizMode('exam');
    // Fisher-Yates shuffle copy
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Select first 31
    const subset = shuffled.slice(0, 31);
    
    setExamQueue(subset);
    setExamMistakes([]); // Reset mistakes
    setExamIndex(0);
    setExamScore(0);
    setCurrentQuestion(subset[0]);
    setView('quiz');
  };

  const handleExamAnswer = (isCorrect: boolean) => {
      if (isCorrect) {
          setExamScore(prev => prev + 1);
      } else {
          // Track mistake
          if (currentQuestion) {
              setExamMistakes(prev => [...prev, currentQuestion!]);
          }
      }

      // Move to next question or finish
      if (examIndex < examQueue.length - 1) {
          const nextIndex = examIndex + 1;
          setExamIndex(nextIndex);
          setCurrentQuestion(examQueue[nextIndex]);
      } else {
          setView('result');
      }
  };

  // --- Review Logic ---
  const startReviewSession = () => {
      if (examMistakes.length === 0) return;
      setQuizMode('review');
      setReviewQueue([...examMistakes]);
      setCurrentQuestion(examMistakes[0]);
      setView('quiz');
  };

  const handleReviewAnswer = (isCorrect: boolean) => {
      if (isCorrect) {
          // Remove from queue
          const newQueue = reviewQueue.slice(1);
          setReviewQueue(newQueue);
          
          if (newQueue.length === 0) {
              alert("Ottimo! Hai ripassato tutti gli errori.");
              setView('home');
          } else {
              setCurrentQuestion(newQueue[0]);
          }
      } else {
          // Wrong answer: move to back of queue
          // We take the current first item and push it to end
          const [wrong, ...rest] = reviewQueue;
          const newQueue = [...rest, wrong];
          setReviewQueue(newQueue);
          setCurrentQuestion(newQueue[0]);
      }
  };

  // --- Common Handlers ---
  const handleAnswer = (questionId: number, isCorrect: boolean) => {
    if (quizMode === 'srs') {
        handleSRSAnswer(questionId, isCorrect);
    } else if (quizMode === 'exam') {
        handleExamAnswer(isCorrect);
    } else if (quizMode === 'review') {
        handleReviewAnswer(isCorrect);
    }
  };

  const resetData = () => {
      setProgress({});
  }

  const goHome = () => {
      setView('home');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {view === 'home' && (
        <Home 
          questions={questions} 
          progress={progress} 
          onStartSRS={startSRSSession}
          onStartExam={startExamSession}
          onReset={resetData}
        />
      )}
      
      {view === 'quiz' && currentQuestion && (
        <Quiz 
          // Force re-render when queue changes in review mode to ensure state reset even if question ID repeats (looping 1 question)
          key={quizMode === 'review' ? `review-${reviewQueue.length}-${currentQuestion.id}` : `quiz-${currentQuestion.id}`}
          question={currentQuestion}
          onAnswer={handleAnswer}
          onExit={goHome}
          // Pass exam specific props
          currentIndex={quizMode === 'exam' ? examIndex : undefined}
          totalQuestions={quizMode === 'exam' ? examQueue.length : undefined}
          headerText={quizMode === 'review' ? `Ripasso: ${reviewQueue.length} rimanenti` : undefined}
        />
      )}

      {view === 'result' && (
        <ExamResult 
            score={examScore}
            total={examQueue.length}
            mistakesCount={examMistakes.length}
            onHome={goHome}
            onRetry={startExamSession}
            onReviewMistakes={startReviewSession}
        />
      )}
    </div>
  );
};

export default App;