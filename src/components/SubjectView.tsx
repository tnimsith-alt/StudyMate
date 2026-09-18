import React, { useState } from 'react';
import { 
  Plus, Search, CheckCircle2, Clock, Trash2, Edit3, 
  ChevronDown, ChevronUp, Star, BookOpen, 
  Sparkles, FileText, Check, AlertCircle, ArrowUpRight, RotateCcw
} from 'lucide-react';
import { Subject, Subtopic } from '../types';
import { calculateSubjectProgress } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface SubjectViewProps {
  subject: Subject;
  onUpdateSubject: (updated: Subject) => void;
  onOpenTimerForSubject: (subjectId: string) => void;
  onAskAIAboutSubject: (subjectName: string, subtopicTitle?: string) => void;
  onEditSubjectDetails: (subject: Subject) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subject,
  onUpdateSubject,
  onOpenTimerForSubject,
  onAskAIAboutSubject,
  onEditSubjectDetails,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [editingSubtopicId, setEditingSubtopicId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const overallProgress = calculateSubjectProgress(subject);
  const totalSubtopics = subject.subtopics.length;
  const completedCount = subject.subtopics.filter(s => s.progress === 100).length;

  // Add new subtopic
  const handleAddSubtopic = (e: React.FormEvent) => {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title) return;

    const newSub: Subtopic = {
      id: 'sub-' + Date.now(),
      title,
      status: 'not_started',
      progress: 0,
      confidence: 3,
      pastPapersDone: 0,
      notes: ''
    };

    const updated = {
      ...subject,
      subtopics: [...subject.subtopics, newSub],
      updatedAt: Date.now()
    };

    onUpdateSubject(updated);
    setQuickTitle('');
    soundFx.playSuccess();
  };

  // Update single subtopic
  const handleUpdateSubtopic = (subId: string, updates: Partial<Subtopic>) => {
    const updatedSubtopics = subject.subtopics.map(s => {
      if (s.id === subId) {
        const merged = { ...s, ...updates };
        // Sync status if progress changed
        if (updates.progress !== undefined) {
          if (updates.progress === 100) merged.status = 'completed';
          else if (updates.progress > 0) merged.status = 'in_progress';
          else merged.status = 'not_started';
        }
        return merged;
      }
      return s;
    });

    onUpdateSubject({
      ...subject,
      subtopics: updatedSubtopics,
      updatedAt: Date.now()
    });
  };

  // Toggle status shortcut
  const handleCycleStatus = (subtopic: Subtopic) => {
    let nextProgress = 0;
    if (subtopic.progress === 0) nextProgress = 50;
    else if (subtopic.progress < 100) nextProgress = 100;
    else nextProgress = 0;

    handleUpdateSubtopic(subtopic.id, { progress: nextProgress });
    if (nextProgress === 100) soundFx.playSuccess();
    else soundFx.playTick();
  };

  // Delete subtopic
  const handleDeleteSubtopic = (subId: string, title: string) => {
    if (window.confirm(`Delete subtopic "${title}"?`)) {
      const remaining = subject.subtopics.filter(s => s.id !== subId);
      onUpdateSubject({
        ...subject,
        subtopics: remaining,
        updatedAt: Date.now()
      });
    }
  };

  // Inline title edit
  const startEditing = (sub: Subtopic) => {
    setEditingSubtopicId(sub.id);
    setEditTitle(sub.title);
  };

  const saveEditing = (subId: string) => {
    if (editTitle.trim()) {
      handleUpdateSubtopic(subId, { title: editTitle.trim() });
    }
    setEditingSubtopicId(null);
  };

  // Filter and search
  const filteredSubtopics = subject.subtopics.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (filter === 'completed') return s.progress === 100;
    if (filter === 'in_progress') return s.progress > 0 && s.progress < 100;
    if (filter === 'not_started') return s.progress === 0;
    return true;
  });

  return (
    <div id="subject-view-root" className="space-y-6 w-full">
      {/* Subject Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {subject.category} Stream
              </span>
              <span className="text-xs text-slate-400">
                {totalSubtopics} Subtopics
              </span>
            </div>
            
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {subject.name}
              <button
                type="button"
                onClick={() => onEditSubjectDetails(subject)}
                title="Edit subject name and settings"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </h1>

            {subject.notes && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                {subject.notes}
              </p>
            )}
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-center min-w-[110px] sm:min-w-[130px]">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block font-medium">StudyTime</span>
                {subject.loggedMinutes > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Reset StudyTime for "${subject.name}" to 0?`)) {
                        onUpdateSubject({ ...subject, loggedMinutes: 0, updatedAt: Date.now() });
                      }
                    }}
                    title="Reset StudyTime to 0"
                    className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-0.5 rounded-sm hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {Math.floor(subject.loggedMinutes / 60)}h {subject.loggedMinutes % 60}m
              </span>
            </div>

            <button
              id={`start-timer-subj-${subject.id}`}
              type="button"
              onClick={() => onOpenTimerForSubject(subject.id)}
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Start Timer</span>
            </button>

            <button
              type="button"
              onClick={() => onAskAIAboutSubject(subject.name)}
              className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Overall Subject Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Syllabus Mastery
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {overallProgress}% ({completedCount} / {totalSubtopics} completed)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-600 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subtopics Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subtopics or notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {(['all', 'in_progress', 'completed', 'not_started'] as const).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer whitespace-nowrap ${
                filter === key
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {key.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Subtopic Form */}
      <form onSubmit={handleAddSubtopic} className="flex flex-col sm:flex-row gap-2">
        <input
          id="quick-add-subtopic-input"
          type="text"
          placeholder="Add new subtopic, e.g. 'Diffraction & Polarisation of Light'…"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subtopic</span>
        </button>
      </form>

      {/* Subtopics List */}
      <div className="space-y-3">
        {filteredSubtopics.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="font-medium text-slate-700 dark:text-slate-300">No subtopics found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try clearing your search query' : 'Add your first subtopic using the input above!'}
            </p>
          </div>
        ) : (
          filteredSubtopics.map((sub, index) => {
            const isNotesExpanded = expandedNotesId === sub.id;
            const isEditing = editingSubtopicId === sub.id;

            return (
              <div
                key={sub.id}
                id={`subtopic-card-${sub.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Main Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Checkmark / Cycle Status button + Title */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleCycleStatus(sub)}
                      title={`Current progress: ${sub.progress}%. Click to cycle status.`}
                      className={`mt-0.5 sm:mt-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${
                        sub.progress === 100
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : sub.progress > 0
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 dark:border-slate-700 text-transparent hover:border-blue-500'
                      }`}
                    >
                      {sub.progress === 100 ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : sub.progress > 0 ? (
                        <span>{sub.progress}%</span>
                      ) : null}
                    </button>

                    {/* Title & editing */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(sub.id);
                              if (e.key === 'Escape') setEditingSubtopicId(null);
                            }}
                            autoFocus
                            className="flex-1 px-2.5 py-1 text-sm font-semibold rounded-lg border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => saveEditing(sub.id)}
                            className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-md font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-400">
                            #{index + 1}
                          </span>
                          <span
                            onClick={() => startEditing(sub)}
                            title="Click to rename"
                            className={`font-semibold text-sm sm:text-base cursor-pointer hover:underline decoration-dotted ${
                              sub.progress === 100
                                ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress controls & Quick Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-800/60 sm:border-t-0">
                    {/* Slider & percentage */}
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={sub.progress}
                        onChange={(e) => handleUpdateSubtopic(sub.id, { progress: parseInt(e.target.value, 10) })}
                        className="w-24 sm:w-28 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-9 text-right font-mono">
                        {sub.progress}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Past papers count */}
                      <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs" title="Past papers questions completed">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Papers:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubtopic(sub.id, { pastPapersDone: Math.max(0, (sub.pastPapersDone || 0) - 1) })}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white px-1 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-900 dark:text-white min-w-4 text-center">
                          {sub.pastPapersDone || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubtopic(sub.id, { pastPapersDone: (sub.pastPapersDone || 0) + 1 })}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white px-1 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Expand Notes Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedNotesId(isNotesExpanded ? null : sub.id)}
                        title="Notes & formulas"
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          sub.notes
                            ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Ask AI about this subtopic */}
                      <button
                        type="button"
                        onClick={() => onAskAIAboutSubject(subject.name, sub.title)}
                        title="Ask AI tutor about this topic"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>

                      {/* Delete subtopic */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtopic(sub.id, sub.title)}
                        title="Delete subtopic"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Notes & Study Details */}
                {isNotesExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        Key Formulas, Notes & Exam Tips:
                      </span>
                      
                      {/* Confidence Stars */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 mr-1">Confidence:</span>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleUpdateSubtopic(sub.id, { confidence: star })}
                            className="text-slate-300 dark:text-slate-700 hover:text-amber-400 cursor-pointer"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                (sub.confidence || 0) >= star
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Add key formulas, syllabus pointers, or tricky question patterns to remember for this topic…"
                      value={sub.notes || ''}
                      onChange={(e) => handleUpdateSubtopic(sub.id, { notes: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono"
                    />

                    <div className="mt-2 flex justify-between items-center text-xs text-slate-400">
                      <span>Saved automatically</span>
                      <button
                        type="button"
                        onClick={() => onAskAIAboutSubject(subject.name, sub.title)}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Explain this topic with AI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
