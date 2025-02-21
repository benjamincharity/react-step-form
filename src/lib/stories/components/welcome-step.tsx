import React from 'react';
import { PressEnterHint } from '../../components/press-enter-hint';

interface WelcomeStepProps {
  onStart: () => void;
}

export const WelcomeStep = ({ onStart }: WelcomeStepProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-8 text-opacity-80">Got design feedback?</h1>
      <div className="flex flex-row items-center gap-2">
        <button 
          onClick={onStart}
          className="text-white bg-rose-400 hover:bg-rose-500 px-6 py-3 rounded-full text-lg font-medium transition-colors duration-200"
        >
          Give feedback
        </button>
        <PressEnterHint />
      </div>
      <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
        Takes 2 minutes
      </div>
    </div>
  );
}; 