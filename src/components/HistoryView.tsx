import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Trash2, RotateCcw, Calendar, Flame, BookOpen, CheckCircle2,
  BarChart2, FolderOpen, MoreVertical, X, CheckSquare, Square,
  Clock, ArrowUpRight, Shield, AlertTriangle, Filter, ChevronRight,
  Sparkles, Layers, ListFilter
} from 'lucide-react';
import { StudyTask, Subject, TimerSession, ExamResult, SubjectFile, UserStats, ActivityLogEntry } from '../types';
import { logActivityEvent } from '../utils/storage';

interface HistoryViewProps {
  taskHistory: StudyTask[];
  sessions: TimerSession[];
  subjects: Subject[];
  examResults?: ExamResult[];
  subjectFiles?: SubjectFile[];
  activityLog?: ActivityLogEntry[];
  stats?: UserStats;
  onRestoreTask: (task: StudyTask) => void;
  onDeleteHistoryTask: (taskId: string) => void;
  onClearHistory: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onClearSessions?: () => void;
  onDeleteLogEntries?: (ids: string[]) => void;
  onClearActivityLog?: (options?: { olderThanMs?: number; type?: string }) => void;
  onNavigate?: (section: 'syllabus' | 'timer' | 'tasks' | 'exams' | 'files' | 'history' | 'tutor') => void;
}

export interface ChromeHistoryItem {
  id: string;
  type: 'subtopic' | 'task' | 'session' | 'exam' | 'note' | 'general';
  title: string;
  subtitle?: string;
  subjectId?: string;
  subjectName?: string;
  timestamp: number;
  timeFormatted: string;
  dateKey: string;
  meta?: any;
  rawItem?: any;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  taskHistory,
  sessions,
  subjects,
  examResults = [],
  subjectFiles = [],
  activityLog = [],
  stats,
  onRestoreTask,
  onDeleteHistoryTask,
  onClearHistory,
  onDeleteSession,
  onClearSessions,
  onDeleteLogEntries,
  onClearActivityLog,
  onNavigate
}) => {
  // Navigation sidebar tab in Chrome style
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'yesterday' | 'subtopics' | 'tasks' | 'sessions' | 'exams'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  
  // Clear modal settings
  const [clearTimeRange, setClearTimeRange] = useState<'1h' | '24h' | '7d' | '4w' | 'all'>('all');
  const [clearCategories, setClearCategories] = useState({
    tasks: true,
    subtopics: true,
    sessions: true,
    exams: true,
    notes: true
  });

  // Dynamic live tick for relative time
  const [nowTick, setNowTick] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach(s => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Format Helpers
  const formatExactTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateKey = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDayHeader = (dateKey: string) => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString([], { weekday: 'long' });
    const monthName = dateObj.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

    if (dateKey === todayKey) {
      return `Today — ${dayName}, ${monthName}`;
    }
    if (dateKey === yesterdayKey) {
      return `Yesterday — ${dayName}, ${monthName}`;
    }
    return `${dayName}, ${monthName}`;
  };

  // Compile full unified history stream from activityLog + app state sources
  const allHistoryItems = useMemo(() => {
    const itemsMap = new Map<string, ChromeHistoryItem>();

    // 1. Explicit activityLog items
    activityLog.forEach(log => {
      const subj = log.subjectId ? subjectMap.get(log.subjectId) : undefined;
      itemsMap.set(log.id, {
        id: log.id,
        type: log.type,
        title: log.title,
        subtitle: log.subtitle,
        subjectId: log.subjectId,
        subjectName: log.subjectName || subj?.name,
        timestamp: log.timestamp,
        timeFormatted: formatExactTime(log.timestamp),
        dateKey: getDateKey(log.timestamp),
        meta: log.meta,
        rawItem: log
      });
    });

    // 2. Completed syllabus subtopics (100% or completed status)
    subjects.forEach(subj => {
      subj.subtopics.forEach(sub => {
        if (sub.progress === 100 || sub.status === 'completed') {
          const ts = sub.completedAt || subj.updatedAt || Date.now();
          const subId = `subtopic-${subj.id}-${sub.id}`;
          if (!itemsMap.has(subId)) {
            itemsMap.set(subId, {
              id: subId,
              type: 'subtopic',
              title: sub.title,
              subtitle: `Mastered syllabus topic (100%) in ${subj.name}`,
              subjectId: subj.id,
              subjectName: subj.name,
              timestamp: ts,
              timeFormatted: formatExactTime(ts),
              dateKey: getDateKey(ts),
              meta: { progress: 100, pastPapersDone: sub.pastPapersDone, confidence: sub.confidence },
              rawItem: sub
            });
          }
        }
      });
    });

    // 3. Completed task history
    taskHistory.forEach(task => {
      const ts = task.completedAt || task.createdAt;
      const taskId = `task-${task.id}`;
      const taskSubj = task.subjectId ? subjectMap.get(task.subjectId) : undefined;
      if (!itemsMap.has(taskId)) {
        itemsMap.set(taskId, {
          id: taskId,
          type: 'task',
          title: task.text,
          subtitle: `Completed daily checklist task${taskSubj ? ` • ${taskSubj.name}` : ''}`,
          subjectId: task.subjectId,
          subjectName: taskSubj?.name,
          timestamp: ts,
          timeFormatted: formatExactTime(ts),
          dateKey: getDateKey(ts),
          meta: { priority: task.priority, originalId: task.id },
          rawItem: task
        });
      }
    });

    // 4. Timer sessions
    sessions.forEach(sess => {
      const sessId = `session-${sess.id}`;
      const sessSubj = sess.subjectId ? subjectMap.get(sess.subjectId) : undefined;
      if (!itemsMap.has(sessId)) {
        itemsMap.set(sessId, {
          id: sessId,
          type: 'session',
          title: `${sess.durationMinutes}m Study Session`,
          subtitle: `${sess.mode === 'pomodoro' ? 'Pomodoro Focus' : sess.mode === 'stopwatch' ? 'Stopwatch Timer' : 'Break'}${sessSubj ? ` • ${sessSubj.name}` : ''}`,
          subjectId: sess.subjectId,
          subjectName: sessSubj?.name,
          timestamp: sess.completedAt,
          timeFormatted: formatExactTime(sess.completedAt),
          dateKey: getDateKey(sess.completedAt),
          meta: { durationMinutes: sess.durationMinutes, mode: sess.mode, originalId: sess.id },
          rawItem: sess
        });
      }
    });

    // 5. Exam results
    examResults.forEach(ex => {
      const examId = `exam-${ex.id}`;
      const examSubj = ex.subjectId ? subjectMap.get(ex.subjectId) : undefined;
      if (!itemsMap.has(examId)) {
        itemsMap.set(examId, {
          id: examId,
          type: 'exam',
          title: `${ex.examName} — ${ex.score}/${ex.maxScore} (${ex.percentage}%)`,
          subtitle: `Grade ${ex.grade} • ${ex.examType.replace('_', ' ').toUpperCase()}${examSubj ? ` • ${examSubj.name}` : ''}`,
          subjectId: ex.subjectId,
          subjectName: examSubj?.name,
          timestamp: ex.createdAt,
          timeFormatted: formatExactTime(ex.createdAt),
          dateKey: getDateKey(ex.createdAt),
          meta: { score: ex.score, maxScore: ex.maxScore, grade: ex.grade, percentage: ex.percentage, originalId: ex.id },
          rawItem: ex
        });
      }
    });

    // Sort descending by timestamp (newest first)
    const list = Array.from(itemsMap.values());
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [activityLog, subjects, taskHistory, sessions, examResults, subjectMap]);

  // Filter items based on active sidebar tab, search query, and subject dropdown
  const filteredItems = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    return allHistoryItems.filter(item => {
      // Sidebar category filter
      if (activeFilter === 'today' && item.dateKey !== todayKey) return false;
      if (activeFilter === 'yesterday' && item.dateKey !== yesterdayKey) return false;
      if (activeFilter === 'subtopics' && item.type !== 'subtopic') return false;
      if (activeFilter === 'tasks' && item.type !== 'task') return false;
      if (activeFilter === 'sessions' && item.type !== 'session') return false;
      if (activeFilter === 'exams' && item.type !== 'exam') return false;

      // Subject filter
      if (selectedSubjectId !== 'all' && item.subjectId !== selectedSubjectId) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle ? item.subtitle.toLowerCase().includes(q) : false;
        const matchesSubject = item.subjectName ? item.subjectName.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesSubtitle && !matchesSubject) return false;
      }

      return true;
    });
  }, [allHistoryItems, activeFilter, selectedSubjectId, searchQuery]);

  // Group items by date for Chrome history day buckets
  const groupedByDate = useMemo(() => {
    const groups: { dateKey: string; header: string; items: ChromeHistoryItem[] }[] = [];
    const dateMap = new Map<string, ChromeHistoryItem[]>();

    filteredItems.forEach(item => {
      if (!dateMap.has(item.dateKey)) {
        dateMap.set(item.dateKey, []);
      }
      dateMap.get(item.dateKey)!.push(item);
    });

    dateMap.forEach((items, dateKey) => {
      groups.push({
        dateKey,
        header: getDayHeader(dateKey),
        items
      });
    });

    return groups;
  }, [filteredItems]);

  // Multi-selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedItemIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Delete selected items
  const handleDeleteSelected = () => {
    if (selectedItemIds.size === 0) return;
    const idsToDelete = Array.from(selectedItemIds);

    // 1. Delete from custom activityLog if present
    if (onDeleteLogEntries) {
      onDeleteLogEntries(idsToDelete);
    }

    // 2. Cascade delete to corresponding task or session
    idsToDelete.forEach(id => {
      const target = allHistoryItems.find(i => i.id === id);
      if (target) {
        if (target.type === 'task' && target.meta?.originalId) {
          onDeleteHistoryTask(target.meta.originalId);
        } else if (target.type === 'session' && target.meta?.originalId && onDeleteSession) {
          onDeleteSession(target.meta.originalId);
        }
      }
    });

    setSelectedItemIds(new Set());
  };

  // Single item deletion
  const handleDeleteSingle = (item: ChromeHistoryItem) => {
    if (onDeleteLogEntries) {
      onDeleteLogEntries([item.id]);
    }
    if (item.type === 'task' && item.meta?.originalId) {
      onDeleteHistoryTask(item.meta.originalId);
    } else if (item.type === 'session' && item.meta?.originalId && onDeleteSession) {
      onDeleteSession(item.meta.originalId);
    }
  };

  // Execute Clear History Modal Action
  const handleExecuteClearModal = () => {
    let cutoffMs = 0;
    const now = Date.now();
    if (clearTimeRange === '1h') cutoffMs = 3600000;
    else if (clearTimeRange === '24h') cutoffMs = 86400000;
    else if (clearTimeRange === '7d') cutoffMs = 86400000 * 7;
    else if (clearTimeRange === '4w') cutoffMs = 86400000 * 28;

    if (clearCategories.tasks && onClearHistory) {
      onClearHistory();
    }
    if (clearCategories.sessions && onClearSessions) {
      onClearSessions();
    }
    if (onClearActivityLog) {
      onClearActivityLog({
        olderThanMs: cutoffMs > 0 ? cutoffMs : undefined
      });
    }

    setIsClearModalOpen(false);
    setSelectedItemIds(new Set());
  };

  // Type-specific Favicon & Colors (Exact Chrome UI Look)
  const getItemIcon = (type: ChromeHistoryItem['type']) => {
    switch (type) {
      case 'subtopic':
        return (
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <BookOpen className="w-3 h-3" />
          </div>
        );
      case 'task':
        return (
          <div className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        );
      case 'session':
        return (
          <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Flame className="w-3 h-3" />
          </div>
        );
      case 'exam':
        return (
          <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <BarChart2 className="w-3 h-3" />
          </div>
        );
      case 'note':
        return (
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <FolderOpen className="w-3 h-3" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-500/20">
            <Clock className="w-3 h-3" />
          </div>
        );
    }
  };

  const getSubjectPillColor = (subjectId?: string) => {
    if (!subjectId) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    const subj = subjectMap.get(subjectId);
    if (!subj) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    
    switch (subj.color) {
      case 'blue': return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'purple': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'rose': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'teal': return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'cyan': return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const hasSelection = selectedItemIds.size > 0;
  const isAllSelected = filteredItems.length > 0 && selectedItemIds.size === filteredItems.length;

  return (
    <div className="space-y-4">
      {/* 1. CHROME TOP APP BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Chrome Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Study History
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Chrome Style
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {allHistoryItems.length} logged study actions & achievements
              </p>
            </div>
          </div>

          {/* Search Box in Center/Right */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search study history..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Clear Browsing Data Button */}
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear study data...</span>
            </button>
          </div>
        </div>

        {/* Quick subject filter & live metrics strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Filter Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Subjects ({allHistoryItems.length})</option>
              {subjects.map(s => {
                const count = allHistoryItems.filter(i => i.subjectId === s.id).length;
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
            <span>•</span>
            <span>{filteredItems.length} matching events</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHROME LAYOUT (Sidebar + History Feed) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Chrome Left Navigation Sidebar */}
        <div className="md:col-span-3 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs h-fit">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            History Categories
          </div>

          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Chrome History (All)</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              activeFilter === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {allHistoryItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('today')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Today</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('yesterday')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'yesterday'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Yesterday</span>
            </div>
          </button>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          <button
            type="button"
            onClick={() => setActiveFilter('subtopics')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'subtopics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Syllabus Topics</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {allHistoryItems.filter(i => i.type === 'subtopic').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('tasks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'tasks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Completed Tasks</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {allHistoryItems.filter(i => i.type === 'task').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('sessions')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'sessions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-500" />
              <span>Timer Sessions</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {allHistoryItems.filter(i => i.type === 'session').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('exams')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'exams'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-500" />
              <span>Exam Scores</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {allHistoryItems.filter(i => i.type === 'exam').length}
            </span>
          </button>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer text-left"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear study data</span>
          </button>
        </div>

        {/* Chrome History Content Column */}
        <div className="md:col-span-9 space-y-4">
          {/* 3. CHROME SELECTION ACTION BAR (Appears when items are checked) */}
          {hasSelection && (
            <div className="sticky top-4 z-20 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="cursor-pointer hover:opacity-80"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-5 h-5 text-white" />
                  ) : (
                    <Square className="w-5 h-5 text-white/80" />
                  )}
                </button>
                <span className="text-sm font-bold">
                  {selectedItemIds.size} {selectedItemIds.size === 1 ? 'item' : 'items'} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItemIds(new Set())}
                  className="px-3 py-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 4. CHROME DATE-GROUPED TIMELINE CARDS */}
          {groupedByDate.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery ? 'No matching history entries found' : 'Your study history will appear here'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No study actions matched "${searchQuery}". Try searching for another topic or subject.`
                  : 'As you complete checklist tasks, master syllabus topics, and run study timers, all actions will be recorded here.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByDate.map(group => (
                <div
                  key={group.dateKey}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
                >
                  {/* Chrome Date Header */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/50 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {group.header}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  {/* Chrome History List Rows */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {group.items.map(item => {
                      const isSelected = selectedItemIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                          }`}
                        >
                          {/* Chrome Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleSelectItem(item.id)}
                            className="cursor-pointer text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          {/* Time Column */}
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono font-medium shrink-0 w-16">
                            {item.timeFormatted}
                          </span>

                          {/* Type Favicon */}
                          {getItemIcon(item.type)}

                          {/* Title & Domain/Subject Info */}
                          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <span 
                              className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                              title={item.title}
                              onClick={() => {
                                if (item.type === 'subtopic' && onNavigate) onNavigate('syllabus');
                                else if (item.type === 'task' && onNavigate) onNavigate('tasks');
                                else if (item.type === 'session' && onNavigate) onNavigate('timer');
                                else if (item.type === 'exam' && onNavigate) onNavigate('exams');
                              }}
                            >
                              {item.title}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.subjectName && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSubjectPillColor(item.subjectId)}`}>
                                  {item.subjectName}
                                </span>
                              )}
                              {item.subtitle && (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Row Action Buttons (Hover / Quick Action) */}
                          <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Restore task if it was a task */}
                            {item.type === 'task' && item.rawItem && (
                              <button
                                type="button"
                                onClick={() => onRestoreTask(item.rawItem)}
                                title="Restore task to active list"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Jump to syllabus if subtopic */}
                            {item.type === 'subtopic' && onNavigate && (
                              <button
                                type="button"
                                onClick={() => onNavigate('syllabus')}
                                title="View in syllabus"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete single history entry */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(item)}
                              title="Remove from history"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. CHROME "CLEAR BROWSING / STUDY DATA" MODAL */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Clear study data
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Time range selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Time range:
                </label>
                <select
                  value={clearTimeRange}
                  onChange={(e) => setClearTimeRange(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1h">Last hour</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="4w">Last 4 weeks</option>
                  <option value="all">All time</option>
                </select>
              </div>

              {/* Data Category Checkboxes */}
              <div className="space-y-2.5 pt-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Data to clear:
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={clearCategories.tasks}
                    onChange={(e) => setClearCategories(prev => ({ ...prev, tasks: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Completed checklist task records</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={clearCategories.sessions}
                    onChange={(e) => setClearCategories(prev => ({ ...prev, sessions: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Study focus timer logs & sessions</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={clearCategories.subtopics}
                    onChange={(e) => setClearCategories(prev => ({ ...prev, subtopics: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Activity log timeline events</span>
                </label>
              </div>

              <p className="text-slate-400 dark:text-slate-500 text-[11px] pt-1 leading-relaxed">
                Clearing history removes historical timeline entries. Your current active tasks and subject syllabus outlines remain safe.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteClearModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
              >
                Clear data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
