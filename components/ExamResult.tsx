import React from 'react';

interface ExamResultProps {
  score: number;
  total: number;
  onHome: () => void;
  onRetry: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({ score, total, onHome, onRetry }) => {
  const percentage = Math.round((score / total) * 100);
  
  let message = "";
  let colorClass = "";

  if (percentage >= 90) {
    message = "Eccellente! Sei prontissimo.";
    colorClass = "text-green-600";
  } else if (percentage >= 60) {
    message = "Buon lavoro, esame superato.";
    colorClass = "text-blue-600";
  } else {
    message = "Non ci siamo ancora, ripassa e riprova.";
    colorClass = "text-red-600";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-md mx-auto p-6 space-y-8 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Esito Esame</h2>
        <p className="text-slate-500">Ecco come è andata</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full flex flex-col items-center space-y-4">
        <div className={`text-6xl font-extrabold ${colorClass}`}>
          {score}<span className="text-2xl text-slate-400">/{total}</span>
        </div>
        <div className="text-xl font-medium text-slate-700 text-center">
          {message}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-4">
            <div 
                className={`h-3 rounded-full transition-all duration-1000 ${percentage >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={onRetry}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
        >
          Nuova Simulazione
        </button>
        <button 
          onClick={onHome}
          className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Torna alla Home
        </button>
      </div>
    </div>
  );
};