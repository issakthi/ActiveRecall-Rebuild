import { Flashcard, StudySession, DashboardStats } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'activerecall_study_sessions',
  FLASHCARDS: 'activerecall_flashcards',
};

// Safe JSON parser to handle corrupted or unexpected localStorage data
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
  } catch (error) {
    console.error(`Failed to parse localStorage key: ${key}`, error);
    return fallback;
  }
}

// ==========================================
// STUDY SESSIONS API (localStorage prototype)
// Easily replaced with Android Retrofit/REST API
// ==========================================

export function getStudySessions(): StudySession[] {
  const sessions = safeParse<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
  // Return sorted newest first
  return sessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function saveStudySession(session: Omit<StudySession, 'id'>): StudySession {
  const sessions = getStudySessions();
  const newSession: StudySession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  const updated = [newSession, ...sessions];
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  return newSession;
}

export function deleteStudySession(id: string): boolean {
  const sessions = getStudySessions();
  const filtered = sessions.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  return true;
}

export function clearAllStudySessions(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
}

// ==========================================
// FLASHCARDS API (localStorage prototype)
// Easily replaced with Android Retrofit/REST API
// ==========================================

export function getFlashcards(): Flashcard[] {
  return safeParse<Flashcard[]>(STORAGE_KEYS.FLASHCARDS, []);
}

export function saveFlashcard(card: Omit<Flashcard, 'id' | 'createdAt'>): Flashcard {
  const flashcards = getFlashcards();
  const newCard: Flashcard = {
    ...card,
    id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [...flashcards, newCard];
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(updated));
  return newCard;
}

export function deleteFlashcard(id: string): boolean {
  const flashcards = getFlashcards();
  const filtered = flashcards.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(filtered));
  return true;
}

export function loadSampleFlashcards(): Flashcard[] {
  const samples: Flashcard[] = [
    {
      id: `card_${Date.now()}_1`,
      question: 'What is the "Active Recall" study technique?',
      answer: 'Active recall is a learning principle where you actively stimulate memory retrieval during the learning process, rather than passively reading notes.',
      createdAt: new Date().toISOString(),
    },
    {
      id: `card_${Date.now()}_2`,
      question: 'What is Spaced Repetition?',
      answer: 'An evidence-based learning technique that reviews material at systematically increasing intervals to flatten the forgetting curve.',
      createdAt: new Date().toISOString(),
    },
    {
      id: `card_${Date.now()}_3`,
      question: 'What is the standard Pomodoro interval?',
      answer: '25 minutes of high-focus uninterrupted study, followed by a 5-minute break.',
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(samples));
  return samples;
}

// ==========================================
// CALCULATED REAL-DATA STATISTICS
// No fake or hardcoded numbers
// ==========================================

export function calculateDashboardStats(): DashboardStats {
  const sessions = getStudySessions();
  const flashcards = getFlashcards();

  const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
  const completedSessionsCount = sessions.length;
  const flashcardsCount = flashcards.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter((s) => s.completedAt && s.completedAt.startsWith(todayStr))
    .reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);

  return {
    totalMinutes,
    completedSessionsCount,
    flashcardsCount,
    todayMinutes,
  };
}

export function getStudyActivityByDay(days = 7): { date: string; label: string; minutes: number }[] {
  const sessions = getStudySessions();
  const result: { date: string; label: string; minutes: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

    const minutes = sessions
      .filter((s) => s.completedAt && s.completedAt.startsWith(dateStr))
      .reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);

    result.push({
      date: dateStr,
      label: dayLabel,
      minutes,
    });
  }

  return result;
}

export function getTopicBreakdown(): { topic: string; minutes: number; count: number }[] {
  const sessions = getStudySessions();
  const map = new Map<string, { minutes: number; count: number }>();

  for (const s of sessions) {
    const cleanTopic = s.topic.trim();
    const existing = map.get(cleanTopic) || { minutes: 0, count: 0 };
    existing.minutes += Number(s.durationMinutes) || 0;
    existing.count += 1;
    map.set(cleanTopic, existing);
  }

  return Array.from(map.entries())
    .map(([topic, data]) => ({ topic, ...data }))
    .sort((a, b) => b.minutes - a.minutes);
}
