import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { ExamResult } from './components/ExamResult';
import { questions } from './data';
import { QuestionState, Question } from './types';
import { loadProgress, saveProgress, clearProgress } from './services/storageService';
import { getNextQuestion, updateQuestionState, getInitialState } from './services/srsService';

type ViewMode = 'home' | 'quiz' | 'result';
type QuizMode = 'srs' | 'exam';

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
    setExamIndex(0);
    setExamScore(0);
    setCurrentQuestion(subset[0]);
    setView('quiz');
  };

  const handleExamAnswer = (isCorrect: boolean) => {
      if (isCorrect) {
          setExamScore(prev => prev + 1);
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

  // --- Common Handlers ---
  const handleAnswer = (questionId: number, isCorrect: boolean) => {
    if (quizMode === 'srs') {
        handleSRSAnswer(questionId, isCorrect);
    } else {
        handleExamAnswer(isCorrect);
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
          question={currentQuestion}
          onAnswer={handleAnswer}
          onExit={goHome}
          // Pass exam specific props
          currentIndex={quizMode === 'exam' ? examIndex : undefined}
          totalQuestions={quizMode === 'exam' ? examQueue.length : undefined}
        />
      )}

      {view === 'result' && (
        <ExamResult 
            score={examScore}
            total={examQueue.length}
            onHome={goHome}
            onRetry={startExamSession}
        />
      )}
    </div>
  );
};

export default App;