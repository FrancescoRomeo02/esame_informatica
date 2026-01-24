import React from 'react';
import { Question, QuestionState } from '../types';
import { getStats } from '../services/srsService';
import { clearProgress } from '../services/storageService';

interface HomeProps {
  questions: Question[];
  progress: Record<number, QuestionState>;
  onStart: () => void;
  onReset: () => void;
}

export const Home: React.FC<HomeProps> = ({ questions, progress, onStart, onReset }) => {
  const stats = getStats(questions, progress);

  const handleReset = () => {
    if (confirm("Sei sicuro di voler resettare tutti i progressi?")) {
      clearProgress();
      onReset();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Quiz SRS</h1>
        <p className="text-slate-500">Apprendimento a ripetizione spaziata</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600">{stats.newOrStruggling}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold mt-1">Da rivedere</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-3xl font-bold text-green-500">{stats.mastered}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold mt-1">Padroneggiate</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 col-span-2 flex flex-col items-center">
          <div className="flex justify-between w-full px-4 mb-2">
             <span className="text-slate-600 text-sm">Progresso Totale</span>
             <span className="text-slate-900 font-bold text-sm">
                {Math.round(((stats.mastered + stats.learning * 0.5) / stats.total) * 100)}%
             </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${((stats.mastered + stats.learning * 0.5) / stats.total) * 100}%` }}
            ></div>
          </div>
           <p className="text-xs text-slate-400 mt-2">In apprendimento: {stats.learning}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-4">
        <button 
          onClick={onStart}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Avvia Quiz
        </button>
        
        <button 
          onClick={handleReset}
          className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
        >
          Resetta Progressi
        </button>
      </div>
    </div>
  );
};