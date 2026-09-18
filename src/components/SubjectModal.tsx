import React, { useState, useEffect } from 'react';
import { X, Trash2, Atom, FlaskConical, Calculator, BookOpen, Sparkles, RotateCcw } from 'lucide-react';
import { Subject } from '../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  onDelete?: (subjectId: string) => void;
  editingSubject?: Subject | null;
}

const COLOR_OPTIONS: Array<{ id: Subject['color']; name: string; bgClass: string }> = [
  { id: 'blue', name: 'Blue', bgClass: 'bg-blue-600' },
  { id: 'emerald', name: 'Emerald', bgClass: 'bg-emerald-600' },
  { id: 'purple', name: 'Purple', bgClass: 'bg-purple-600' },
  { id: 'amber', name: 'Amber', bgClass: 'bg-amber-600' },
  { id: 'rose', name: 'Rose', bgClass: 'bg-rose-600' },
  { id: 'indigo', name: 'Indigo', bgClass: 'bg-indigo-600' },
  { id: 'cyan', name: 'Cyan', bgClass: 'bg-cyan-600' },
  { id: 'teal', name: 'Teal', bgClass: 'bg-teal-600' },
];

const ICON_OPTIONS = [
  { id: 'atom', label: 'Physics / Atom', Icon: Atom },
  { id: 'flask', label: 'Chemistry / Flask', Icon: FlaskConical },
  { id: 'calculator', label: 'Maths / Numbers', Icon: Calculator },
  { id: 'book', label: 'General / Book', Icon: BookOpen },
  { id: 'sparkles', label: 'Special / Sparkles', Icon: Sparkles },
];

const STREAMS = ['Science', 'Maths', 'Technology', 'Commerce', 'Arts', 'General'];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingSubject
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Science');
  const [color, setColor] = useState<Subject['color']>('blue');
  const [icon, setIcon] = useState('atom');
  const [targetHours, setTargetHours] = useState(100);
  const [loggedMinutes, setLoggedMinutes] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setCategory(editingSubject.category || 'Science');
      setColor(editingSubject.color || 'blue');
      setIcon(editingSubject.icon || 'atom');
      setTargetHours(editingSubject.targetHours || 100);
      setLoggedMinutes(editingSubject.loggedMinutes || 0);
      setNotes(editingSubject.notes || '');
    } else {
      setName('');
      setCategory('Science');
      setColor('blue');
      setIcon('atom');
      setTargetHours(100);
      setLoggedMinutes(0);
      setNotes('');
    }
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      onSave({
        ...editingSubject,
        name: name.trim(),
        category,
        color,
        icon,
        targetHours,
        loggedMinutes,
        notes: notes.trim(),
        updatedAt: Date.now()
      });
    } else {
      const newSubject: Subject = {
        id: 'subj-' + Date.now(),
        name: name.trim(),
        category,
        color,
        icon,
        targetHours,
        loggedMinutes: 0,
        notes: notes.trim(),
        updatedAt: Date.now(),
        subtopics: [
          { id: 'sub-init-1', title: 'Chapter 1: Fundamentals & Theory', status: 'not_started', progress: 0, confidence: 3, pastPapersDone: 0 },
          { id: 'sub-init-2', title: 'Chapter 2: Core Applications', status: 'not_started', progress: 0, confidence: 3, pastPapersDone: 0 },
        ]
      };
      onSave(newSubject);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingSubject && onDelete) {
      if (window.confirm(`Are you sure you want to delete "${editingSubject.name}"? All subtopics will also be removed.`)) {
        onDelete(editingSubject.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Create New Subject'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Subject Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Biology, Combined Maths, ICT, Economics…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Stream & Target Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Stream / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {STREAMS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Hours
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={targetHours}
                onChange={(e) => setTargetHours(parseInt(e.target.value, 10) || 100)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Logged StudyTime & Reset */}
          {editingSubject && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Logged StudyTime</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {Math.floor(loggedMinutes / 60)}h {loggedMinutes % 60}m ({loggedMinutes} mins)
                </span>
              </div>
              {loggedMinutes > 0 && (
                <button
                  type="button"
                  onClick={() => setLoggedMinutes(0)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset StudyTime to 0</span>
                </button>
              )}
            </div>
          )}

          {/* Color theme */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bgClass} flex items-center justify-center transition-all cursor-pointer ${
                    color === c.id ? 'ring-3 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Icon
            </label>
            <div className="flex gap-2">
              {ICON_OPTIONS.map(i => {
                const SelectedIcon = i.Icon;
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setIcon(i.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      icon === i.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={i.label}
                  >
                    <SelectedIcon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Syllabus summary */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Study Focus Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Master essay questions in section B, focus on past papers 2018-2024…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {editingSubject && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Subject</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
