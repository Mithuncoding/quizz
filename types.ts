// FIX: Removed self-import of 'Question' which was causing a conflict with the local declaration of 'Question'.
export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type Quiz = Question[];

export type AppState = 'homepage' | 'dashboard' | 'loading' | 'quiz' | 'results' | 'srs_session';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuizMode = 'study' | 'test';

export interface HistoryItem {
  id: number;
  title: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  quiz: Quiz;
  quizMode: QuizMode;
  timeTaken: number; // in seconds
  isSaved?: boolean;
}

export interface SRSItem {
  question: Question;
  reviewDate: string; // ISO string for the next review date
  interval: number; // The interval in days for the next review
}

export interface UserData {
  xp: number;
  streak: {
    current: number;
    lastVisit: string; // ISO date string
  };
}


export type UserAnswer = string | null;
export type UserAnswers = UserAnswer[];