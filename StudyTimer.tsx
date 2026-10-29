import React, { useState, useEffect, useRef } from 'react';
import { StudySession } from '../types';
import { Play, Pause, Square, RotateCcw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface StudyTimerProps {
  onSessionComplete: (session: StudySession) => void;
  onNavigateHome: () => void;
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export default function StudyTimer({ onSessionComplete, onNavigateHome }: StudyTimerProps) {
  // Form inputs
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState<string>('25');

  // Validation errors
  const [topicError, setTopicError] = useState<string | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);

  // Timer states
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [totalInitialSeconds, setTotalInitialSeconds] = useState<number>(25 * 60);
  const [lastCompletedSession, setLastCompletedSession] = useState<StudySession | null>(null);

  const timerRef = useRef<number | null>(null);

  // Play pleasant completion chime using Web Audio API (safe, offline-capable, hermetic)
  const playCompletionSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
      });
    } catch {
      // Audio playback blocked or unsupported, fail silently
    }
  };

  // Preset durations
  const presetOptions = [15, 25, 45, 60];

  const handleSelectPreset = (mins: number) => {
    if (status !== 'idle') return;
    setDurationMinutes(mins);
    setCustomDuration(String(mins));
    setDurationError(null);
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDuration(val);
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 240) {
      setDurationError('Please enter a duration between 1 and 240 minutes');
    } else {
      setDurationError(null);
      setDurationMinutes(parsed);
    }
  };

  // Timer Tick Hook
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  // Validation before starting
  const validate = (): boolean => {
    let isValid = true;
    if (!topic.trim()) {
      setTopicError('Study topic is required');
      isValid = false;
    } else {
      setTopicError(null);
    }

    const mins = parseInt(customDuration, 10);
    if (isNaN(mins) || mins < 1 || mins > 240) {
      setDurationError('Duration must be between 1 and 240 minutes');
      isValid = false;
    } else {
      setDurationError(null);
      setDurationMinutes(mins);
    }

    return isValid;
  };

  // Start
  const handleStart = () => {
    if (!validate()) return;
    const initialSeconds = durationMinutes * 60;
    setTotalInitialSeconds(initialSeconds);
    setSecondsRemaining(initialSeconds);
    setStatus('running');
  };

  // Pause
  const handlePause = () => {
    if (status === 'running') {
      setStatus('paused');
    }
  };

  // Resume
  const handleResume = () => {
    if (status === 'paused') {
      setStatus('running');
    }
  };

  // Finish: records session as completed with topic, duration, and date.
  const handleCompleteSession = (fromTimerExpiry = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Determine logged minutes: if timer naturally finished, use planned durationMinutes;
    // if user clicked Finish, determine actual elapsed time or full duration (minimum 1 minute)
    const elapsedSeconds = totalInitialSeconds - secondsRemaining;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const finalMinutes = fromTimerExpiry ? durationMinutes : Math.min(elapsedMinutes, durationMinutes);

    const savedSession: StudySession = {
      id: `session_${Date.now()}`,
      topic: topic.trim(),
      durationMinutes: finalMinutes,
      completedAt: new Date().toISOString(),
    };

    onSessionComplete(savedSession);
    setLastCompletedSession(savedSession);
    setStatus('completed');
    playCompletionSound();
  };

  // Abandon / Reset: does NOT count as completed!
  const handleReset = () => {
    if (status === 'running' || status === 'paused') {
      const confirmDiscard = window.confirm(
        'Discard this study session? Unfinished sessions will not be recorded in your history.'
      );
      if (!confirmDiscard) return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatus('idle');
    setSecondsRemaining(durationMinutes * 60);
    setLastCompletedSession(null);
  };

  const handleStartNewSession = () => {
    setStatus('idle');
    setTopic('');
    setSecondsRemaining(durationMinutes * 60);
    setLastCompletedSession(null);
  };

  // Time format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressRatio = totalInitialSeconds > 0 ? (totalInitialSeconds - secondsRemaining) / totalInitialSeconds : 0;
  const strokeDashoffset = 283 - 283 * progressRatio;

  return (
    <div className="max-w-xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631]">
          Focus Study Timer
        </h1>
        <p className="text-xs sm:text-sm text-[#2B3631]/70">
          Eliminate distractions, focus deeply, and cement your knowledge.
        </p>
      </div>

      {/* Main Study Card */}
      <div className="bg-white rounded-3xl border border-[#E5DFD3] p-6 sm:p-8 shadow-xs">
        {status === 'completed' && lastCompletedSession ? (
          /* Session Completed Success State */
          <div className="text-center py-6 space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-[#738970]/15 rounded-full flex items-center justify-center mx-auto text-[#738970]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#738970] uppercase tracking-wider">
                Session Completed
              </span>
              <h2 className="text-2xl font-bold text-[#2B3631]">Great Focus!</h2>
              <p className="text-sm text-[#2B3631]/80 max-w-sm mx-auto">
                You logged <strong className="font-semibold text-[#2B3631]">{lastCompletedSession.durationMinutes} minutes</strong> studying{' '}
                <strong className="font-semibold text-[#2B3631]">"{lastCompletedSession.topic}"</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E5DFD3] text-xs text-[#2B3631]/70 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#738970]" />
              <span>Session saved to your Study History and Dashboard stats</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleStartNewSession}
                className="px-6 py-3 bg-[#738970] hover:bg-[#62785F] text-white font-semibold text-sm rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                Start Another Session
              </button>
              <button
                onClick={onNavigateHome}
                className="px-6 py-3 bg-[#FAF7F0] hover:bg-[#EFECE5] text-[#2B3631] border border-[#E5DFD3] font-semibold text-sm rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Active Timer & Form Controls */
          <div className="space-y-6">
            {/* Input Controls (Editable when idle) */}
            <div className="space-y-4">
              {/* Topic Field */}
              <div>
                <label htmlFor="topic-input" className="block text-xs font-bold uppercase tracking-wider text-[#2B3631] mb-1.5">
                  Study Topic <span className="text-red-600">*</span>
                </label>
                <input
                  id="topic-input"
                  type="text"
                  placeholder="e.g. Organic Chemistry, Algorithms, History Unit 3"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (topicError) setTopicError(null);
                  }}
                  disabled={status !== 'idle'}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#738970]/30 ${
                    topicError
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-[#E5DFD3] bg-[#FAF7F0]/50 focus:bg-white'
                  } ${status !== 'idle' ? 'opacity-80 cursor-not-allowed' : ''}`}
                />
                {topicError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{topicError}</span>
                  </p>
                )}
              </div>

              {/* Duration Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="custom-duration-input" className="block text-xs font-bold uppercase tracking-wider text-[#2B3631]">
                    Duration (Minutes) <span className="text-red-600">*</span>
                  </label>
                  {status === 'idle' && (
                    <span className="text-xs text-[#2B3631]/60">1 – 240 mins</span>
                  )}
                </div>

                {status === 'idle' ? (
                  <div className="space-y-3">
                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-2">
                      {presetOptions.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => handleSelectPreset(mins)}
                          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                            durationMinutes === mins && customDuration === String(mins)
                              ? 'bg-[#738970] text-white border-[#738970] shadow-xs'
                              : 'bg-[#FAF7F0] hover:bg-[#EFECE5] text-[#2B3631] border-[#E5DFD3]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    {/* Custom Input */}
                    <div className="flex items-center gap-2">
                      <input
                        id="custom-duration-input"
                        type="number"
                        min="1"
                        max="240"
                        value={customDuration}
                        onChange={handleCustomDurationChange}
                        className="w-24 px-3 py-2 rounded-xl border border-[#E5DFD3] text-sm font-mono text-center bg-[#FAF7F0]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#738970]/30"
                      />
                      <span className="text-xs text-[#2B3631]/70">custom duration in minutes</span>
                    </div>

                    {durationError && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{durationError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#2B3631]/70 bg-[#FAF7F0] px-3 py-2 rounded-xl border border-[#E5DFD3] inline-block">
                    Session target: <strong className="text-[#2B3631] font-semibold">{durationMinutes} minutes</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Circular Countdown Display */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="text-[#FAF7F0] stroke-current"
                    strokeWidth="6"
                    fill="none"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="text-[#738970] stroke-current transition-all duration-300"
                    strokeWidth="6"
                    strokeDasharray="283"
                    strokeDashoffset={status === 'idle' ? 0 : strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                {/* Inner Timer Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-[#2B3631] tabular-nums">
                    {formatTime(secondsRemaining)}
                  </div>
                  <div className="text-xs font-medium text-[#2B3631]/60 mt-1 uppercase tracking-wider">
                    {status === 'idle'
                      ? 'Ready to Focus'
                      : status === 'running'
                      ? 'Session In Progress'
                      : 'Session Paused'}
                  </div>
                  {topic.trim() && (
                    <div className="text-xs font-semibold text-[#738970] mt-1 max-w-[170px] truncate">
                      {topic}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timer Control Buttons */}
            <div className="space-y-3">
              {status === 'idle' && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full min-h-[50px] py-3.5 bg-[#738970] hover:bg-[#62785F] text-white text-base font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Study Session</span>
                </button>
              )}

              {status === 'running' && (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handlePause}
                    className="min-h-[48px] py-3 bg-[#FAF7F0] hover:bg-[#EFECE5] text-[#2B3631] border border-[#E5DFD3] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteSession(false)}
                    className="min-h-[48px] py-3 bg-[#738970] hover:bg-[#62785F] text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Finish</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[48px] py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                </div>
              )}

              {status === 'paused' && (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleResume}
                    className="min-h-[48px] py-3 bg-[#738970] hover:bg-[#62785F] text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteSession(false)}
                    className="min-h-[48px] py-3 bg-[#FAF7F0] hover:bg-[#EFECE5] text-[#2B3631] border border-[#E5DFD3] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-[#738970]" />
                    <span>Finish</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[48px] py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helpful Study Advice Card */}
      <div className="p-4 bg-white/70 rounded-2xl border border-[#E5DFD3] text-xs text-[#2B3631]/75 space-y-1">
        <div className="font-semibold text-[#2B3631]">Active Recall Study Protocol:</div>
        <p>
          Before looking at your notes, try to write down everything you remember about <span className="font-medium">{topic.trim() || 'your topic'}</span> from scratch. Retrieval practice strengthens memory retention up to 50% more than re-reading.
        </p>
      </div>
    </div>
  );
}
