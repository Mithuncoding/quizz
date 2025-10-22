import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface SrsSessionProps {
  sessionQuestions: Question[];
  onUpdateItem: (question: Question, confidence: 'hard' | 'good' | 'easy') => void;
}

const SrsSession: React.FC<SrsSessionProps> = ({ sessionQuestions, onUpdateItem }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const totalQuestions = sessionQuestions.length;

  const currentQuestion = sessionQuestions[currentIndex];

  useEffect(() => {
    // Reset reveal state when question changes
    setIsRevealed(false);
  }, [currentIndex]);
  
  const handleConfidenceClick = (confidence: 'hard' | 'good' | 'easy') => {
    onUpdateItem(currentQuestion, confidence);
    // The parent component will handle removing the item from the session queue,
    // which will cause this component to re-render with the next question or unmount.
  };

  if (!currentQuestion) {
      return (
        <div className="w-full max-w-3xl mx-auto p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 text-center">
            <h2 className="text-3xl font-bold text-white">Review Complete!</h2>
            <p className="text-slate-400 mt-2">You've finished your daily review session. Great job!</p>
        </div>
      );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 text-white">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm text-slate-400">
          <span>Reviewing {currentIndex + 1} of {totalQuestions}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}></div>
        </div>
      </div>
      
      <div key={currentIndex} className="animate-fade-in space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">{currentQuestion.question}</h2>

        {!isRevealed ? (
            <button 
                onClick={() => setIsRevealed(true)}
                className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:-translate-y-px shadow-lg hover:shadow-purple-500/20"
            >
                Reveal Answer
            </button>
        ) : (
            <div className="space-y-6 animate-fade-in-up">
                <div className="bg-green-500/10 border-l-4 border-green-500 text-green-300 p-4 rounded-r-lg">
                    <p className="font-bold">Correct Answer:</p>
                    <p>{currentQuestion.options.find(opt => opt === currentQuestion.correctAnswer)}</p>
                </div>
                 <div className="bg-indigo-500/10 border-l-4 border-indigo-500 text-indigo-300 p-4 rounded-r-lg">
                    <p className="font-bold">Explanation:</p>
                    <p>{currentQuestion.explanation}</p>
                </div>
                <div>
                    <p className="text-center font-semibold text-slate-400 mb-3">How well did you remember this?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={() => handleConfidenceClick('hard')} className="py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all transform hover:-translate-y-px">Hard</button>
                        <button onClick={() => handleConfidenceClick('good')} className="py-3 font-bold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-all transform hover:-translate-y-px">Good</button>
                        <button onClick={() => handleConfidenceClick('easy')} className="py-3 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all transform hover:-translate-y-px">Easy</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SrsSession;