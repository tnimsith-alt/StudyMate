import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Volume2, VolumeX, Sparkles, CheckCircle2, Headphones } from 'lucide-react';
import { Subject, TimerSession } from '../types';
import { soundFx } from '../utils/audio';

interface StudyTimerProps {
  subjects: Subject[];
  activeSubjectId: string;
  onSessionCompleted: (session: TimerSession) => void;
  onClose?: () => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({
  subjects,
  activeSubjectId,
  onSessionCompleted
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'short_break' | 'long_break' | 'stopwatch'>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || (subjects[0]?.id || ''));
  const [isRunning, setIsRunning] = useState(false);
  
  // Durations in seconds
  const defaultDurations = {
    pomodoro: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
    stopwatch: 0
  };

  const [totalSeconds, setTotalSeconds] = useState(defaultDurations.pomodoro);
  const [secondsLeft, setSecondsLeft] = useState(defaultDurations.pomodoro);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientNoiseEnabled, setAmbientNoiseEnabled] = useState(false);
  const [sessionCompletedModal, setSessionCompletedModal] = useState<{ duration: number; subjectName: string } | null>(null);

  const intervalRef = useRef<number | null>(null);

  // Sync selected subject if prop changes and timer not running
  useEffect(() => {
    if (!isRunning && activeSubjectId) {
      setSelectedSubjectId(activeSubjectId);
    }
  }, [activeSubjectId, isRunning]);

  // Mode changes
  const handleModeChange = (newMode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      const dur = defaultDurations[newMode];
      setTotalSeconds(dur);
      setSecondsLeft(dur);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds(prev => prev + 1);
        } else {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              // Timer finished!
              finishTimer();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, totalSeconds]);

  const finishTimer = () => {
    setIsRunning(false);
    if (soundEnabled) {
      soundFx.playTimerFinish();
    }
    const durationMinutes = Math.round(totalSeconds / 60);
    const targetSubj = subjects.find(s => s.id === selectedSubjectId);

    if (mode === 'pomodoro' && durationMinutes > 0) {
      onSessionCompleted({
        id: 'session-' + Date.now(),
        subjectId: selectedSubjectId || undefined,
        durationMinutes,
        completedAt: Date.now(),
        mode: 'pomodoro'
      });
      setSessionCompletedModal({
        duration: durationMinutes,
        subjectName: targetSubj?.name || 'General Study'
      });
    }

    // Reset timer to full
    setSecondsLeft(totalSeconds);
  };

  const finishStopwatch = () => {
    setIsRunning(false);
    const minutes = Math.floor(stopwatchSeconds / 60);
    if (minutes > 0) {
      const targetSubj = subjects.find(s => s.id === selectedSubjectId);
      if (soundEnabled) soundFx.playSuccess();
      onSessionCompleted({
        id: 'session-' + Date.now(),
        subjectId: selectedSubjectId || undefined,
        durationMinutes: minutes,
        completedAt: Date.now(),
        mode: 'stopwatch'
      });
      setSessionCompletedModal({
        duration: minutes,
        subjectName: targetSubj?.name || 'General Study'
      });
    }
    setStopwatchSeconds(0);
  };

  const toggleTimer = () => {
    if (!isRunning && soundEnabled) {
      soundFx.playTick();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setSecondsLeft(totalSeconds);
    }
  };

  const addFiveMinutes = () => {
    if (mode !== 'stopwatch') {
      setTotalSeconds(prev => prev + 300);
      setSecondsLeft(prev => prev + 300);
    }
  };

  const setCustomMinutes = (mins: number) => {
    setIsRunning(false);
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
  };

  // Toggle ambient noise
  const toggleAmbient = () => {
    const next = !ambientNoiseEnabled;
    setAmbientNoiseEnabled(next);
    soundFx.toggleAmbientNoise(next);
  };

  // Cleanup ambient noise on unmount
  useEffect(() => {
    return () => {
      soundFx.toggleAmbientNoise(false);
    };
  }, []);

  // Format Time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentDisplaySeconds = mode === 'stopwatch' ? stopwatchSeconds : secondsLeft;
  const progressRatio = mode === 'stopwatch' 
    ? 1 
    : totalSeconds > 0 
      ? (totalSeconds - secondsLeft) / totalSeconds 
      : 0;

  // SVG Circle calculations
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div id="study-timer-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm w-full">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            ⏱️ Study Focus Timer
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track your focused revision intervals & log study hours
          </p>
        </div>

        {/* Mode Pills */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          <button
            id="timer-mode-pomodoro"
            type="button"
            onClick={() => handleModeChange('pomodoro')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            id="timer-mode-short-break"
            type="button"
            onClick={() => handleModeChange('short_break')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            id="timer-mode-long-break"
            type="button"
            onClick={() => handleModeChange('long_break')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
          <button
            id="timer-mode-stopwatch"
            type="button"
            onClick={() => handleModeChange('stopwatch')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
        {/* Subject tag selector */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tagging to:</span>
          <select
            id="timer-subject-select"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={isRunning}
            className="text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 max-w-[240px] truncate"
          >
            <option value="">General (No specific subject)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220">
            {/* Background circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Animated progress circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-700 ease-out ${
                mode === 'short_break' || mode === 'long_break'
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : mode === 'stopwatch'
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-500'
              }`}
            />
          </svg>

          {/* Centered digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums font-mono">
              {formatTime(currentDisplaySeconds)}
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mt-2">
              {isRunning 
                ? (mode === 'stopwatch' ? 'Counting up…' : 'Focus session active') 
                : 'Ready to study'}
            </span>
            {currentSubject && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                {currentSubject.name}
              </span>
            )}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="mt-8 flex items-center gap-3">
          <button
            id="timer-reset-btn"
            type="button"
            onClick={resetTimer}
            title="Reset timer"
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="timer-play-pause-btn"
            type="button"
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-md transition-all cursor-pointer transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{currentDisplaySeconds < totalSeconds ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>

          {mode === 'stopwatch' ? (
            <button
              id="timer-save-stopwatch-btn"
              type="button"
              onClick={finishStopwatch}
              title="Finish and log session"
              disabled={stopwatchSeconds < 60}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="timer-add-five-btn"
              type="button"
              onClick={addFiveMinutes}
              title="Add 5 minutes"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick presets & audio utilities */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {mode !== 'stopwatch' && (
            <div className="flex items-center gap-1.5 mr-3">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Presets:</span>
              {[15, 25, 45, 60].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setCustomMinutes(mins)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    totalSeconds === mins * 60
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          {/* Sound & Ambient Noise Toggles */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
            <button
              id="timer-audio-toggle"
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Timer chime enabled' : 'Timer chime muted'}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px] font-medium hidden sm:inline">Chime</span>
            </button>

            <button
              id="timer-ambient-toggle"
              type="button"
              onClick={toggleAmbient}
              title={ambientNoiseEnabled ? 'Turn off white noise' : 'Play focus background noise'}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                ambientNoiseEnabled
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden sm:inline">Focus Noise</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal / Notification */}
      {sessionCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Completed!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Well done! You logged <span className="font-semibold text-slate-900 dark:text-white">{sessionCompletedModal.duration} minutes</span> of deep study on <span className="font-semibold text-blue-600 dark:text-blue-400">{sessionCompletedModal.subjectName}</span>.
            </p>
            <button
              type="button"
              onClick={() => setSessionCompletedModal(null)}
              className="mt-5 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              Continue Studying
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
