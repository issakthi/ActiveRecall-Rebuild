/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActiveTab, StudySession, Flashcard, DashboardStats } from './types';
import {
  getStudySessions,
  saveStudySession,
  deleteStudySession,
  clearAllStudySessions,
  getFlashcards,
  saveFlashcard,
  deleteFlashcard,
  loadSampleFlashcards,
  calculateDashboardStats,
} from './services/storage';

import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import StudyTimer from './components/StudyTimer';
import Flashcards from './components/Flashcards';
import StudyHistory from './components/StudyHistory';
import Toast, { ToastMessage } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMinutes: 0,
    completedSessionsCount: 0,
    flashcardsCount: 0,
    todayMinutes: 0,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification helper
  const addToast = (type: 'success' | 'info' | 'error', text: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize state with localStorage
  const refreshData = () => {
    const loadedSessions = getStudySessions();
    const loadedCards = getFlashcards();
    const calculatedStats = calculateDashboardStats();

    setSessions(loadedSessions);
    setFlashcards(loadedCards);
    setStats(calculatedStats);
  };

  // Initial load
  useEffect(() => {
    refreshData();
  }, []);

  // Handlers for Study Sessions
  const handleSessionComplete = (newSession: StudySession) => {
    saveStudySession({
      topic: newSession.topic,
      durationMinutes: newSession.durationMinutes,
      completedAt: newSession.completedAt,
    });
    refreshData();
    addToast('success', `Completed ${newSession.durationMinutes} min study session on "${newSession.topic}"!`);
  };

  const handleDeleteSession = (id: string) => {
    deleteStudySession(id);
    refreshData();
    addToast('info', 'Study session removed from history.');
  };

  const handleClearHistory = () => {
    clearAllStudySessions();
    refreshData();
    addToast('info', 'Study history cleared.');
  };

  // Handlers for Flashcards
  const handleAddFlashcard = (card: Omit<Flashcard, 'id' | 'createdAt'>) => {
    saveFlashcard(card);
    refreshData();
    addToast('success', 'New flashcard created and saved!');
  };

  const handleDeleteFlashcard = (id: string) => {
    deleteFlashcard(id);
    refreshData();
    addToast('info', 'Flashcard deleted.');
  };

  const handleLoadSampleCards = () => {
    loadSampleFlashcards();
    refreshData();
    addToast('success', '3 sample study flashcards added to your deck!');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#2B3631] flex flex-col font-sans selection:bg-[#738970]/30 selection:text-[#2B3631]">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Bar Navigation (Desktop) & Sticky App Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickStart={() => setActiveTab('timer')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            setActiveTab={setActiveTab}
            onOpenNewCard={() => setActiveTab('flashcards')}
          />
        )}

        {activeTab === 'timer' && (
          <StudyTimer
            onSessionComplete={handleSessionComplete}
            onNavigateHome={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'flashcards' && (
          <Flashcards
            cards={flashcards}
            onAddCard={handleAddFlashcard}
            onDeleteCard={handleDeleteFlashcard}
            onLoadSamples={handleLoadSampleCards}
          />
        )}

        {activeTab === 'history' && (
          <StudyHistory
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
            onClearHistory={handleClearHistory}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  );
}
