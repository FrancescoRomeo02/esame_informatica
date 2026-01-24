import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { questions } from './data';
import { QuestionState, Question } from './types';
import { loadProgress, saveProgress, clearProgress } from './services/storageService';
import { getNextQuestion, updateQuestionState, getInitialState } from './services/srsService';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'quiz'>('home');
  const [progress, setProgress] = useState<Record<number, QuestionState>>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
  }, []);

  const startQuiz = () => {
    const next = getNextQuestion(questions, progress);
    if (next) {
      setCurrentQuestion(next);
      setView('quiz');
    } else {
      alert("Tutte le domande sono state completate per ora!");
    }
  };

  const handleAnswer = (questionId: number, isCorrect: boolean) => {
    const currentState = progress[questionId] || getInitialState(questionId);
    const newState = updateQuestionState(currentState, isCorrect);
    
    const newProgress = {
      ...progress,
      [questionId]: newState
    };

    setProgress(newProgress);
    saveProgress(newProgress);

    // Get next question (could be the same one immediately if we want instant retry, 
    // but typically SRS moves to next in queue)
    const next = getNextQuestion(questions, newProgress);
    if (next) {
        setCurrentQuestion(next);
    } else {
        setView('home');
    }
  };

  const resetData = () => {
      setProgress({});
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {view === 'home' && (
        <Home 
          questions={questions} 
          progress={progress} 
          onStart={startQuiz}
          onReset={resetData}
        />
      )}
      {view === 'quiz' && currentQuestion && (
        <Quiz 
          question={currentQuestion}
          onAnswer={handleAnswer}
          onExit={() => setView('home')}
        />
      )}
    </div>
  );
};

export default App;