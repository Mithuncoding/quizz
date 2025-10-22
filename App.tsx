import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Quiz, Difficulty, HistoryItem, UserAnswers, QuizMode, Question, SRSItem, UserData, UserAnswer } from './types';
import { generateQuiz } from './services/geminiService';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import QuizComponent from './components/QuizComponent';
import Results from './components/Results';
import Loader from './components/Loader';
import NavBar from './components/NavBar';
import SrsSession from './components/SrsSession';
import Footer from './components/Footer';
import StudyBuddyChat from './components/StudyBuddyChat';

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('homepage');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizMode, setQuizMode] = useState<QuizMode>('study');
  const [userAnswers, setUserAnswers] = useState<UserAnswers | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<Quiz>([]);
  const [srsQueue, setSrsQueue] = useState<SRSItem[]>([]);
  const [srsSessionQueue, setSrsSessionQueue] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({ xp: 0, streak: { current: 0, lastVisit: new Date().toISOString() }});
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [currentChatInfo, setCurrentChatInfo] = useState<{ question: Question; userAnswer: UserAnswer } | null>(null);


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('quizHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      
      const storedReview = localStorage.getItem('reviewQuestions');
      if (storedReview) setReviewQuestions(JSON.parse(storedReview));

      const storedSrs = localStorage.getItem('srsQueue');
      if (storedSrs) setSrsQueue(JSON.parse(storedSrs));
      
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedData: UserData = JSON.parse(storedUserData);
        const today = new Date();
        const lastVisit = new Date(parsedData.streak.lastVisit);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (!isSameDay(today, lastVisit) && !isSameDay(yesterday, lastVisit)) {
            parsedData.streak.current = 0; // Reset streak if they missed a day
        }
        setUserData(parsedData);
      }

    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
      localStorage.clear(); // Clear all data if parsing fails to prevent corruption
    }
  }, []);

  const updateUserData = (newXp: number, quizCompleted: boolean = false) => {
      setUserData(prevData => {
          const today = new Date();
          const lastVisit = new Date(prevData.streak.lastVisit);
          let newStreak = prevData.streak.current;

          if (quizCompleted && !isSameDay(today, lastVisit)) {
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);
              if (isSameDay(yesterday, lastVisit)) {
                  newStreak += 1; // Increment streak
              } else {
                  newStreak = 1; // Start a new streak
              }
          }
          
          const updatedData = {
              xp: prevData.xp + newXp,
              streak: {
                  current: newStreak,
                  lastVisit: today.toISOString()
              }
          };
          localStorage.setItem('userData', JSON.stringify(updatedData));
          return updatedData;
      });
  };

  const saveToHistory = (newHistoryItem: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prevHistory => {
      const updatedHistory = [
        { ...newHistoryItem, id: Date.now(), timestamp: new Date().toISOString(), isSaved: false },
        ...prevHistory
      ].slice(0, 50); // Keep only the last 50 quizzes
      localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };
  
  const handleToggleSaveQuiz = (quizId: number) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.map(item =>
        item.id === quizId ? { ...item, isSaved: !item.isSaved } : item
      );
      localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const handleToggleReviewQuestion = (questionToToggle: Question) => {
    setReviewQuestions(prev => {
      const isAlreadyMarked = prev.some(q => q.question === questionToToggle.question);
      let updatedReviewQuestions;
      if (isAlreadyMarked) {
        updatedReviewQuestions = prev.filter(q => q.question !== questionToToggle.question);
      } else {
        updatedReviewQuestions = [...prev, questionToToggle];
      }
      localStorage.setItem('reviewQuestions', JSON.stringify(updatedReviewQuestions));
      return updatedReviewQuestions;
    });
  };

  const handleStartQuiz = useCallback(async (context: string, questionCount: number, difficulty: Difficulty, title: string, mode: QuizMode) => {
    setAppState('loading');
    setError(null);
    setQuizTitle(title);
    setQuizMode(mode);
    try {
      const newQuiz = await generateQuiz(context, questionCount, difficulty);
      if (newQuiz && newQuiz.length > 0) {
        setQuiz(newQuiz);
        setUserAnswers(Array(newQuiz.length).fill(null));
        setScore(0);
        setTimeTaken(0);
        setAppState('quiz');
      } else {
        setError('Failed to generate the quiz. The AI model might be busy or the content was not suitable. Please try again.');
        setAppState('dashboard');
      }
    } catch (e) {
      setError('An unexpected error occurred. Please check the console for details and try again.');
      setAppState('dashboard');
    }
  }, []);

  const handleRetakeQuiz = (historyItem: HistoryItem) => {
    setQuiz(historyItem.quiz);
    setQuizTitle(historyItem.title);
    setQuizMode(historyItem.quizMode);
    setUserAnswers(Array(historyItem.quiz.length).fill(null));
    setScore(0);
    setTimeTaken(0);
    setError(null);
    setAppState('quiz');
  };

  const handleStartReviewQuiz = () => {
    if (reviewQuestions.length === 0) return;
    
    setQuiz(reviewQuestions);
    setQuizTitle('Review Session');
    setQuizMode('study'); // Review quizzes are always in study mode
    setUserAnswers(Array(reviewQuestions.length).fill(null));
    setScore(0);
    setTimeTaken(0);
    setError(null);
    setAppState('quiz');
  };

  const handleQuizFinish = (finalScore: number, finalAnswers: UserAnswers, finalTime: number) => {
    setScore(finalScore);
    setUserAnswers(finalAnswers);
    setTimeTaken(finalTime);
    updateUserData(finalScore * 10, true); // 10 XP per correct answer, and mark quiz as completed for streak
    if (quiz) {
      saveToHistory({
        title: quizTitle,
        score: finalScore,
        totalQuestions: quiz.length,
        quiz: quiz,
        quizMode: quizMode,
        timeTaken: finalTime
      });

      const incorrectQuestions = quiz.filter((q, index) => finalAnswers[index] !== q.correctAnswer);
      
      setSrsQueue(prevQueue => {
          let updatedQueue = [...prevQueue];
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          incorrectQuestions.forEach(iq => {
              const existingIndex = updatedQueue.findIndex(item => item.question.question === iq.question);
              if (existingIndex > -1) {
                  // Reset progress if answered incorrectly again
                  updatedQueue[existingIndex].interval = 1;
                  updatedQueue[existingIndex].reviewDate = tomorrow.toISOString();
              } else {
                  updatedQueue.push({ question: iq, interval: 1, reviewDate: tomorrow.toISOString() });
              }
          });
          localStorage.setItem('srsQueue', JSON.stringify(updatedQueue));
          return updatedQueue;
      });
    }
    setAppState('results');
  };

  const handleStartSrsSession = () => {
    const now = new Date();
    const dueQuestions = srsQueue
      .filter(item => new Date(item.reviewDate) <= now)
      .map(item => item.question);
    
    if (dueQuestions.length > 0) {
      setSrsSessionQueue(dueQuestions);
      setAppState('srs_session');
    }
  };

  const handleUpdateSrsItem = (question: Question, confidence: 'hard' | 'good' | 'easy') => {
    let xpGained = 0;
    setSrsQueue(prevQueue => {
      const itemIndex = prevQueue.findIndex(item => item.question.question === question.question);
      if (itemIndex === -1) return prevQueue;

      const updatedQueue = [...prevQueue];
      const item = updatedQueue[itemIndex];
      let newInterval = item.interval;

      switch(confidence) {
        case 'hard': newInterval = 1; xpGained = 5; break;
        case 'good': newInterval = Math.ceil(item.interval * 2.5); xpGained = 15; break;
        case 'easy': newInterval = Math.ceil(item.interval * 4); xpGained = 25; break;
      }
      
      const newReviewDate = new Date();
      newReviewDate.setDate(newReviewDate.getDate() + newInterval);
      
      updatedQueue[itemIndex] = { ...item, interval: newInterval, reviewDate: newReviewDate.toISOString() };
      localStorage.setItem('srsQueue', JSON.stringify(updatedQueue));
      return updatedQueue;
    });
    
    updateUserData(xpGained);
    setSrsSessionQueue(prev => prev && prev.filter(q => q.question !== question.question));
  };
  
  useEffect(() => {
    if (appState === 'srs_session' && srsSessionQueue && srsSessionQueue.length === 0) {
      setSrsSessionQueue(null);
      setAppState('dashboard');
    }
  }, [srsSessionQueue, appState]);


  const handleGoHome = () => {
    setQuiz(null);
    setScore(0);
    setError(null);
    setAppState('homepage');
  };

  const handleGetStarted = () => {
    setError(null);
    setAppState('dashboard');
  }

  const handleOpenChat = (question: Question, userAnswer: UserAnswer) => {
    setCurrentChatInfo({ question, userAnswer });
    setChatModalOpen(true);
  };

  const renderContent = () => {
    switch (appState) {
      case 'homepage':
        return <HomePage onGetStarted={handleGetStarted} />;
      case 'dashboard':
        return <Dashboard onStartQuiz={handleStartQuiz} history={history} error={error} reviewQuestions={reviewQuestions} onStartReviewQuiz={handleStartReviewQuiz} srsQueue={srsQueue} onStartSrsSession={handleStartSrsSession} userData={userData} onRetakeQuiz={handleRetakeQuiz} onToggleSaveQuiz={handleToggleSaveQuiz} />;
      case 'loading':
        return <Loader message="Building your advanced quiz... This may take a moment." />;
      case 'quiz':
        return quiz && <QuizComponent quiz={quiz} onFinish={handleQuizFinish} quizMode={quizMode} reviewQuestions={reviewQuestions} onToggleReviewQuestion={handleToggleReviewQuestion} />;
      case 'results':
        return quiz && userAnswers && <Results score={score} totalQuestions={quiz.length} onRestart={handleGetStarted} quiz={quiz} userAnswers={userAnswers} timeTaken={timeTaken} reviewQuestions={reviewQuestions} onToggleReviewQuestion={handleToggleReviewQuestion} onOpenChat={handleOpenChat} history={history} onToggleSaveQuiz={handleToggleSaveQuiz} />;
      case 'srs_session':
        return srsSessionQueue && <SrsSession sessionQuestions={srsSessionQueue} onUpdateItem={handleUpdateSrsItem} />;
      default:
        return <HomePage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col font-sans">
       <NavBar onLogoClick={handleGoHome} onGetStarted={handleGetStarted} />
      <main className="w-full flex-grow">
        {appState !== 'homepage' ? <div className="max-w-7xl mx-auto p-4">{renderContent()}</div> : renderContent()}
      </main>
      {chatModalOpen && currentChatInfo && (
          <StudyBuddyChat
              isOpen={chatModalOpen}
              onClose={() => setChatModalOpen(false)}
              question={currentChatInfo.question}
              userAnswer={currentChatInfo.userAnswer}
          />
      )}
      {appState !== 'dashboard' && <Footer />}
    </div>
  );
};

export default App;