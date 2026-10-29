export interface StudySession {
  id: string;
  topic: string;
  durationMinutes: number;
  completedAt: string; // ISO string
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: string; // ISO string
}

export type ActiveTab = 'dashboard' | 'timer' | 'flashcards' | 'history';

export interface DashboardStats {
  totalMinutes: number;
  completedSessionsCount: number;
  flashcardsCount: number;
  todayMinutes: number;
}
