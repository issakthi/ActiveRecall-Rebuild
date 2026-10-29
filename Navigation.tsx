import { ActiveTab } from '../types';
import { LayoutDashboard, Timer, Layers, History, Play } from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickStart?: () => void;
}

export default function Navigation({ activeTab, setActiveTab, onQuickStart }: NavigationProps) {
  const navItems: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'history', label: 'Study History', icon: History },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Bar (Adheres to Top Bar Contract: 3 zones separated by gap-8) */}
      <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E5DFD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Title Wordmark */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#738970] rounded-lg p-1 -ml-1 transition-transform active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#738970] flex items-center justify-center text-white font-bold text-base shadow-sm">
              AR
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2B3631] whitespace-nowrap shrink-0">
              ActiveRecall
            </span>
          </button>

          {/* Zone 2: Navigation Links (single-line, clean text tabs) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 text-sm font-medium ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#2B3631] shadow-xs border border-[#E5DFD3]'
                      : 'text-[#2B3631]/70 hover:text-[#2B3631] hover:bg-[#FFFFFF]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#738970]' : 'text-[#2B3631]/60'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {activeTab !== 'timer' ? (
              <button
                onClick={() => {
                  setActiveTab('timer');
                  onQuickStart?.();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#738970] hover:bg-[#62785F] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Session</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-[#2B3631]/60 hidden sm:inline-block">
                Focus Mode Active
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Optimized for Android / Mobile Thumb Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-t border-[#E5DFD3] pb-safe">
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
                  isActive ? 'text-[#738970]' : 'text-[#2B3631]/60 hover:text-[#2B3631]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                  {item.label === 'Study History' ? 'History' : item.label === 'Study Timer' ? 'Timer' : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
