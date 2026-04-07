
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-slate-300">AI is thinking...</p>
    <p className="text-slate-400 text-sm">Analyzing image to find location.</p>
  </div>
);
