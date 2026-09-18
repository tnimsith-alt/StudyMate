import React, { useState, useEffect, useCallback } from 'react';
import { 
  Flame, Clock, Sparkles, CheckCircle2, BookOpen, 
  BarChart2, Save, Download, Plus, Settings, ChevronRight, RotateCcw,
  History, FolderOpen, MoreVertical, Menu
} from 'lucide-react';
import { Subject, StudyTask, UserStats, TimerSession, ExamResult, SubjectFile, ActivityLogEntry } from './types';
import { 
  loadStoredSubjects, saveStoredSubjects, 
  loadStoredTasks, saveStoredTasks, 
  loadStoredStats, saveStoredStats,
  loadStoredSessions, saveStoredSessions,
  loadStoredTaskHistory, saveStoredTaskHistory,
  loadStoredExamResults, saveStoredExamResults,
  loadStoredSubjectFiles, saveStoredSubjectFiles,
  loadStoredActivityLog, saveStoredActivityLog, logActivityEvent,
  deleteActivityLogEntries, clearActivityLog,
  recordCompletedTask, deleteTaskFromHistory, clearTaskHistory,
  calculateSubjectProgress, DEFAULT_SUBJECTS, DEFAULT_TASKS, DEFAULT_STATS, DEFAULT_TASK_HISTORY,
  DEFAULT_EXAM_RESULTS, DEFAULT_SUBJECT_FILES
} from './utils/storage';
import { ThemeToggle } from './components/ThemeToggle';
import { SubjectTabs } from './components/SubjectTabs';
import { SubjectView } from './components/SubjectView';
import { StudyTimer } from './components/StudyTimer';
import { TodayTasks } from './components/TodayTasks';
import { AITutor } from './components/AITutor';
import { HistoryView } from './components/HistoryView';
import { SubjectModal } from './components/SubjectModal';
import { BackupModal } from './components/BackupModal';
import { SlideBarDrawer } from './components/SlideBarDrawer';
import { ExamResultsView } from './components/ExamResultsView';
import { SubjectFilesView } from './components/SubjectFilesView';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studymate_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to root and body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('studymate_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('studymate_theme', 'light');
    }
  }, [darkMode]);

  // Data states
  const [subjects, setSubjects] = useState<Subject[]>(() => loadStoredSubjects());
  const [tasks, setTasks] = useState<StudyTask[]>(() => loadStoredTasks());
  const [taskHistory, setTaskHistory] = useState<StudyTask[]>(() => loadStoredTaskHistory());
  const [sessions, setSessions] = useState<TimerSession[]>(() => loadStoredSessions());
  const [stats, setStats] = useState<UserStats>(() => loadStoredStats());
  const [examResults, setExamResults] = useState<ExamResult[]>(() => loadStoredExamResults());
  const [subjectFiles, setSubjectFiles] = useState<SubjectFile[]>(() => loadStoredSubjectFiles());
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => loadStoredActivityLog());

  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    const loaded = loadStoredSubjects();
    return loaded[0]?.id || '';
  });

  // UI state - initialized from URL parameters or hash for opening in new tab
  const [activeSection, setActiveSection] = useState<'syllabus' | 'timer' | 'tasks' | 'tutor' | 'history' | 'exams' | 'files'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') || params.get('view');
      const hashParam = window.location.hash.replace('#', '').toLowerCase();
      const target = tabParam || hashParam;
      if (target === 'exams' || target === 'files' || target === 'timer' || target === 'tasks' || target === 'history' || target === 'tutor') {
        return target as any;
      }
    } catch {
      // ignore
    }
    return 'syllabus';
  });

  // Sync URL query when active section changes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (activeSection === 'syllabus') {
        url.searchParams.delete('tab');
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('tab', activeSection);
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, [activeSection]);
  const [isSlideBarOpen, setIsSlideBarOpen] = useState<boolean>(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [savePillVisible, setSavePillVisible] = useState<boolean>(false);

  // Trigger brief save notification
  const triggerSaveIndicator = useCallback(() => {
    setSavePillVisible(true);
    const timer = setTimeout(() => setSavePillVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);


  // Update subjects
  const handleUpdateSubject = (updated: Subject) => {
    // Check if any subtopic was newly completed to log milestone
    const prevSubj = subjects.find(s => s.id === updated.id);
    if (prevSubj) {
      updated.subtopics.forEach(sub => {
        const prevSub = prevSubj.subtopics.find(ps => ps.id === sub.id);
        const isNowDone = (sub.progress === 100 || sub.status === 'completed');
        const wasDone = prevSub ? (prevSub.progress === 100 || prevSub.status === 'completed') : false;
        if (isNowDone && !wasDone) {
          logActivityEvent({
            type: 'subtopic',
            title: sub.title,
            subtitle: `Mastered syllabus topic (100%) in ${updated.name}`,
            subjectId: updated.id,
            subjectName: updated.name,
            meta: {
              progress: sub.progress,
              pastPapersDone: sub.pastPapersDone,
              confidence: sub.confidence
            }
          });
          setActivityLog(loadStoredActivityLog());
        }
      });
    }

    setSubjects(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s);
      saveStoredSubjects(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Add or edit subject from modal
  const handleSaveSubjectModal = (savedSubj: Subject) => {
    setSubjects(prev => {
      const exists = prev.some(s => s.id === savedSubj.id);
      let next: Subject[];
      if (exists) {
        next = prev.map(s => s.id === savedSubj.id ? savedSubj : s);
      } else {
        next = [...prev, savedSubj];
        setActiveSubjectId(savedSubj.id);
      }
      saveStoredSubjects(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Delete subject
  const handleDeleteSubject = (subjId: string) => {
    setSubjects(prev => {
      const next = prev.filter(s => s.id !== subjId);
      saveStoredSubjects(next);
      if (activeSubjectId === subjId) {
        setActiveSubjectId(next[0]?.id || '');
      }
      return next;
    });
    triggerSaveIndicator();
  };

  // Tasks handlers
  const handleAddTask = (text: string, subjectId?: string, priority?: 'low' | 'medium' | 'high') => {
    const newTask: StudyTask = {
      id: 'task-' + Date.now(),
      text,
      done: false,
      subjectId,
      priority: priority || 'medium',
      createdAt: Date.now()
    };
    setTasks(prev => {
      const next = [newTask, ...prev];
      saveStoredTasks(next);
      return next;
    });
    triggerSaveIndicator();
  };

  const handleToggleTask = (taskId: string) => {
    let newlyCompletedTask: StudyTask | null = null;

    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id === taskId) {
          const isDone = !t.done;
          const updated = { ...t, done: isDone, completedAt: isDone ? Date.now() : undefined };
          if (isDone) newlyCompletedTask = updated;
          return updated;
        }
        return t;
      });
      saveStoredTasks(next);
      return next;
    });

    // Record in history if completed
    if (newlyCompletedTask) {
      const taskObj: StudyTask = newlyCompletedTask;
      recordCompletedTask(taskObj);
      setTaskHistory(loadStoredTaskHistory());

      const taskSubj = subjects.find(s => s.id === taskObj.subjectId);
      logActivityEvent({
        type: 'task',
        title: taskObj.text,
        subtitle: `Completed daily task${taskSubj ? ` • ${taskSubj.name}` : ''}`,
        subjectId: taskObj.subjectId,
        subjectName: taskSubj?.name,
        meta: {
          originalId: taskObj.id,
          priority: taskObj.priority
        }
      });
      setActivityLog(loadStoredActivityLog());
    }

    // Update stats if newly completed
    setStats(prev => {
      const target = tasks.find(t => t.id === taskId);
      const isNowDone = target ? !target.done : false;
      const nextStats = {
        ...prev,
        tasksCompletedTotal: isNowDone ? prev.tasksCompletedTotal + 1 : Math.max(0, prev.tasksCompletedTotal - 1)
      };
      saveStoredStats(nextStats);
      return nextStats;
    });

    triggerSaveIndicator();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== taskId);
      saveStoredTasks(next);
      return next;
    });
    triggerSaveIndicator();
  };

  const handleClearCompletedTasks = () => {
    // Preserve completed tasks to history before removing from active daily view
    tasks.filter(t => t.done).forEach(t => {
      recordCompletedTask(t);
      const taskSubj = subjects.find(s => s.id === t.subjectId);
      logActivityEvent({
        type: 'task',
        title: t.text,
        subtitle: `Completed daily task${taskSubj ? ` • ${taskSubj.name}` : ''}`,
        subjectId: t.subjectId,
        subjectName: taskSubj?.name,
        meta: { originalId: t.id, priority: t.priority }
      });
    });
    setTaskHistory(loadStoredTaskHistory());
    setActivityLog(loadStoredActivityLog());

    setTasks(prev => {
      const next = prev.filter(t => !t.done);
      saveStoredTasks(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Task History Handlers
  const handleRestoreTask = (historyTask: StudyTask) => {
    const restored: StudyTask = {
      ...historyTask,
      id: 'task-restored-' + Date.now(),
      done: false,
      createdAt: Date.now()
    };

    setTasks(prev => {
      const next = [restored, ...prev];
      saveStoredTasks(next);
      return next;
    });

    triggerSaveIndicator();
  };

  const handleDeleteHistoryTask = (taskId: string) => {
    const updated = deleteTaskFromHistory(taskId);
    setTaskHistory(updated);
    triggerSaveIndicator();
  };

  const handleClearHistory = () => {
    clearTaskHistory();
    setTaskHistory([]);
    triggerSaveIndicator();
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== sessionId);
      saveStoredSessions(next);
      return next;
    });
    triggerSaveIndicator();
  };

  const handleClearSessions = () => {
    saveStoredSessions([]);
    setSessions([]);
    triggerSaveIndicator();
  };

  const handleDeleteLogEntries = (ids: string[]) => {
    const updated = deleteActivityLogEntries(ids);
    setActivityLog(updated);
    triggerSaveIndicator();
  };

  const handleClearActivityLog = (options?: { olderThanMs?: number; type?: string }) => {
    const updated = clearActivityLog(options);
    setActivityLog(updated);
    triggerSaveIndicator();
  };

  // Timer session completion
  const handleSessionCompleted = (session: TimerSession) => {
    // Add session to history
    const existing = loadStoredSessions();
    const nextSessions = [...existing, session];
    saveStoredSessions(nextSessions);
    setSessions(nextSessions);

    // Add minutes to subject if tagged
    const targetSubj = subjects.find(s => s.id === session.subjectId);
    if (session.subjectId) {
      setSubjects(prev => {
        const next = prev.map(s => {
          if (s.id === session.subjectId) {
            return { ...s, loggedMinutes: s.loggedMinutes + session.durationMinutes };
          }
          return s;
        });
        saveStoredSubjects(next);
        return next;
      });
    }

    // Log activity event
    logActivityEvent({
      type: 'session',
      title: `${session.durationMinutes}m Study Session`,
      subtitle: `${session.mode === 'pomodoro' ? 'Pomodoro Focus' : session.mode === 'stopwatch' ? 'Stopwatch Timer' : 'Break'}${targetSubj ? ` • ${targetSubj.name}` : ''}`,
      subjectId: session.subjectId,
      subjectName: targetSubj?.name,
      meta: {
        durationMinutes: session.durationMinutes,
        mode: session.mode,
        originalId: session.id
      }
    });
    setActivityLog(loadStoredActivityLog());

    // Update stats
    setStats(prev => {
      const next: UserStats = {
        ...prev,
        todayMinutesStudied: prev.todayMinutesStudied + session.durationMinutes,
        totalMinutesStudied: prev.totalMinutesStudied + session.durationMinutes
      };
      saveStoredStats(next);
      return next;
    });

    triggerSaveIndicator();
  };

  // Exam results handlers
  const handleAddExamResult = (result: Omit<ExamResult, 'id' | 'createdAt'>) => {
    const newResult: ExamResult = {
      ...result,
      id: 'exam-' + Date.now(),
      createdAt: Date.now()
    };
    setExamResults(prev => {
      const next = [newResult, ...prev];
      saveStoredExamResults(next);
      return next;
    });

    const examSubj = subjects.find(s => s.id === result.subjectId);
    logActivityEvent({
      type: 'exam',
      title: `${result.examName} — ${result.score}/${result.maxScore} (${result.percentage}%)`,
      subtitle: `Grade ${result.grade} • ${result.examType.replace('_', ' ').toUpperCase()}${examSubj ? ` • ${examSubj.name}` : ''}`,
      subjectId: result.subjectId,
      subjectName: examSubj?.name,
      meta: {
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        grade: result.grade,
        originalId: newResult.id
      }
    });
    setActivityLog(loadStoredActivityLog());

    triggerSaveIndicator();
  };

  const handleUpdateExamResult = (updated: ExamResult) => {
    setExamResults(prev => {
      const next = prev.map(r => r.id === updated.id ? updated : r);
      saveStoredExamResults(next);
      return next;
    });
    triggerSaveIndicator();
  };

  const handleDeleteExamResult = (id: string) => {
    setExamResults(prev => {
      const next = prev.filter(r => r.id !== id);
      saveStoredExamResults(next);
      return next;
    });
    triggerSaveIndicator();
  };

  const handleResetExamResults = () => {
    setExamResults([]);
    saveStoredExamResults([]);
    triggerSaveIndicator();
  };

  const handleRestoreDefaultExamResults = () => {
    setExamResults(DEFAULT_EXAM_RESULTS);
    saveStoredExamResults(DEFAULT_EXAM_RESULTS);
    triggerSaveIndicator();
  };

  const handleClearSubjectExamResults = (subjectId: string) => {
    setExamResults(prev => {
      const next = prev.filter(r => r.subjectId !== subjectId);
      saveStoredExamResults(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Subject files handlers
  const handleAddSubjectFile = (file: Omit<SubjectFile, 'id' | 'uploadedAt'>) => {
    const newFile: SubjectFile = {
      ...file,
      id: 'file-' + Date.now(),
      uploadedAt: Date.now()
    };
    setSubjectFiles(prev => {
      const next = [newFile, ...prev];
      saveStoredSubjectFiles(next);
      return next;
    });

    const fileSubj = subjects.find(s => s.id === file.subjectId);
    logActivityEvent({
      type: 'note',
      title: file.name,
      subtitle: `Uploaded ${file.category.replace('_', ' ')} resource${fileSubj ? ` • ${fileSubj.name}` : ''}`,
      subjectId: file.subjectId,
      subjectName: fileSubj?.name,
      meta: { category: file.category, size: file.size }
    });
    setActivityLog(loadStoredActivityLog());

    triggerSaveIndicator();
  };

  const handleDeleteSubjectFile = (fileId: string) => {
    setSubjectFiles(prev => {
      const next = prev.filter(f => f.id !== fileId);
      saveStoredSubjectFiles(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Restoring & resetting data
  const handleDataRestored = () => {
    const loadedSubs = loadStoredSubjects();
    setSubjects(loadedSubs);
    setTasks(loadStoredTasks());
    setTaskHistory(loadStoredTaskHistory());
    setSessions(loadStoredSessions());
    setStats(loadStoredStats());
    setExamResults(loadStoredExamResults());
    setSubjectFiles(loadStoredSubjectFiles());
    setActivityLog(loadStoredActivityLog());
    if (loadedSubs.length > 0) {
      setActiveSubjectId(loadedSubs[0].id);
    }
  };

  const handleResetDefaults = () => {
    saveStoredSubjects(DEFAULT_SUBJECTS);
    saveStoredTasks(DEFAULT_TASKS);
    saveStoredTaskHistory(DEFAULT_TASK_HISTORY);
    saveStoredSessions([]);
    saveStoredStats(DEFAULT_STATS);
    saveStoredExamResults(DEFAULT_EXAM_RESULTS);
    saveStoredSubjectFiles(DEFAULT_SUBJECT_FILES);
    saveStoredActivityLog([]);
    setSubjects(DEFAULT_SUBJECTS);
    setTasks(DEFAULT_TASKS);
    setTaskHistory(DEFAULT_TASK_HISTORY);
    setSessions([]);
    setStats(DEFAULT_STATS);
    setExamResults(DEFAULT_EXAM_RESULTS);
    setSubjectFiles(DEFAULT_SUBJECT_FILES);
    setActivityLog([]);
    setActiveSubjectId(DEFAULT_SUBJECTS[0].id);
    triggerSaveIndicator();
  };


  const handleResetStudyTime = () => {
    if (window.confirm("Reset your logged StudyTime? This will reset today's and overall recorded study minutes to 0.")) {
      const nextStats = {
        ...stats,
        todayMinutesStudied: 0,
        totalMinutesStudied: 0
      };
      setStats(nextStats);
      saveStoredStats(nextStats);
      triggerSaveIndicator();
    }
  };

  // Subject quick navigation
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  // Overall syllabus progress calculation
  const totalSubtopicsAll = subjects.reduce((sum, s) => sum + s.subtopics.length, 0);
  const overallMastery = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + calculateSubjectProgress(s), 0) / subjects.length)
    : 0;

  const todayTasksCompleted = tasks.filter(t => t.done).length;

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${darkMode ? 'dark ' : ''}bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200`}>
      {/* Top Navbar */}
      <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shadow-blue-500/20 shrink-0">
              📚
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  StudyMate LK
                </h1>
                <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shrink-0">
                  A/L Companion
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                Fully editable syllabus tracker, focus timer & AI tutor
              </p>
            </div>
          </div>

          {/* Quick Status Badges & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Auto-save status pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                savePillVisible
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 scale-105'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Save className="w-3 h-3" />
              <span>{savePillVisible ? 'Saved!' : 'Saved locally'}</span>
            </div>

            {/* Direct Download ZIP Link */}
            <a
              href="/api/download-project"
              download="StudyMate-LK.zip"
              title="Download Complete Project Code (.ZIP)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer text-decoration-none shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download ZIP</span>
            </a>

            {/* Backup & Export Modal Button */}
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              title="Backup & Data Management"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <ThemeToggle
              darkMode={darkMode}
              onToggle={() => setDarkMode(!darkMode)}
            />

            {/* Three-Dot Slide Bar Menu Button */}
            <button
              type="button"
              onClick={() => setIsSlideBarOpen(true)}
              title="Open Navigation Slide Bar"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <MoreVertical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>


      {/* Global Quick Metrics Dashboard Bar */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80 py-3 px-3 sm:px-6 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
              Overall Syllabus
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {overallMastery}%
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${overallMastery}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
              Today's Tasks
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todayTasksCompleted} / {tasks.length}
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate block">
              {tasks.length > 0 ? Math.round((todayTasksCompleted / tasks.length) * 100) : 0}% done today
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
                StudyTime
              </span>
              {(stats.todayMinutesStudied > 0 || stats.totalMinutesStudied > 0) && (
                <button
                  type="button"
                  onClick={handleResetStudyTime}
                  title="Reset StudyTime"
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-0.5 rounded-sm hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.todayMinutesStudied} mins
            </div>
            <span className="text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate block">
              {Math.floor(stats.totalMinutesStudied / 60)}h {stats.totalMinutesStudied % 60}m total logged
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
              Total Subtopics
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalSubtopicsAll} Topics
            </div>
            <span className="text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate block">
              Across {subjects.length} subjects
            </span>
          </div>
        </div>
      </section>

      {/* Main Section Navigation Pills (Clean Home Tabs) */}
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-2 w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveSection('syllabus')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeSection === 'syllabus'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Subjects & Subtopics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('timer')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeSection === 'timer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Focus Timer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('tasks')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeSection === 'tasks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Daily Tasks ({tasks.filter(t => !t.done).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeSection === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Live History ({taskHistory.length + sessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('tutor')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeSection === 'tutor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Tutor</span>
          </button>
        </div>
      </nav>


      {/* Tabs for each Subject (shown when in syllabus mode or timer mode) */}
      {activeSection === 'syllabus' && (
        <SubjectTabs
          subjects={subjects}
          activeSubjectId={activeSubjectId}
          onSelectSubject={(id) => setActiveSubjectId(id)}
          onAddSubject={() => {
            setEditingSubject(null);
            setIsSubjectModalOpen(true);
          }}
          onEditSubject={(subj) => {
            setEditingSubject(subj);
            setIsSubjectModalOpen(true);
          }}
        />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full">
        {activeSection === 'syllabus' && activeSubject && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left/Main Column: Active Subject View */}
            <div className="lg:col-span-8">
              <SubjectView
                subject={activeSubject}
                onUpdateSubject={handleUpdateSubject}
                onOpenTimerForSubject={(subjId) => {
                  setActiveSubjectId(subjId);
                  setActiveSection('timer');
                }}
                onAskAIAboutSubject={(subjectName, subtopicTitle) => {
                  setActiveSection('tutor');
                }}
                onEditSubjectDetails={(subj) => {
                  setEditingSubject(subj);
                  setIsSubjectModalOpen(true);
                }}
              />
            </div>

            {/* Right Column: Quick Timer Widget + Today's Targets preview */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Timer Preview Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Quick Focus Session
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('timer')}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Open Timer <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Ready to study <span className="font-semibold text-slate-800 dark:text-slate-200">{activeSubject.name}</span>? Start a 25m Pomodoro round to build your study streak.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection('timer')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Start 25m Pomodoro on {activeSubject.name}
                </button>
              </div>

              {/* Today's Tasks compact widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Today's Checklist
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('tasks')}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {tasks.slice(0, 4).map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t.id)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        readOnly
                        className="rounded-xs accent-blue-600"
                      />
                      <span className={`truncate flex-1 ${t.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {t.text}
                      </span>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No tasks yet.</p>
                  )}
                </div>
              </div>

              {/* AI Tutor shortcut */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm mb-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Ask StudyMate Tutor</span>
                </div>
                <p className="text-xs text-indigo-900/80 dark:text-indigo-200/70 leading-relaxed mb-3">
                  Get explanations in English or සිංහල for {activeSubject.name} theories, proofs, or past paper equations.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection('tutor')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Ask Tutor About {activeSubject.name}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exam Results & Performance Graph View */}
        {activeSection === 'exams' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <ExamResultsView
              subjects={subjects}
              examResults={examResults}
              onAddExamResult={handleAddExamResult}
              onUpdateExamResult={handleUpdateExamResult}
              onDeleteExamResult={handleDeleteExamResult}
              onResetExamResults={handleResetExamResults}
              onRestoreDefaultExamResults={handleRestoreDefaultExamResults}
              onClearSubjectExamResults={handleClearSubjectExamResults}
              onBackToSyllabus={() => setActiveSection('syllabus')}
              onAskAITutorAboutTopic={(subjectName, examNotes) => {
                setActiveSection('tutor');
              }}
            />
          </div>
        )}

        {/* Subject Files & Uploads View */}
        {activeSection === 'files' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <SubjectFilesView
              subjects={subjects}
              files={subjectFiles}
              onAddFile={handleAddSubjectFile}
              onDeleteFile={handleDeleteSubjectFile}
              onBackToSyllabus={() => setActiveSection('syllabus')}
            />
          </div>
        )}

        {/* Focus Timer View */}
        {activeSection === 'timer' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <StudyTimer
              subjects={subjects}
              activeSubjectId={activeSubjectId}
              onSessionCompleted={handleSessionCompleted}
            />
          </div>
        )}


        {/* Tasks View */}
        {activeSection === 'tasks' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <TodayTasks
              tasks={tasks}
              subjects={subjects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompletedTasks}
              onViewHistory={() => setActiveSection('history')}
            />
          </div>
        )}

        {/* Task & Study History View */}
        {activeSection === 'history' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <HistoryView
              taskHistory={taskHistory}
              sessions={sessions}
              subjects={subjects}
              examResults={examResults}
              subjectFiles={subjectFiles}
              activityLog={activityLog}
              stats={stats}
              onRestoreTask={handleRestoreTask}
              onDeleteHistoryTask={handleDeleteHistoryTask}
              onClearHistory={handleClearHistory}
              onDeleteSession={handleDeleteSession}
              onClearSessions={handleClearSessions}
              onDeleteLogEntries={handleDeleteLogEntries}
              onClearActivityLog={handleClearActivityLog}
              onNavigate={(sec) => setActiveSection(sec)}
            />
          </div>
        )}

        {/* AI Tutor View */}
        {activeSection === 'tutor' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <AITutor
              subjects={subjects}
              activeSubjectId={activeSubjectId}
            />
          </div>
        )}
      </main>

      {/* Edit/Create Subject Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubjectModal}
        onDelete={handleDeleteSubject}
        editingSubject={editingSubject}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={handleDataRestored}
        onResetDefaults={handleResetDefaults}
      />

      {/* Three-Dot Slide Bar Drawer Menu */}
      <SlideBarDrawer
        isOpen={isSlideBarOpen}
        onClose={() => setIsSlideBarOpen(false)}
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        onSelectSubject={(id) => setActiveSubjectId(id)}
        stats={stats}
        tasks={tasks}
        taskHistory={taskHistory}
        examResults={examResults}
        subjectFiles={subjectFiles}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenAddSubject={() => {
          setEditingSubject(null);
          setIsSubjectModalOpen(true);
        }}
      />
    </div>
  );
}

