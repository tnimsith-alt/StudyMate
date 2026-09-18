import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, Search, Filter, Trash2, RotateCcw, 
  Calendar, Flame, BookOpen, AlertCircle, Sparkles, ArrowUpRight
} from 'lucide-react';
import { StudyTask, Subject, TimerSession } from '../types';

interface HistoryViewProps {
  taskHistory: StudyTask[];
  sessions: TimerSession[];
  subjects: Subject[];
  onRestoreTask: (task: StudyTask) => void;
  onDeleteHistoryTask: (taskId: string) => void;
  onClearHistory: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onClearSessions?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  taskHistory,
  sessions,
  subjects,
  onRestoreTask,
  onDeleteHistoryTask,
  onClearHistory,
  onDeleteSession,
  onClearSessions
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'sessions'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.id, s));

  // Date helpers
  const isToday = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    return d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  };

  const isYesterday = (timestamp: number) => {
    const d = new Date(timestamp);
    const y = new Date(Date.now() - 86400000);
    return d.getDate() === y.getDate() &&
      d.getMonth() === y.getMonth() &&
      d.getFullYear() === y.getFullYear();
  };

  const isThisWeek = (timestamp: number) => {
    const now = Date.now();
    return now - timestamp < 7 * 86400000;
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter tasks
  const filteredTasks = taskHistory.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectId === 'all' || task.subjectId === selectedSubjectId;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesSubject && matchesPriority;
  });

  // Group filtered tasks by timeframe
  const todayTasks: StudyTask[] = [];
  const yesterdayTasks: StudyTask[] = [];
  const thisWeekTasks: StudyTask[] = [];
  const earlierTasks: StudyTask[] = [];

  filteredTasks.forEach(task => {
    const t = task.completedAt || task.createdAt;
    if (isToday(t)) {
      todayTasks.push(task);
    } else if (isYesterday(t)) {
      yesterdayTasks.push(task);
    } else if (isThisWeek(t)) {
      thisWeekTasks.push(task);
    } else {
      earlierTasks.push(task);
    }
  });

  // Summary Metrics
  const totalCompleted = taskHistory.length;
  const completedTodayCount = taskHistory.filter(t => isToday(t.completedAt || t.createdAt)).length;
  const totalSessionMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Subject color helper
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
      case 'cyan':
        return 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900';
      case 'teal':
        return 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const renderTaskCard = (task: StudyTask) => {
    const subject = task.subjectId ? subjectMap.get(task.subjectId) : undefined;
    const completedTimestamp = task.completedAt || task.createdAt;

    return (
      <div
        key={task.id}
        className="group p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                {isToday(completedTimestamp)
                  ? `Completed today at ${formatTime(completedTimestamp)}`
                  : `Completed ${formatDate(completedTimestamp)} at ${formatTime(completedTimestamp)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
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
              if (window.confirm("Remove this completed task permanently from history?")) {
                onDeleteHistoryTask(task.id);
              }
            }}
            title="Delete from history"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 w-full">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                📜 Study & Task History
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {totalCompleted} Completed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Review every task you have completed, check logged study sessions, or restore tasks to your active list.
            </p>
          </div>

          {taskHistory.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your entire task history? Active tasks will remain untouched.")) {
                  onClearHistory();
                }
              }}
              className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 sm:pt-5">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Total Done
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalCompleted}
            </div>
            <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Completed tasks
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Done Today
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {completedTodayCount}
            </div>
            <span className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">
              Today's completions
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Timer Sessions
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {sessions.length}
            </div>
            <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Recorded rounds
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Session Time
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {Math.floor(totalSessionMinutes / 60)}h {totalSessionMinutes % 60}m
            </div>
            <span className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">
              Total timer focus
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Tasks History vs Timer Sessions */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Tasks ({taskHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Focus Sessions Log ({sessions.length})</span>
        </button>
      </div>

      {/* Tab 1: Completed Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4 sm:space-y-5 w-full">
          {/* Filters and Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search completed tasks by keyword…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="flex-1 sm:flex-none text-xs px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="flex-1 sm:flex-none text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Grouped Tasks Lists */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No completed tasks found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || selectedSubjectId !== 'all' || selectedPriority !== 'all'
                  ? 'Try clearing your filters or search keywords.'
                  : 'Check off items on your Daily Tasks list to start building your completed tasks history!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Today */}
              {todayTasks.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Completed Today ({todayTasks.length})
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-2">
                    {todayTasks.map(renderTaskCard)}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {yesterdayTasks.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Completed Yesterday ({yesterdayTasks.length})
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-2">
                    {yesterdayTasks.map(renderTaskCard)}
                  </div>
                </div>
              )}

              {/* This Week */}
              {thisWeekTasks.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Earlier This Week ({thisWeekTasks.length})
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-2">
                    {thisWeekTasks.map(renderTaskCard)}
                  </div>
                </div>
              )}

              {/* Earlier */}
              {earlierTasks.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Previous Weeks ({earlierTasks.length})
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-2">
                    {earlierTasks.map(renderTaskCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Focus Sessions Log */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recorded Study Sessions
            </h3>
            {sessions.length > 0 && onClearSessions && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Clear all recorded timer session history?")) {
                    onClearSessions();
                  }
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Clear Session Logs
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No focus sessions logged yet. Complete a Pomodoro round or stopwatch session to record it here!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...sessions].reverse().map(session => {
                const subject = session.subjectId ? subjectMap.get(session.subjectId) : undefined;
                return (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        {session.durationMinutes}m
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {session.mode === 'pomodoro' ? '🍅 Pomodoro Focus' : '⏱️ Focus Session'}
                          </span>
                          {subject && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectColorClasses(subject)}`}>
                              {subject.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {formatDate(session.completedAt)} at {formatTime(session.completedAt)}
                        </span>
                      </div>
                    </div>

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                        title="Delete session"
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
    </div>
  );
};
