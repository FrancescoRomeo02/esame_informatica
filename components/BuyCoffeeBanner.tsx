import React from 'react';

export const BuyCoffeeBanner: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <a 
      href="https://buymeacoffee.com/francescoromeo" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block w-full transform transition-all hover:scale-[1.02] active:scale-95 group ${className}`}
    >
      <div className="bg-[#FFDD00] hover:bg-[#FFEA00] text-slate-900 p-4 rounded-xl shadow-md border border-yellow-400 flex items-center justify-center gap-4 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-4 -top-4 bg-white opacity-20 w-16 h-16 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
        
        <span className="text-3xl relative z-10 animate-bounce" style={{ animationDuration: '2s' }}>☕</span>
        <div className="flex flex-col relative z-10 text-left">
          <span className="font-bold text-slate-900 leading-tight">Ti è utile questa app?</span>
          <span className="text-xs font-medium text-slate-800/80">Supportami offrendomi un caffè!</span>
        </div>
      </div>
    </a>
  );
};