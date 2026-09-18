import React from 'react';
import { Plus, Atom, FlaskConical, Calculator, BookOpen, Sparkles, Settings } from 'lucide-react';
import { Subject } from '../types';
import { calculateSubjectProgress } from '../utils/storage';

interface SubjectTabsProps {
  subjects: Subject[];
  activeSubjectId: string;
  onSelectSubject: (id: string) => void;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
}

export const SubjectTabs: React.FC<SubjectTabsProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
  onAddSubject,
  onEditSubject,
}) => {
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'atom':
        return <Atom className="w-4 h-4" />;
      case 'flask':
        return <FlaskConical className="w-4 h-4" />;
      case 'calculator':
        return <Calculator className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getBadgeColors = (color: string, isActive: boolean) => {
    switch (color) {
      case 'emerald':
        return isActive
          ? 'bg-emerald-600 text-white'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'purple':
        return isActive
          ? 'bg-purple-600 text-white'
          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300';
      case 'amber':
        return isActive
          ? 'bg-amber-600 text-white'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
      case 'rose':
        return isActive
          ? 'bg-rose-600 text-white'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
      default:
        return isActive
          ? 'bg-blue-600 text-white'
          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300';
    }
  };

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md pt-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {subjects.map((subj) => {
            const isActive = subj.id === activeSubjectId;
            const progress = calculateSubjectProgress(subj);

            return (
              <div
                key={subj.id}
                className="relative group flex items-center"
              >
                <button
                  id={`subject-tab-${subj.id}`}
                  type="button"
                  onClick={() => onSelectSubject(subj.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-white dark:text-slate-900' : 'text-slate-400'}>
                    {getSubjectIcon(subj.icon)}
                  </span>
                  <span>{subj.name}</span>
                  
                  {/* Progress badge */}
                  <span
                    className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${getBadgeColors(
                      subj.color,
                      isActive
                    )}`}
                  >
                    {progress}%
                  </span>
                </button>

                {/* Edit Subject button inside active tab */}
                {isActive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSubject(subj);
                    }}
                    title="Edit Subject settings"
                    className="ml-1 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Subject Button */}
          <button
            id="add-subject-tab-btn"
            type="button"
            onClick={onAddSubject}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>
    </div>
  );
};
