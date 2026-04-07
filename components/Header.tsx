
import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center">
    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
      Geo Guesser AI
    </h1>
    <p className="text-slate-400">
      Upload an image and let AI pinpoint its location.
    </p>
  </header>
);
