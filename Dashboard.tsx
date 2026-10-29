import { ActiveTab, DashboardStats } from '../types';
import { getStudyActivityByDay, getTopicBreakdown, getStudySessions } from '../services/storage';
import { Clock, CheckCircle2, Layers, Flame, ArrowRight, Play, PlusCircle, BookOpen, Calendar } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewCard?: () => void;
}

export default function Dashboard({ stats, setActiveTab, onOpenNewCard }: DashboardProps) {
  const activityDays = getStudyActivityByDay(7);
  const topicBreakdown = getTopicBreakdown();
  const recentSessions = getStudySessions().slice(0, 3);

  // Maximum minutes in the past 7 days for relative chart bar heights
  const maxDayMinutes = Math.max(...activityDays.map((d) => d.minutes), 30);

  // Daily target (e.g. 30 minutes goal for student)
  const dailyTargetMinutes = 45;
  const todayProgressPercent = Math.min(Math.round((stats.todayMinutes / dailyTargetMinutes) * 100), 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">
      {/* Welcome Hero Card */}
      <section className="bg-white rounded-3xl border border-[#E5DFD3] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#738970] tracking-wide uppercase">
              Study · Recall · Improve
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631]">
              Welcome to ActiveRecall
            </h1>
            <p className="text-sm sm:text-base text-[#2B3631]/75 max-w-xl">
              Reinforce your knowledge with high-intensity focused study intervals and active recall flashcards.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#738970] hover:bg-[#62785F] text-white text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Study Session</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('flashcards');
                onOpenNewCard?.();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F0] hover:bg-[#EFECE5] text-[#2B3631] border border-[#E5DFD3] text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#738970]" />
              <span>New Flashcard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Real-Data Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Study Minutes */}
        <div className="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#2B3631]/60 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Time</span>
            <Clock className="w-4 h-4 text-[#738970]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631] tabular-nums font-mono">
              {stats.totalMinutes}
              <span className="text-sm font-normal text-[#2B3631]/60 ml-1.5 font-sans">mins</span>
            </div>
            <div className="text-xs text-[#2B3631]/60 mt-1">
              {stats.totalMinutes >= 60
                ? `${(stats.totalMinutes / 60).toFixed(1)} hours logged`
                : 'Across all topics'}
            </div>
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#2B3631]/60 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-[#738970]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631] tabular-nums font-mono">
              {stats.completedSessionsCount}
            </div>
            <div className="text-xs text-[#2B3631]/60 mt-1">
              Completed study blocks
            </div>
          </div>
        </div>

        {/* Flashcards Created */}
        <div className="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#2B3631]/60 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Flashcards</span>
            <Layers className="w-4 h-4 text-[#738970]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631] tabular-nums font-mono">
              {stats.flashcardsCount}
            </div>
            <div className="text-xs text-[#2B3631]/60 mt-1">
              Cards in your study deck
            </div>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#2B3631]/60 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Study</span>
            <Flame className="w-4 h-4 text-[#738970]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631] tabular-nums font-mono">
              {stats.todayMinutes}
              <span className="text-sm font-normal text-[#2B3631]/60 ml-1.5 font-sans">mins</span>
            </div>
            <div className="w-full bg-[#FAF7F0] rounded-full h-2 mt-2 overflow-hidden border border-[#E5DFD3]">
              <div
                className="bg-[#738970] h-full rounded-full transition-all duration-500"
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content 2-Column Split: Visual Activity Chart + Topic Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Activity (Calculated strictly from saved sessions) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5DFD3] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2B3631]">
                Study Activity (Last 7 Days)
              </h2>
              <p className="text-xs text-[#2B3631]/60">
                Calculated from verified completed sessions
              </p>
            </div>
            <div className="text-xs font-medium text-[#738970]">
              {activityDays.reduce((acc, d) => acc + d.minutes, 0)} mins total this week
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-36">
              {activityDays.map((day) => {
                const heightPercent = maxDayMinutes > 0 ? Math.round((day.minutes / maxDayMinutes) * 100) : 0;
                const isToday = day.date === new Date().toISOString().split('T')[0];

                return (
                  <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip / value */}
                    <span className="text-[10px] sm:text-xs font-mono tabular-nums text-[#2B3631]/70 transition-opacity">
                      {day.minutes > 0 ? `${day.minutes}m` : '-'}
                    </span>
                    {/* Bar */}
                    <div className="w-full max-w-[36px] bg-[#FAF7F0] rounded-lg h-24 flex items-end p-0.5 border border-[#E5DFD3]/60">
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${
                          isToday ? 'bg-[#738970]' : 'bg-[#738970]/70'
                        }`}
                        style={{ height: `${Math.max(heightPercent, day.minutes > 0 ? 8 : 2)}%` }}
                      />
                    </div>
                    {/* Day label */}
                    <span
                      className={`text-xs font-medium ${
                        isToday ? 'text-[#738970] font-bold' : 'text-[#2B3631]/60'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#E5DFD3] pt-3 mt-2 flex items-center justify-between text-xs text-[#2B3631]/60">
            <span>Goal: {dailyTargetMinutes} mins daily</span>
            <button
              onClick={() => setActiveTab('history')}
              className="text-[#738970] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View full history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Topics & Quick Actions Column */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Topic Distribution Card */}
          <div className="bg-white rounded-3xl border border-[#E5DFD3] p-6 shadow-xs flex-1">
            <h2 className="text-base font-bold text-[#2B3631] mb-1">
              Top Study Topics
            </h2>
            <p className="text-xs text-[#2B3631]/60 mb-4">
              Breakdown by focus area
            </p>

            {topicBreakdown.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#2B3631]/60 space-y-2">
                <BookOpen className="w-7 h-7 mx-auto text-[#738970]/50" />
                <p>No study sessions recorded yet.</p>
                <p className="text-[11px] text-[#2B3631]/40">Start a timer to see your topic distribution.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topicBreakdown.slice(0, 4).map((t) => {
                  const percent = stats.totalMinutes > 0 ? Math.round((t.minutes / stats.totalMinutes) * 100) : 0;
                  return (
                    <div key={t.topic} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#2B3631] truncate max-w-[140px]">
                          {t.topic}
                        </span>
                        <span className="text-[#2B3631]/70 font-mono tabular-nums">
                          {t.minutes}m ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#FAF7F0] rounded-full h-1.5 overflow-hidden border border-[#E5DFD3]">
                        <div
                          className="bg-[#738970] h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('flashcards')}
              className="bg-white hover:bg-[#FAF7F0] border border-[#E5DFD3] rounded-2xl p-4 text-left transition-all active:scale-[0.98] cursor-pointer group"
            >
              <Layers className="w-5 h-5 text-[#738970] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-[#2B3631]">Practice Deck</div>
              <div className="text-[11px] text-[#2B3631]/60 mt-0.5">
                {stats.flashcardsCount} cards ready
              </div>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="bg-white hover:bg-[#FAF7F0] border border-[#E5DFD3] rounded-2xl p-4 text-left transition-all active:scale-[0.98] cursor-pointer group"
            >
              <Calendar className="w-5 h-5 text-[#738970] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-[#2B3631]">Study Log</div>
              <div className="text-[11px] text-[#2B3631]/60 mt-0.5">
                {stats.completedSessionsCount} sessions saved
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="bg-white rounded-3xl border border-[#E5DFD3] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#2B3631]">
              Recent Study Sessions
            </h2>
            <p className="text-xs text-[#2B3631]/60">
              Your latest completed focus blocks
            </p>
          </div>
          {recentSessions.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-[#738970] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({stats.completedSessionsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentSessions.length === 0 ? (
          <div className="py-8 text-center text-[#2B3631]/60 text-sm space-y-2">
            <Clock className="w-8 h-8 mx-auto text-[#738970]/40" />
            <p className="font-medium text-[#2B3631]">No study history yet</p>
            <p className="text-xs text-[#2B3631]/60 max-w-sm mx-auto">
              Start your first timed study session to track your learning progress and build consistency.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('timer')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#738970] text-white text-xs font-semibold rounded-xl hover:bg-[#62785F] transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start First Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E5DFD3]">
            {recentSessions.map((session) => (
              <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[#2B3631] truncate">
                    {session.topic}
                  </div>
                  <div className="text-xs text-[#2B3631]/60">
                    {new Date(session.completedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    ·{' '}
                    {new Date(session.completedAt).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-[#738970] bg-[#FAF7F0] border border-[#E5DFD3] px-2.5 py-1 rounded-lg tabular-nums font-mono">
                    {session.durationMinutes} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Architecture Disclaimer / Java Readiness Note */}
      <footer className="text-center text-xs text-[#2B3631]/50 pt-4">
        <span>ActiveRecall Frontend Prototype · Local Storage Engine · Java/Android API Ready</span>
      </footer>
    </div>
  );
}
