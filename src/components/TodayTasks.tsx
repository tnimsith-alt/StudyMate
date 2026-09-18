import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Sparkles, Filter, AlertCircle, History } from 'lucide-react';
import { StudyTask, Subject } from '../types';
import { soundFx } from '../utils/audio';

interface TodayTasksProps {
  tasks: StudyTask[];
  subjects: Subject[];
  onAddTask: (text: string, subjectId?: string, priority?: 'low' | 'medium' | 'high') => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompleted: () => void;
  onViewHistory?: () => void;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({
  tasks,
  subjects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  onViewHistory
}) => {
  const [taskText, setTaskText] = useState('');
  const [selectedSubjId, setSelectedSubjId] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const completedCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = taskText.trim();
    if (!clean) return;

    onAddTask(clean, selectedSubjId || undefined, priority);
    setTaskText('');
    soundFx.playTick();
  };

  const handleToggle = (id: string, currentDone: boolean) => {
    if (!currentDone) {
      soundFx.playSuccess();
    }
    onToggleTask(id);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  return (
    <div id="today-tasks-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs w-full">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            📅 Today's Study Targets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Break down daily goals and check them off as you progress
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <span className="text-[10px] sm:text-xs font-semibold uppercase text-slate-400 block">Today's Progress</span>
            <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
              {percentage}% ({completedCount}/{totalCount})
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
            )}

            {completedCount > 0 && (
              <button
                type="button"
                onClick={onClearCompleted}
                title="Archive completed tasks and clear from daily view"
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-4">
        <div
          className="h-full bg-blue-600 transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="new-task-text-input"
            type="text"
            placeholder="Add a study task, e.g. 'Pure Maths — Solve 2023 Integration questions'…"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSubjId}
              onChange={(e) => setSelectedSubjId(e.target.value)}
              className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">No subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              type="submit"
              disabled={!taskText.trim()}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            {filter === 'completed'
              ? 'No tasks completed yet today. Start your first session!'
              : filter === 'pending'
              ? 'All tasks completed! Great work for today.'
              : 'No study tasks added yet. Add your plan above!'}
          </div>
        ) : (
          filteredTasks.map(task => {
            const linkedSubject = subjects.find(s => s.id === task.subjectId);

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  task.done
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(task.id, task.done)}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium transition-all ${
                        task.done
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {task.text}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      {linkedSubject && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
                          {linkedSubject.name}
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                          High
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  title="Delete task"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
