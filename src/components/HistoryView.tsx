import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Search, Filter, Trash2, RotateCcw, 
  Calendar, Flame, BookOpen, AlertCircle, Sparkles, ArrowUpRight,
  Activity, BarChart2, FolderOpen, Radio, ChevronRight
} from 'lucide-react';
import { StudyTask, Subject, TimerSession, ExamResult, SubjectFile, UserStats } from '../types';

interface HistoryViewProps {
  taskHistory: StudyTask[];
  sessions: TimerSession[];
  subjects: Subject[];
  examResults?: ExamResult[];
  subjectFiles?: SubjectFile[];
  stats?: UserStats;
  onRestoreTask: (task: StudyTask) => void;
  onDeleteHistoryTask: (taskId: string) => void;
  onClearHistory: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onClearSessions?: () => void;
  onNavigate?: (section: 'syllabus' | 'timer' | 'tasks' | 'exams' | 'files' | 'history' | 'tutor') => void;
}

interface ActivityItem {
  id: string;
  type: 'task' | 'session' | 'exam' | 'file';
  title: string;
  subtitle?: string;
  subjectId?: string;
  timestamp: number;
  badgeText?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  rawItem?: any;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  taskHistory,
  sessions,
  subjects,
  examResults = [],
  subjectFiles = [],
  stats,
  onRestoreTask,
  onDeleteHistoryTask,
  onClearHistory,
  onDeleteSession,
  onClearSessions,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'tasks' | 'sessions' | 'exams'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [nowTick, setNowTick] = useState<number>(Date.now());

  // Live timer tick every 20 seconds to keep relative times like "Just now", "2m ago" fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.id, s));

  // Dynamic relative time calculator
  const getRelativeTime = (timestamp: number) => {
    const diff = Math.max(0, nowTick - timestamp);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 45) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatExactTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Build unified Live Activity Feed
  const liveActivities: ActivityItem[] = [];

  // 1. Tasks
  taskHistory.forEach(task => {
    const ts = task.completedAt || task.createdAt;
    liveActivities.push({
      id: `task-${task.id}`,
      type: 'task',
      title: task.text,
      subtitle: `Completed daily task (${task.priority} priority)`,
      subjectId: task.subjectId,
      timestamp: ts,
      badgeText: 'Task Done',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      rawItem: task
    });
  });

  // 2. Timer sessions
  sessions.forEach(sess => {
    liveActivities.push({
      id: `sess-${sess.id}`,
      type: 'session',
      title: `${sess.mode === 'pomodoro' ? 'Pomodoro Focus' : 'Study Timer Session'} (${sess.durationMinutes} mins)`,
      subtitle: `Logged ${sess.durationMinutes} minutes of focused study`,
      subjectId: sess.subjectId,
      timestamp: sess.completedAt,
      badgeText: `${sess.durationMinutes}m Study`,
      badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      rawItem: sess
    });
  });

  // 3. Exams
  examResults.forEach(ex => {
    liveActivities.push({
      id: `exam-${ex.id}`,
      type: 'exam',
      title: `${ex.examName} (${ex.percentage}% - Grade ${ex.grade})`,
      subtitle: `Scored ${ex.score}/${ex.maxScore} in ${ex.examType.replace('_', ' ')}`,
      subjectId: ex.subjectId,
      timestamp: ex.createdAt || new Date(ex.date).getTime(),
      badgeText: `Grade ${ex.grade}`,
      badgeColor: ex.percentage >= 75
        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      rawItem: ex
    });
  });

  // 4. Files
  subjectFiles.forEach(f => {
    liveActivities.push({
      id: `file-${f.id}`,
      type: 'file',
      title: f.name,
      subtitle: `Added file to ${f.category.replace('_', ' ')}`,
      subjectId: f.subjectId,
      timestamp: f.uploadedAt,
      badgeText: 'File Note',
      badgeColor: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      icon: <FolderOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      rawItem: f
    });
  });

  // Sort unified feed newest first
  liveActivities.sort((a, b) => b.timestamp - a.timestamp);

  // Filter live activities
  const filteredActivities = liveActivities.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubjectId === 'all' || item.subjectId === selectedSubjectId;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesSubject && matchesType;
  });

  // Filter tasks tab
  const filteredTasks = taskHistory.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectId === 'all' || task.subjectId === selectedSubjectId;
    return matchesSearch && matchesSubject;
  });

  // Filter sessions tab
  const filteredSessions = sessions.filter(sess => {
    const matchesSubject = selectedSubjectId === 'all' || sess.subjectId === selectedSubjectId;
    return matchesSubject;
  });

  // Metrics
  const totalCompletedTasks = taskHistory.length;
  const totalSessionMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalExamsRecorded = examResults.length;

  const getSubjectColorClasses = (subject?: Subject) => {
    if (!subject) return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    switch (subject.color) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Live Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Live Study History & Activity Log
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE SYNC
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time chronological timeline tracking all study timer sessions, completed tasks, and exam logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {taskHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your task history? Active tasks will remain untouched.")) {
                    onClearHistory();
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Task History</span>
              </button>
            )}
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 sm:pt-5">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Total Activities
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {liveActivities.length}
            </div>
            <span className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">
              Live logged events
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Tasks Done
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalCompletedTasks}
            </div>
            <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Completed items
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Study Focus
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {Math.floor(totalSessionMinutes / 60)}h {totalSessionMinutes % 60}m
            </div>
            <span className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">
              Across {sessions.length} sessions
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Exam Scores
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalExamsRecorded}
            </div>
            <span className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">
              Tests recorded
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Live Feed, Tasks, Sessions, Exams */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'feed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Feed ({liveActivities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Tasks History ({taskHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timer Rounds ({sessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Exam Logs ({examResults.length})</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search live history by title or keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {activeTab === 'feed' && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 sm:flex-none text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Activity Types</option>
              <option value="task">Tasks Only</option>
              <option value="session">Timer Sessions</option>
              <option value="exam">Exam Results</option>
              <option value="file">Files & Notes</option>
            </select>
          )}

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="flex-1 sm:flex-none text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: Live Unified Activity Stream */}
      {activeTab === 'feed' && (
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No activity records found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Complete tasks, run focus study timer rounds, or record exam results to see your live activity stream here!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredActivities.map((act) => {
                const subject = act.subjectId ? subjectMap.get(act.subjectId) : undefined;

                return (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {act.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                            {act.title}
                          </h4>
                          {act.badgeText && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${act.badgeColor}`}>
                              {act.badgeText}
                            </span>
                          )}
                        </div>

                        {act.subtitle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {act.subtitle}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {subject && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectColorClasses(subject)}`}>
                              {subject.name}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(act.timestamp)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {formatDate(act.timestamp)} at {formatExactTime(act.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons based on type */}
                    {act.type === 'task' && (
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => onRestoreTask(act.rawItem)}
                          title="Restore back to active daily list"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteHistoryTask(act.rawItem.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {act.type === 'session' && onDeleteSession && (
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => onDeleteSession(act.rawItem.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete session record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Completed Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No completed tasks found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Check off items on your Daily Tasks list to record them in your study history.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => {
                const subject = task.subjectId ? subjectMap.get(task.subjectId) : undefined;
                const ts = task.completedAt || task.createdAt;

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-through decoration-slate-400 dark:decoration-slate-500 break-words">
                          {task.text}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {subject && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectColorClasses(subject)}`}>
                              {subject.name}
                            </span>
                          )}

                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                            task.priority === 'high' 
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : task.priority === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {task.priority}
                          </span>

                          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(ts)} ({formatDate(ts)} at {formatExactTime(ts)})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => onRestoreTask(task)}
                        title="Restore back to active daily checklist"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Remove this task permanently from history?")) {
                            onDeleteHistoryTask(task.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
      )}

      {/* TAB 3: Focus Timer Rounds */}
      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No timer sessions logged yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Start a Pomodoro or study session in the Focus Timer tab to log your study minutes.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...filteredSessions].reverse().map(session => {
                const subject = session.subjectId ? subjectMap.get(session.subjectId) : undefined;
                return (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                        {session.durationMinutes}m
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {session.mode === 'pomodoro' ? '🍅 Pomodoro Focus Round' : '⏱️ Study Timer Session'}
                          </span>
                          {subject && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectColorClasses(subject)}`}>
                              {subject.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {getRelativeTime(session.completedAt)} • {formatDate(session.completedAt)} at {formatExactTime(session.completedAt)}
                        </span>
                      </div>
                    </div>

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete session record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Exam Logs */}
      {activeTab === 'exams' && (
        <div className="space-y-3">
          {examResults.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <BarChart2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No exam results recorded</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Log past papers, term test marks, and model exam scores in the Exam Results tab.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {examResults.map(ex => {
                const subject = subjectMap.get(ex.subjectId);
                return (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                        ex.percentage >= 75
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}>
                        {ex.grade}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {ex.examName}
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {ex.score}/{ex.maxScore} ({ex.percentage}%)
                          </span>
                          {subject && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectColorClasses(subject)}`}>
                              {subject.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Exam Date: {ex.date} • Recorded {getRelativeTime(ex.createdAt || Date.now())}
                        </span>
                      </div>
                    </div>

                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('exams')}
                        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      >
                        <span>View Analytics</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
