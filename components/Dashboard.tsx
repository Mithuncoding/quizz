import React, { useState } from 'react';
import QuizSetup from './QuizSetup';
import { HistoryItem, QuizMode, Difficulty, Quiz, SRSItem, UserData } from '../types';
import { BookmarkIcon, CalendarCheckIcon, FlameIcon, StarIcon, LibraryIcon, RefreshCwIcon } from './icons';
import ProgressTracker from './ProgressTracker';

interface DashboardProps {
  onStartQuiz: (context: string, questionCount: number, difficulty: Difficulty, title: string, mode: QuizMode) => void;
  history: HistoryItem[];
  error: string | null;
  reviewQuestions: Quiz;
  onStartReviewQuiz: () => void;
  srsQueue: SRSItem[];
  onStartSrsSession: () => void;
  userData: UserData;
  onRetakeQuiz: (historyItem: HistoryItem) => void;
  onToggleSaveQuiz: (quizId: number) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string, bgColor: string }> = ({ icon, label, value, color, bgColor }) => (
    <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm font-medium">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

const HistoryList: React.FC<{ items: HistoryItem[], onRetakeQuiz: (item: HistoryItem) => void, onToggleSaveQuiz: (id: number) => void, emptyMessage: string }> = ({ items, onRetakeQuiz, onToggleSaveQuiz, emptyMessage }) => (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {items.length > 0 ? items.map(item => {
            const percentage = Math.round((item.score / item.totalQuestions) * 100);
            const scoreColor = percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400';
            return (
                <div key={item.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-bold text-slate-200 truncate max-w-[200px] sm:max-w-[300px]">{item.title}</p>
                        <p className="text-sm text-slate-400">
                            <span className={scoreColor}>{percentage}%</span> - {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onToggleSaveQuiz(item.id)} title={item.isSaved ? "Remove from Collection" : "Save to Collection"} className={`p-2 rounded-full transition-colors ${item.isSaved ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`}>
                            <StarIcon className="w-5 h-5" isFilled={item.isSaved} />
                        </button>
                        <button onClick={() => onRetakeQuiz(item)} title="Retake Quiz" className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-full transition-colors">
                            <RefreshCwIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            )
        }) : <p className="text-center text-slate-500 py-8">{emptyMessage}</p>}
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, history, error, reviewQuestions, onStartReviewQuiz, srsQueue, onStartSrsSession, userData, onRetakeQuiz, onToggleSaveQuiz }) => {
  
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');
  const dueSrsItemsCount = srsQueue.filter(item => new Date(item.reviewDate) <= new Date()).length;
  const savedQuizzes = history.filter(item => item.isSaved);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in-up text-slate-300">
      {/* Left side: Main content */}
      <div className="lg:col-span-3 space-y-8">
        {/* Gamification Stats */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard icon={<FlameIcon className="w-7 h-7 text-orange-400" />} label="Daily Streak" value={`${userData.streak.current} Days`} color="text-slate-200" bgColor="bg-orange-500/10" />
                <StatCard icon={<StarIcon className="w-7 h-7 text-yellow-400" />} label="Total XP" value={userData.xp.toLocaleString()} color="text-slate-200" bgColor="bg-yellow-500/10"/>
            </div>
        </div>

        {/* Quiz Creation */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700">
           <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Create a New Quiz</h2>
           <p className="text-slate-400 mb-6">Generate a custom quiz from any topic or PDF document in seconds.</p>
           <QuizSetup onStartQuiz={onStartQuiz} error={error} />
        </div>

        {/* Topic Mastery */}
        <ProgressTracker history={history} />
      </div>

      {/* Right side: Review & History */}
      <div className="lg:col-span-2 space-y-8">
         {/* SRS Zone */}
         <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-white">
              <CalendarCheckIcon className="w-8 h-8 text-green-400"/>
              For You
            </h3>
            <p className="text-slate-400 mb-4">You have <span className="font-bold text-indigo-400">{dueSrsItemsCount}</span> questions due for your daily review.</p>
            <button
              onClick={onStartSrsSession}
              disabled={dueSrsItemsCount === 0}
              className="w-full py-2.5 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-in-out transform hover:-translate-y-px shadow-lg hover:shadow-emerald-500/20 disabled:bg-none disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
            >
              Start Smart Review
            </button>
             <p className="text-xs text-slate-500 mt-2 text-center">Powered by a Spaced Repetition algorithm.</p>
         </div>

         {/* Review Zone */}
         <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-white">
              <BookmarkIcon className="w-8 h-8 text-yellow-400"/>
              Review Zone
            </h3>
            <p className="text-slate-400 mb-4">You have <span className="font-bold text-indigo-400">{reviewQuestions.length}</span> questions manually marked for review.</p>
            <button
              onClick={onStartReviewQuiz}
              disabled={reviewQuestions.length === 0}
              className="w-full py-2.5 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:-translate-y-px shadow-lg hover:shadow-purple-500/20 disabled:bg-none disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
            >
              Start Review Quiz
            </button>
         </div>
         
         {/* My Library */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-700">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-white">
            <LibraryIcon className="w-8 h-8"/>
            My Library
          </h3>
          <div className="flex bg-slate-700 p-1 rounded-lg mb-4">
            <button onClick={() => setActiveTab('history')} className={`w-1/2 py-2 rounded-md font-semibold transition-all ${activeTab === 'history' ? 'bg-slate-800 shadow text-white' : 'text-slate-400'}`}>History</button>
            <button onClick={() => setActiveTab('saved')} className={`w-1/2 py-2 rounded-md font-semibold transition-all ${activeTab === 'saved' ? 'bg-slate-800 shadow text-white' : 'text-slate-400'}`}>Collections</button>
          </div>
          {activeTab === 'history' ? (
            <HistoryList items={history} onRetakeQuiz={onRetakeQuiz} onToggleSaveQuiz={onToggleSaveQuiz} emptyMessage="Your recent quizzes will appear here." />
          ) : (
            <HistoryList items={savedQuizzes} onRetakeQuiz={onRetakeQuiz} onToggleSaveQuiz={onToggleSaveQuiz} emptyMessage="Save quizzes after completing them to build your collection." />
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;