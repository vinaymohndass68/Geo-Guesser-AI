
import React from 'react';
import { AlertTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative flex items-center gap-3 animate-fade-in" role="alert">
    <AlertTriangleIcon className="w-6 h-6 flex-shrink-0" />
    <div>
      <strong className="font-bold">Error! </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  </div>
);
