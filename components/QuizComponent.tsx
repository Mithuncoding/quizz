import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quiz, Question, UserAnswers, QuizMode } from '../types';
import { CheckIcon, XIcon, ClockIcon, BookmarkIcon } from './icons';

interface QuizComponentProps {
  quiz: Quiz;
  onFinish: (score: number, userAnswers: UserAnswers, timeTaken: number) => void;
  quizMode: QuizMode;
  reviewQuestions: Quiz;
  onToggleReviewQuestion: (question: Question) => void;
}

const SECONDS_PER_QUESTION = 30;

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, onFinish, quizMode, reviewQuestions, onToggleReviewQuestion }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>(Array(quiz.length).fill(null));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const totalTime = quiz.length * SECONDS_PER_QUESTION;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion: Question = quiz[currentQuestionIndex];
  
  const finishQuiz = useCallback(() => {
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    onFinish(score, userAnswers, timeTaken);
  }, [score, userAnswers, onFinish]);

  useEffect(() => {
    if (quizMode !== 'test') return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finishQuiz, quizMode]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  }, [currentQuestionIndex, quiz.length, finishQuiz]);

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
    
    let currentScore = score;
    if (option === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
      currentScore += 1;
    }

    if (quizMode === 'study') {
        setSelectedAnswer(option);
        setIsAnswered(true);
    } else { // Test mode
        handleNextQuestion();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnswered && quizMode === 'study' && event.key === 'Enter') {
          handleNextQuestion();
          return;
      }

      if (isAnswered) return;

      if (['1', '2', '3', '4'].includes(event.key)) {
        const index = parseInt(event.key) - 1;
        if (currentQuestion.options[index]) {
            handleAnswerClick(currentQuestion.options[index]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, quizMode, handleNextQuestion, currentQuestion]);


  const getButtonClass = (option: string) => {
    if (quizMode === 'test' || !isAnswered) {
      return 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 hover:border-indigo-500';
    }
    // Study mode, answered
    if (option === currentQuestion.correctAnswer) {
      return 'bg-green-500/20 border-green-500 text-green-300 font-semibold';
    }
    if (option === selectedAnswer) {
      return 'bg-red-500/20 border-red-500 text-red-300';
    }
    return 'bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed';
  };
  
  const timerProgress = (timeLeft / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isMarked = reviewQuestions.some(q => q.question === currentQuestion.question);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 text-white">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm text-slate-400">
          <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
           {quizMode === 'test' && (
             <span className="flex items-center gap-1 font-bold text-slate-300">
               <ClockIcon className="w-4 h-4" />
               {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
             </span>
           )}
        </div>
        {quizMode === 'test' && (
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 linear" style={{ width: `${timerProgress}%` }}></div>
          </div>
        )}
      </div>
      
      <div key={currentQuestionIndex} className="animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">{currentQuestion.question}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              disabled={isAnswered && quizMode === 'study'}
              className={`flex items-center justify-between p-4 rounded-lg text-left text-lg transition-all duration-300 border-2 ${getButtonClass(option)}`}
            >
              <span className="flex-1"><span className="hidden sm:inline-block text-slate-500 font-bold mr-2">{index + 1}.</span>{option}</span>
              {quizMode === 'study' && isAnswered && option === currentQuestion.correctAnswer && <CheckIcon className="w-6 h-6 text-green-400"/>}
              {quizMode === 'study' && isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && <XIcon className="w-6 h-6 text-red-400"/>}
            </button>
          ))}
        </div>
      </div>
      
      {quizMode === 'study' && isAnswered && (
        <div className="mt-8 text-center animate-fade-in-up">
           <div className="bg-slate-700/50 border-l-4 border-indigo-500 text-indigo-200 p-4 rounded-r-lg text-left mb-6">
            <p className="font-bold">Explanation:</p>
            <p className="text-slate-300">{currentQuestion.explanation}</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleNextQuestion}
              className="px-10 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:-translate-y-px shadow-lg hover:shadow-purple-500/20"
            >
              {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
            <button
                onClick={() => onToggleReviewQuestion(currentQuestion)}
                title={isMarked ? "Remove from review" : "Mark for review"}
                className={`p-3 rounded-full transition-colors ${isMarked ? 'bg-yellow-400/20 text-yellow-400' : 'text-slate-500 hover:bg-yellow-400/20 hover:text-yellow-400'}`}
            >
                <BookmarkIcon className="w-6 h-6" isFilled={isMarked} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;