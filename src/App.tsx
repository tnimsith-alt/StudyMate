import React, { useState, useEffect, useCallback } from 'react';
import { 
  Flame, Clock, Sparkles, CheckCircle2, BookOpen, 
  BarChart2, Save, Download, Plus, Settings, ChevronRight, RotateCcw,
  History, FolderOpen, MoreVertical, Menu, X, ArrowDown, ArrowUp, ArrowRight,
  Layers, CheckSquare, GraduationCap
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: BookOpen },
  { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { id: 'timer', label: 'Timer', icon: Clock },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { id: 'exams', label: 'Exams', icon: BarChart2 },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'history', label: 'History', icon: History },
  { id: 'tutor', label: 'AI Tutor', icon: Sparkles }
];

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

  // Navigation states
  const [activeNav, setActiveNav] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isSlideBarOpen, setIsSlideBarOpen] = useState<boolean>(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [savePillVisible, setSavePillVisible] = useState<boolean>(false);

  // Smooth scroll helper for anchor links
  const scrollToSection = useCallback((sectionId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      try {
        window.history.pushState(null, '', `#${sectionId}`);
      } catch {
        // ignore
      }
      setActiveNav(sectionId);
    }
  }, []);

  // Scroll spy to highlight active section in sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['home', 'syllabus', 'timer', 'tasks', 'exams', 'files', 'history', 'tutor'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveNav(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle initial hash on page load (e.g. #timer, #exams)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          setActiveNav(hash);
        }, 150);
      }
    }
  }, []);

  // Real-time synchronization helper for cross-tab and multi-window live updates
  const broadcastSync = useCallback((event?: string) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('studymate_realtime_sync');
        bc.postMessage({ event: event || 'DATA_CHANGED', timestamp: Date.now() });
        bc.close();
      }
    } catch {
      // BroadcastChannel unavailable
    }
  }, []);

  // Trigger brief save notification & broadcast to other tabs in real-time
  const triggerSaveIndicator = useCallback(() => {
    setSavePillVisible(true);
    broadcastSync('UPDATE');
    const timer = setTimeout(() => setSavePillVisible(false), 1500);
    return () => clearTimeout(timer);
  }, [broadcastSync]);

  // Real-time listener for multi-tab and multi-window synchronization
  useEffect(() => {
    const handleSyncFromOtherTab = () => {
      setSubjects(loadStoredSubjects());
      setTasks(loadStoredTasks());
      setTaskHistory(loadStoredTaskHistory());
      setSessions(loadStoredSessions());
      setStats(loadStoredStats());
      setExamResults(loadStoredExamResults());
      setSubjectFiles(loadStoredSubjectFiles());
      setActivityLog(loadStoredActivityLog());
    };

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('studymate_realtime_sync');
        channel.onmessage = () => {
          handleSyncFromOtherTab();
        };
      } catch {
        // BroadcastChannel unavailable
      }
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('studymate_')) {
        handleSyncFromOtherTab();
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
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
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const willBeDone = !targetTask.done;

    if (willBeDone) {
      // Completed!
      const completedTask: StudyTask = {
        ...targetTask,
        done: true,
        completedAt: Date.now()
      };
      
      // 1. Move to Task History
      recordCompletedTask(completedTask);
      setTaskHistory(loadStoredTaskHistory());

      // 2. Remove from active tasks
      const remainingTasks = tasks.filter(t => t.id !== taskId);
      setTasks(remainingTasks);
      saveStoredTasks(remainingTasks);

      // 3. Update UserStats
      const updatedStats: UserStats = {
        ...stats,
        tasksCompletedTotal: stats.tasksCompletedTotal + 1
      };
      setStats(updatedStats);
      saveStoredStats(updatedStats);

      // 4. Log to Live Chrome Activity Stream
      const subj = targetTask.subjectId ? subjects.find(s => s.id === targetTask.subjectId) : undefined;
      logActivityEvent({
        type: 'task',
        title: targetTask.text,
        subtitle: `Task completed${subj ? ` in ${subj.name}` : ''}`,
        subjectId: targetTask.subjectId,
        subjectName: subj?.name,
        meta: { priority: targetTask.priority, originalId: targetTask.id }
      });
      setActivityLog(loadStoredActivityLog());

      triggerSaveIndicator();
    } else {
      // Uncheck task
      setTasks(prev => {
        const next = prev.map(t => t.id === taskId ? { ...t, done: false } : t);
        saveStoredTasks(next);
        return next;
      });
      triggerSaveIndicator();
    }
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
    setTasks(prev => {
      const next = prev.filter(t => !t.done);
      saveStoredTasks(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Restore task from history back to active tasks
  const handleRestoreTask = (task: StudyTask) => {
    const restored: StudyTask = {
      ...task,
      done: false,
      completedAt: undefined
    };
    // Add to active tasks
    setTasks(prev => {
      const next = [restored, ...prev.filter(t => t.id !== task.id)];
      saveStoredTasks(next);
      return next;
    });
    // Remove from history
    const updatedHistory = deleteTaskFromHistory(task.id);
    setTaskHistory(updatedHistory);
    triggerSaveIndicator();
  };

  const handleDeleteHistoryTask = (taskId: string) => {
    const updatedHistory = deleteTaskFromHistory(taskId);
    setTaskHistory(updatedHistory);
    triggerSaveIndicator();
  };

  const handleClearHistory = () => {
    clearTaskHistory();
    setTaskHistory([]);
    triggerSaveIndicator();
  };

  // Delete single session from history
  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== sessionId);
      saveStoredSessions(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Clear all timer sessions from history
  const handleClearSessions = () => {
    setSessions([]);
    saveStoredSessions([]);
    triggerSaveIndicator();
  };

  // Activity Log handlers for HistoryView
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

  // Timer sessions
  const handleSessionCompleted = (session: TimerSession) => {
    // 1. Add session
    setSessions(prev => {
      const next = [session, ...prev];
      saveStoredSessions(next);
      return next;
    });

    // 2. Add minutes to targeted subject
    if (session.subjectId) {
      setSubjects(prev => {
        const next = prev.map(s => {
          if (s.id === session.subjectId) {
            return {
              ...s,
              loggedMinutes: s.loggedMinutes + session.durationMinutes,
              updatedAt: Date.now()
            };
          }
          return s;
        });
        saveStoredSubjects(next);
        return next;
      });
    }

    // 3. Update global user stats
    const today = new Date().toISOString().split('T')[0];
    const prevDate = stats.lastStudyDate;
    let newStreak = stats.streak;

    if (prevDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (prevDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const nextStats: UserStats = {
      ...stats,
      streak: newStreak,
      lastStudyDate: today,
      todayMinutesStudied: stats.todayMinutesStudied + session.durationMinutes,
      totalMinutesStudied: stats.totalMinutesStudied + session.durationMinutes
    };
    setStats(nextStats);
    saveStoredStats(nextStats);

    // 4. Log to Live Chrome Activity Stream
    const subj = session.subjectId ? subjects.find(s => s.id === session.subjectId) : undefined;
    logActivityEvent({
      type: 'session',
      title: `${session.durationMinutes}m Study Session`,
      subtitle: `${session.mode === 'pomodoro' ? 'Pomodoro Focus' : 'Stopwatch'} completed${subj ? ` in ${subj.name}` : ''}`,
      subjectId: session.subjectId,
      subjectName: subj?.name,
      meta: {
        durationMinutes: session.durationMinutes,
        mode: session.mode,
        originalId: session.id
      }
    });
    setActivityLog(loadStoredActivityLog());

    triggerSaveIndicator();
  };

  // Exam Results handlers
  const handleAddExamResult = (res: Omit<ExamResult, 'id' | 'createdAt'>) => {
    const newResult: ExamResult = {
      ...res,
      id: 'exam-' + Date.now(),
      createdAt: Date.now()
    };
    setExamResults(prev => {
      const next = [newResult, ...prev];
      saveStoredExamResults(next);
      return next;
    });

    // Log to Live Chrome Activity Stream
    const subj = subjects.find(s => s.id === newResult.subjectId);
    logActivityEvent({
      type: 'exam',
      title: `${newResult.examName} — ${newResult.score}/${newResult.maxScore} (${newResult.percentage}%)`,
      subtitle: `Recorded grade ${newResult.grade} in ${subj?.name || 'General Subject'}`,
      subjectId: newResult.subjectId,
      subjectName: subj?.name,
      meta: {
        score: newResult.score,
        maxScore: newResult.maxScore,
        grade: newResult.grade,
        percentage: newResult.percentage,
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

  const handleDeleteExamResult = (resultId: string) => {
    setExamResults(prev => {
      const next = prev.filter(r => r.id !== resultId);
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

  const handleClearSubjectExamResults = (subjectId: string) => {
    setExamResults(prev => {
      const next = prev.filter(r => r.subjectId !== subjectId);
      saveStoredExamResults(next);
      return next;
    });
    triggerSaveIndicator();
  };

  // Subject Files handlers
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

    // Log to Live Chrome Activity Stream
    const subj = subjects.find(s => s.id === newFile.subjectId);
    logActivityEvent({
      type: 'note',
      title: `Saved Resource: ${newFile.name}`,
      subtitle: `${newFile.category.toUpperCase().replace('_', ' ')} document added to ${subj?.name || 'Subject Library'}`,
      subjectId: newFile.subjectId,
      subjectName: subj?.name,
      meta: {
        fileType: newFile.type,
        size: newFile.size,
        originalId: newFile.id
      }
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
    if (loadedSubs.length > 0 && !loadedSubs.some(s => s.id === activeSubjectId)) {
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
    setActiveSubjectId(DEFAULT_SUBJECTS[0]?.id || '');
    triggerSaveIndicator();
  };

  // Reset StudyTime for global stats
  const handleResetStudyTime = () => {
    const updated: UserStats = {
      ...stats,
      todayMinutesStudied: 0,
      totalMinutesStudied: 0
    };
    setStats(updated);
    saveStoredStats(updated);
    triggerSaveIndicator();
  };

  // Active Subject for Syllabus View
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  // Overall syllabus progress calculation
  const totalSubtopicsAll = subjects.reduce((sum, s) => sum + s.subtopics.length, 0);
  const overallMastery = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + calculateSubjectProgress(s), 0) / subjects.length)
    : 0;

  const todayTasksCompleted = tasks.filter(t => t.done).length;

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${darkMode ? 'dark ' : ''}bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200`}>
      
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shadow-blue-500/20 group-hover:bg-blue-500 transition-colors shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight block leading-tight">
                StudyMate
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
                Personal Workspace
              </span>
            </div>
          </button>

          {/* Desktop Anchor Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-semibold">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Study Streak Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{stats.streak}d streak</span>
            </div>

            {/* Auto-save notification pill */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                savePillVisible
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 scale-105'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Save className="w-3 h-3 text-emerald-500" />
              <span>{savePillVisible ? 'Saved!' : 'Saved locally'}</span>
            </div>

            {/* Direct Download ZIP Link */}
            <a
              href="/api/download-project"
              download="StudyMate-LK.zip"
              title="Download Complete Project Code (.ZIP)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer text-decoration-none shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ZIP</span>
            </a>

            {/* Backup & Export Modal Button */}
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              title="Backup & Export Data"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <ThemeToggle
              darkMode={darkMode}
              onToggle={() => setDarkMode(!darkMode)}
            />

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeNav === item.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </a>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {stats.streak} day study streak
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBackupModalOpen(true);
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Backup & Restore
              </button>
            </div>
          </div>
        )}
      </header>


      {/* 2. CLEAN HOMEPAGE HERO SECTION */}
      <section id="home" className="scroll-mt-20 py-16 sm:py-24 lg:py-28 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            <span>Personal Academic Workspace</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>A/L & Advanced Curriculum</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Master your curriculum. <br className="hidden sm:inline" />
            <span className="text-blue-600 dark:text-blue-400">Focus deeper, track exams,</span> <br className="hidden sm:inline" />
            and build momentum.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            A distraction-free, privacy-first study workspace. Track your syllabus topic by topic, time deep Pomodoro focus sessions, analyze exam performance, and review your live activity stream.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('syllabus')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer group"
            >
              <span>Explore Syllabus & Topics</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('timer')}
              className="px-5 py-3.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Start Focus Timer</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('tasks')}
              className="px-5 py-3.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Daily Checklist</span>
            </button>
          </div>

          {/* 4 Feature Pillars Grid */}
          <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div 
              onClick={() => scrollToSection('syllabus')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-100 dark:border-blue-900">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">
                Syllabus Mastery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Add custom subtopics, track past paper questions, and log progress to 100%.
              </p>
            </div>

            <div 
              onClick={() => scrollToSection('timer')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-100 dark:border-blue-900">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">
                Focus Timer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Pomodoro intervals and stopwatch modes with audio chimes that auto-record study time.
              </p>
            </div>

            <div 
              onClick={() => scrollToSection('exams')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-100 dark:border-amber-900">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 transition-colors">
                Exam Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Track unit tests and term papers with percentage curves and letter grade analysis.
              </p>
            </div>

            <div 
              onClick={() => scrollToSection('history')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-100 dark:border-emerald-900">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">
                Chrome History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Live unified activity timeline capturing completed topics, sessions, and tasks in real time.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 3. GLOBAL QUICK METRICS DASHBOARD STRIP */}
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


      {/* 4. MAIN CONTINUOUS SCROLLING SECTIONS CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-20">

        {/* SECTION: SYLLABUS & TOPICS */}
        <section id="syllabus" className="scroll-mt-20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/60 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Syllabus & Subject Topics
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track curriculum coverage, add subtopics, and monitor mastery
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingSubject(null);
                setIsSubjectModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          {/* Subject Tabs */}
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

          {activeSubject && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Active Subject Topics View */}
              <div className="lg:col-span-8">
                <SubjectView
                  subject={activeSubject}
                  onUpdateSubject={handleUpdateSubject}
                  onOpenTimerForSubject={(subjId) => {
                    setActiveSubjectId(subjId);
                    scrollToSection('timer');
                  }}
                  onAskAIAboutSubject={(subjectName, subtopicTitle) => {
                    scrollToSection('tutor');
                  }}
                  onEditSubjectDetails={(subj) => {
                    setEditingSubject(subj);
                    setIsSubjectModalOpen(true);
                  }}
                />
              </div>

              {/* Right Column: Quick Timer + Today's Targets preview */}
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
                      onClick={() => scrollToSection('timer')}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Open Timer <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Ready to study <span className="font-semibold text-slate-800 dark:text-slate-200">{activeSubject.name}</span>? Start a 25m Pomodoro round to build your study streak.
                  </p>
                  <button
                    type="button"
                    onClick={() => scrollToSection('timer')}
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
                      onClick={() => scrollToSection('tasks')}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
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
                    Get explanations in English or සිංහල for {activeSubject.name} theories, proofs, or equations.
                  </p>
                  <button
                    type="button"
                    onClick={() => scrollToSection('tutor')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Ask Tutor About {activeSubject.name}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>


        {/* SECTION: FOCUS TIMER */}
        <section id="timer" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/60 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Focus Timer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pomodoro technique & stopwatch intervals with audio feedback
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <StudyTimer
              subjects={subjects}
              activeSubjectId={activeSubjectId}
              onSessionCompleted={handleSessionCompleted}
            />
          </div>
        </section>


        {/* SECTION: DAILY TASKS */}
        <section id="tasks" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-900/60 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Daily Tasks & Checklist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize your study goals, set priority levels, and track completions
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <TodayTasks
              tasks={tasks}
              subjects={subjects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompletedTasks}
              onViewHistory={() => scrollToSection('history')}
            />
          </div>
        </section>


        {/* SECTION: EXAM RESULTS & PERFORMANCE */}
        <section id="exams" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-900/60 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Exam Results & Performance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record test scores, calculate letter grades, and visualize performance trends
              </p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <ExamResultsView
              subjects={subjects}
              examResults={examResults}
              onAddExamResult={handleAddExamResult}
              onUpdateExamResult={handleUpdateExamResult}
              onDeleteExamResult={handleDeleteExamResult}
              onResetExamResults={handleResetExamResults}
              onClearSubjectExamResults={handleClearSubjectExamResults}
              onBackToSyllabus={() => scrollToSection('syllabus')}
              onAskAITutorAboutTopic={(subjectName, examNotes) => {
                scrollToSection('tutor');
              }}
            />
          </div>
        </section>


        {/* SECTION: SUBJECT FILES & PAST PAPERS */}
        <section id="files" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-900/60 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Past Papers & Subject Files
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Store past papers, marking schemes, summaries, and lecture notes
              </p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <SubjectFilesView
              subjects={subjects}
              files={subjectFiles}
              onAddFile={handleAddSubjectFile}
              onDeleteFile={handleDeleteSubjectFile}
              onBackToSyllabus={() => scrollToSection('syllabus')}
            />
          </div>
        </section>


        {/* SECTION: CHROME-STYLE STUDY HISTORY */}
        <section id="history" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/60 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Chrome-Style Study History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time chronological activity stream of study sessions, topics, and marks
              </p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
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
              onNavigate={(sec) => scrollToSection(sec)}
            />
          </div>
        </section>


        {/* SECTION: AI TUTOR */}
        <section id="tutor" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-900/60 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                AI Study Tutor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask questions, clarify difficult concepts, and get step-by-step problem breakdowns
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <AITutor
              subjects={subjects}
              activeSubjectId={activeSubjectId}
            />
          </div>
        </section>
      </main>


      {/* 5. MINIMALIST MODERN FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                StudyMate LK
              </span>
              <p className="text-xs text-slate-400">
                Personal Study Workspace · Offline-first, privacy preserved
              </p>
            </div>
          </div>

          {/* Quick Anchor Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Back to top button */}
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Back to Top</span>
          </button>
        </div>
      </footer>


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

      {/* Slide Bar Drawer Menu */}
      <SlideBarDrawer
        isOpen={isSlideBarOpen}
        onClose={() => setIsSlideBarOpen(false)}
        activeSection={activeNav as any}
        onSelectSection={(sec) => scrollToSection(sec)}
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
