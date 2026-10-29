import { useState } from 'react';
import { StudySession, ActiveTab } from '../types';
import { Clock, Calendar, Trash2, Search, Play, ArrowUpDown } from 'lucide-react';

interface StudyHistoryProps {
  sessions: StudySession[];
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function StudyHistory({
  sessions,
  onDeleteSession,
  onClearHistory,
  setActiveTab,
}: StudyHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'duration'>('newest');

  // Filtered sessions
  const filteredSessions = sessions.filter((s) =>
    s.topic.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Sorted sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    }
    if (sortOrder === 'oldest') {
      return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    }
    if (sortOrder === 'duration') {
      return b.durationMinutes - a.durationMinutes;
    }
    return 0;
  });

  // Total study time calculation
  const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const handleConfirmClear = () => {
    if (sessions.length === 0) return;
    const confirmed = window.confirm(
      'Are you sure you want to clear your entire study history? This action cannot be undone.'
    );
    if (confirmed) {
      onClearHistory();
    }
  };

  const handleConfirmDelete = (id: string, topic: string) => {
    const confirmed = window.confirm(`Delete record for "${topic}"?`);
    if (confirmed) {
      onDeleteSession(id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Header and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631]">
            Study History
          </h1>
          <p className="text-xs sm:text-sm text-[#2B3631]/70">
            Log of all completed focus sessions and verified time spent.
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={handleConfirmClear}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Aggregate Time Banner (Real Calculated Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-xs">
          <div className="text-xs text-[#2B3631]/60 font-medium">Total Cumulative Time</div>
          <div className="text-xl sm:text-2xl font-bold text-[#2B3631] tabular-nums font-mono mt-1">
            {totalMinutes} <span className="text-xs font-sans text-[#2B3631]/60">mins</span>
          </div>
          <div className="text-[11px] text-[#2B3631]/50 mt-0.5">
            {totalHours} total hours logged
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-xs">
          <div className="text-xs text-[#2B3631]/60 font-medium">Sessions Recorded</div>
          <div className="text-xl sm:text-2xl font-bold text-[#2B3631] tabular-nums font-mono mt-1">
            {sessions.length}
          </div>
          <div className="text-[11px] text-[#2B3631]/50 mt-0.5">
            Completed study blocks
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-[#2B3631]/60 font-medium">Average Session</div>
          <div className="text-xl sm:text-2xl font-bold text-[#738970] tabular-nums font-mono mt-1">
            {sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0}{' '}
            <span className="text-xs font-sans text-[#2B3631]/60">mins</span>
          </div>
          <div className="text-[11px] text-[#2B3631]/50 mt-0.5">
            Consistent focus intervals
          </div>
        </div>
      </div>

      {/* Search and Sort Filter Bar */}
      {sessions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-[#2B3631]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by topic name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E5DFD3] bg-white text-xs text-[#2B3631] focus:outline-none focus:ring-2 focus:ring-[#738970]/30 placeholder:text-[#2B3631]/40"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[#2B3631]/70">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#738970]" />
            <span className="font-medium">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'duration')}
              aria-label="Sort study sessions"
              className="bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs text-[#2B3631] focus:outline-none focus:ring-2 focus:ring-[#738970]/30 cursor-pointer"
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>
      )}

      {/* Sessions List or Empty State */}
      {sessions.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E5DFD3] p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F0] rounded-2xl flex items-center justify-center mx-auto text-[#738970] border border-[#E5DFD3]">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h2 className="text-lg font-bold text-[#2B3631]">No study history yet</h2>
            <p className="text-xs sm:text-sm text-[#2B3631]/70">
              When you complete a study session in the Study Timer, it will automatically appear here with exact dates, durations, and topics.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('timer')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#738970] hover:bg-[#62785F] text-white text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Your First Study Session</span>
            </button>
          </div>
        </div>
      ) : sortedSessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5DFD3] p-8 text-center text-xs text-[#2B3631]/60">
          No study sessions found matching "{searchQuery}".
        </div>
      ) : (
        /* List of Completed Sessions */
        <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-xs overflow-hidden divide-y divide-[#E5DFD3]">
          {sortedSessions.map((session) => {
            const dateObj = new Date(session.completedAt);
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = dateObj.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F0]/40 transition-colors"
              >
                {/* Left: Topic and Date */}
                <div className="space-y-1 min-w-0">
                  <div className="text-base font-bold text-[#2B3631] truncate">
                    {session.topic}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#2B3631]/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#738970]" />
                      <span>{formattedDate}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formattedTime}</span>
                  </div>
                </div>

                {/* Right: Duration badge and delete action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DFD3]/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#2B3631] bg-[#FAF7F0] border border-[#E5DFD3] px-3 py-1.5 rounded-xl font-mono tabular-nums">
                      {session.durationMinutes} minutes
                    </span>
                  </div>

                  <button
                    onClick={() => handleConfirmDelete(session.id, session.topic)}
                    className="p-2 text-[#2B3631]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete session record"
                    aria-label={`Delete record for ${session.topic}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
