import React, { useEffect, useRef } from 'react';
import { TrophyIcon, CheckIcon, XIcon, ClockIcon, BookmarkIcon, MessageSquareIcon, StarIcon } from './icons';
import { Quiz, UserAnswers, Question, UserAnswer, HistoryItem } from '../types';

interface ResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  quiz: Quiz;
  userAnswers: UserAnswers;
  timeTaken: number; // in seconds
  reviewQuestions: Quiz;
  onToggleReviewQuestion: (question: Question) => void;
  onOpenChat: (question: Question, userAnswer: UserAnswer) => void;
  history: HistoryItem[];
  onToggleSaveQuiz: (quizId: number) => void;
}

const Confetti: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const pieces = Array(200).fill({}).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height - height,
            radius: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 70%)`,
            vx: Math.random() * 10 - 5,
            vy: Math.random() * 5 + 2,
            rotation: Math.random() * 360,
            spin: Math.random() * 20 - 10,
        }));
        
        let frameId: number;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            pieces.forEach(p => {
                p.y += p.vy;
                p.x += p.vx;
                p.rotation += p.spin;

                if (p.y > height) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
                ctx.restore();
            });
            frameId = requestAnimationFrame(animate);
        };
        
        animate();
        return () => cancelAnimationFrame(frameId);
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" />;
};


const Results: React.FC<ResultsProps> = ({ score, totalQuestions, onRestart, quiz, userAnswers, timeTaken, reviewQuestions, onToggleReviewQuestion, onOpenChat, history, onToggleSaveQuiz }) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const avgTime = (timeTaken / totalQuestions).toFixed(1);
  const latestQuizHistoryItem = history[0];
  
  const getFeedback = () => {
    if (percentage === 100) return "Perfect Score! You're a true master!";
    if (percentage >= 80) return "Excellent work! You really know your stuff.";
    if (percentage >= 60) return "Great job! A solid performance.";
    if (percentage >= 40) return "Not bad! A little more practice will help.";
    return "Keep trying! Every attempt is a step forward.";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins} min ` : ''}${secs} sec`;
  };

  const scoreColor = percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up relative">
      {percentage >= 90 && <Confetti />}
      <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center mb-8">
        <TrophyIcon className="w-20 h-20 text-yellow-400 mb-4"/>
        <h2 className="text-4xl font-extrabold mb-2 text-white">Quiz Complete!</h2>
        <p className="text-xl text-slate-400 mb-6">{getFeedback()}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-lg">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
             <p className="text-lg text-slate-400">Your Score</p>
             <p className={`text-5xl font-bold my-1 ${scoreColor}`}>{score}<span className="text-3xl text-slate-500">/{totalQuestions}</span></p>
             <p className="text-2xl font-semibold text-slate-300">{percentage}%</p>
          </div>
           <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
             <p className="text-lg text-slate-400">Time Taken</p>
             <p className="text-4xl font-bold my-2 text-slate-200">{formatTime(timeTaken)}</p>
          </div>
           <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
             <p className="text-lg text-slate-400">Avg. Time</p>
             <p className="text-4xl font-bold my-2 text-slate-200">{avgTime}s</p>
             <p className="text-sm font-semibold text-slate-500">per question</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button
              onClick={onRestart}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:-translate-y-px shadow-lg hover:shadow-purple-500/20"
            >
              Create Another Quiz
            </button>
            {latestQuizHistoryItem && (
                <button 
                  onClick={() => onToggleSaveQuiz(latestQuizHistoryItem.id)}
                  title={latestQuizHistoryItem.isSaved ? "Remove from Collection" : "Save to Collection"}
                  className={`p-4 rounded-full transition-colors ${latestQuizHistoryItem.isSaved ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                >
                    <StarIcon className="w-6 h-6" isFilled={latestQuizHistoryItem.isSaved} />
                </button>
            )}
        </div>
      </div>

      <div className="p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
        <h3 className="text-3xl font-bold mb-6 text-white">Review Your Answers</h3>
        <ul className="space-y-6">
          {quiz.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isMarked = reviewQuestions.some(q => q.question === question.question);
            return (
              <li key={index} className="border-b border-slate-700 pb-6 last:border-b-0">
                <div className="flex justify-between items-start gap-4">
                  <p className="font-bold text-lg mb-3 flex-grow text-slate-200">{index + 1}. {question.question}</p>
                  <button
                    onClick={() => onToggleReviewQuestion(question)}
                    title={isMarked ? "Remove from review" : "Mark for review"}
                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${isMarked ? 'bg-yellow-400/20 text-yellow-400' : 'text-slate-500 hover:bg-yellow-400/20 hover:text-yellow-400'}`}
                  >
                      <BookmarkIcon className="w-5 h-5" isFilled={isMarked} />
                  </button>
                </div>
                <div className="space-y-2 text-slate-300">
                  {question.options.map((option, optIndex) => {
                    const isUserChoice = userAnswer === option;
                    const isCorrectAnswer = question.correctAnswer === option;
                    
                    let style = 'border-slate-600 bg-slate-700/40';
                    if (isCorrectAnswer) style = 'border-green-500/50 bg-green-500/10 text-green-300';
                    if (isUserChoice && !isCorrect) style = 'border-red-500/50 bg-red-500/10 text-red-300';

                    return (
                      <div key={optIndex} className={`flex items-center p-3 rounded-md border ${style}`}>
                        {!isUserChoice && !isCorrectAnswer && <div className="w-5 h-5 mr-2 flex-shrink-0" />}
                        {isUserChoice && !isCorrect && <XIcon className="w-5 h-5 mr-2 text-red-400 flex-shrink-0"/>}
                        {isCorrectAnswer && <CheckIcon className="w-5 h-5 mr-2 text-green-400 flex-shrink-0"/>}
                        <span className="flex-grow">{option}</span>
                      </div>
                    )
                  })}
                </div>
                 <div className="mt-3 bg-slate-700/50 border-l-4 border-indigo-500 text-indigo-200 p-3 rounded-r-md">
                   <p><span className="font-bold">Explanation:</span> {question.explanation}</p>
                 </div>
                 {!isCorrect && (
                   <div className="mt-3">
                     <button onClick={() => onOpenChat(question, userAnswer)} className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 py-2 rounded-md transition-colors">
                       <MessageSquareIcon className="w-4 h-4" />
                       Discuss with AI Tutor
                     </button>
                   </div>
                 )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  );
};

export default Results;