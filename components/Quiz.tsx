import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '../types';

// CONFIGURAZIONE: Inserisci qui il tuo username/repo di GitHub
const GITHUB_REPO = "FrancescoRomeo02/esame_informatica";

interface QuizProps {
  question: Question;
  onAnswer: (questionId: number, isCorrect: boolean) => void;
  onExit: () => void;
  currentIndex?: number;
  totalQuestions?: number;
  headerText?: string;
}

export const Quiz: React.FC<QuizProps> = ({ question, onAnswer, onExit, currentIndex, totalQuestions, headerText }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
  }, [question]);

  // Memoize shuffled options so they don't reshuffle on every render (only when question changes)
  const { shuffledOptions, shuffledCorrectIndex } = useMemo(() => {
    // Map options to keep track of their original index
    const optionsWithIndex = question.options.map((opt, index) => ({
      text: opt,
      originalIndex: index
    }));

    // Fisher-Yates shuffle
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
    }

    // Find where the correct answer moved to
    const newCorrectIndex = optionsWithIndex.findIndex(item => item.originalIndex === question.correctIndex);

    return {
      shuffledOptions: optionsWithIndex,
      shuffledCorrectIndex: newCorrectIndex
    };
  }, [question]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    // Compare selected index with the calculated correct index in the shuffled array
    const isCorrect = selectedOption === shuffledCorrectIndex;
    onAnswer(question.id, isCorrect);
  };

  const getOptionClass = (index: number) => {
    const baseClass = "p-4 rounded-xl border-2 text-left transition-all duration-200 text-sm md:text-base font-medium";
    
    if (!isAnswered) {
      return `${baseClass} border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer text-slate-700`;
    }

    // Use shuffledCorrectIndex for styling
    if (index === shuffledCorrectIndex) {
      return `${baseClass} border-green-500 bg-green-50 text-green-800`;
    }

    // If this option was selected but is wrong
    if (index === selectedOption && index !== shuffledCorrectIndex) {
      return `${baseClass} border-red-500 bg-red-50 text-red-800`;
    }

    return `${baseClass} border-slate-100 bg-slate-50 text-slate-400 opacity-60`;
  };

  const isExamMode = typeof currentIndex === 'number' && typeof totalQuestions === 'number';

  // Costruzione URL GitHub Issue (usa i dati originali per coerenza nel report)
  const issueTitle = encodeURIComponent(`Errore Domanda #${question.id}`);
  const issueBody = encodeURIComponent(`
### Segnalazione Errore Domanda #${question.id}

**Testo:**
${question.question}

**Opzioni (Originali):**
${question.options.map((o, i) => `- [${i === question.correctIndex ? 'x' : ' '}] ${o}`).join('\n')}

**Descrizione dell'errore:**
(Descrivi qui cosa c'è che non va...)
  `.trim());

  const reportUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${issueTitle}&body=${issueBody}`;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-colors" title="Esci">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {headerText ? (
                <span className="text-orange-500">{headerText}</span>
            ) : isExamMode ? (
              <span className="text-indigo-600">Domanda {currentIndex + 1} / {totalQuestions}</span>
            ) : (
              <span>Domanda #{question.id}</span>
            )}
        </div>

        {/* Report Issue Button */}
        <a 
          href={reportUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-slate-300 hover:text-red-500 transition-colors"
          title="Segnala un errore in questa domanda su GitHub"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </a>
      </div>

      {isExamMode && !headerText && (
         <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
             <div 
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${((currentIndex! + 1) / totalQuestions!) * 100}%` }}
             ></div>
         </div>
      )}

      {/* Question */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex-grow-0 relative group">
        <p className="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Options (Render shuffled options) */}
      <div className="flex flex-col gap-3 flex-grow">
        {shuffledOptions.map((optionObj, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionClick(idx)}
            className={getOptionClass(idx)}
            disabled={isAnswered}
          >
            {optionObj.text}
          </button>
        ))}
      </div>

      {/* Footer / Feedback */}
      <div className={`mt-6 transition-all duration-300 ${isAnswered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
         {isAnswered && (
             <div className="flex flex-col gap-4">
                 <div className={`text-center font-bold ${selectedOption === shuffledCorrectIndex ? 'text-green-600' : 'text-red-500'}`}>
                     {selectedOption === shuffledCorrectIndex ? 'Corretto!' : 'Sbagliato.'}
                 </div>
                 <button 
                    onClick={handleNext}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-transform active:scale-95"
                 >
                    {isExamMode && !headerText && currentIndex === totalQuestions! - 1 ? 'Termina Esame' : 'Prossima Domanda'}
                 </button>
             </div>
         )}
      </div>
    </div>
  );
};