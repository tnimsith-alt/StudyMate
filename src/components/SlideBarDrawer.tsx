import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, Clock, CheckCircle2, History, Sparkles, 
  BarChart2, FolderOpen, Save, Download, Plus, ChevronRight,
  Award, Flame, Target, FileText, Layers, Smartphone, Check
} from 'lucide-react';
import { Subject, UserStats, StudyTask, ExamResult, SubjectFile } from '../types';
import { calculateSubjectProgress } from '../utils/storage';

interface SlideBarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: 'syllabus' | 'timer' | 'tasks' | 'history' | 'tutor' | 'exams' | 'files';
  onSelectSection: (section: 'syllabus' | 'timer' | 'tasks' | 'history' | 'tutor' | 'exams' | 'files') => void;
  subjects: Subject[];
  activeSubjectId: string;
  onSelectSubject: (id: string) => void;
  stats: UserStats;
  tasks: StudyTask[];
  taskHistory: StudyTask[];
  examResults: ExamResult[];
  subjectFiles: SubjectFile[];
  onOpenBackupModal: () => void;
  onOpenAddSubject: () => void;
}

export function SlideBarDrawer({
  isOpen,
  onClose,
  activeSection,
  onSelectSection,
  subjects,
  activeSubjectId,
  onSelectSubject,
  stats,
  tasks,
  taskHistory,
  examResults,
  subjectFiles,
  onOpenBackupModal,
  onOpenAddSubject
}: SlideBarDrawerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallHelp, setShowInstallHelp] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallHelp(prev => !prev);
    }
  };

  if (!isOpen) return null;

  const totalSubtopics = subjects.reduce((acc, s) => acc + s.subtopics.length, 0);
  const overallMastery = subjects.length > 0
    ? Math.round(subjects.reduce((acc, s) => acc + calculateSubjectProgress(s), 0) / subjects.length)
    : 0;

  const avgExamScore = examResults.length > 0
    ? Math.round(examResults.reduce((acc, r) => acc + r.percentage, 0) / examResults.length)
    : 0;

  const pendingTasks = tasks.filter(t => !t.done).length;

  const navItems = [
    {
      id: 'syllabus' as const,
      label: 'Subjects & Syllabus',
      sublabel: `${totalSubtopics} topics tracked`,
      icon: BookOpen,
      badge: `${overallMastery}%`,
      badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
    },
    {
      id: 'exams' as const,
      label: 'Exam Results & Analytics',
      sublabel: `${examResults.length} test scores logged`,
      icon: BarChart2,
      badge: examResults.length > 0 ? `Avg ${avgExamScore}%` : 'New',
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
      isHighlight: true
    },
    {
      id: 'files' as const,
      label: 'Subject Files & Notes',
      sublabel: `${subjectFiles.length} papers & notes`,
      icon: FolderOpen,
      badge: `${subjectFiles.length} files`,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
      isHighlight: true
    },
    {
      id: 'timer' as const,
      label: 'Focus Study Timer',
      sublabel: `${stats.todayMinutesStudied}m logged today`,
      icon: Clock,
      badge: `${Math.floor(stats.totalMinutesStudied / 60)}h`,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    },
    {
      id: 'tasks' as const,
      label: 'Daily Study Tasks',
      sublabel: 'Active checklist',
      icon: CheckCircle2,
      badge: `${pendingTasks} pending`,
      badgeColor: pendingTasks > 0 ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
    },
    {
      id: 'history' as const,
      label: 'Study History & Logs',
      sublabel: 'Completed sessions & tasks',
      icon: History,
      badge: `${taskHistory.length}`,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    },
    {
      id: 'tutor' as const,
      label: 'AI Academic Tutor',
      sublabel: 'Bilingual A/L answers',
      icon: Sparkles,
      badge: '24/7 AI',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-out Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                📚
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  StudyMate LK Hub
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick slide menu & workspace tools
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            
            {/* Quick Metrics Banner */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-xs opacity-90 mb-2">
                <span className="font-semibold flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> G.C.E. A/L Goal
                </span>
                <span className="font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-300" /> {stats.streak} Day Streak
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-black">{overallMastery}%</span>
                <span className="text-xs font-medium opacity-90">{subjects.length} Subjects Active</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${overallMastery}%` }}
                />
              </div>
            </div>

            {/* Navigation Options List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Open Feature Modules
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Tap to launch individually
                </span>
              </div>
              
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <div
                    key={item.id}
                    className={`group rounded-2xl border transition-all p-3 ${
                      isActive 
                        ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 shadow-xs' 
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          onClose();
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : item.isHighlight
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold truncate flex items-center gap-1.5 text-slate-900 dark:text-white">
                            {item.label}
                            {item.isHighlight && !isActive && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-400 truncate">
                            {item.sublabel}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectSection(item.id);
                            onClose();
                          }}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white'
                          }`}
                          title={`Open ${item.label}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Subject Jump */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Quick Subject Jump
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAddSubject();
                    onClose();
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add Subject
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {subjects.map(s => {
                  const isCur = s.id === activeSubjectId;
                  const prog = calculateSubjectProgress(s);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        onSelectSubject(s.id);
                        onSelectSection('syllabus');
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCur
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{s.name}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{prog}% mastery</span>
                        <span>{s.subtopics.length} topics</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data & Backup Tools Section */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block">
                Workspace Utilities & App
              </span>

              {/* Install PWA Button */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isInstalled
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{isInstalled ? 'App Installed on Device' : 'Install App on Phone / PC'}</span>
                  </div>
                  {isInstalled ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" /> Installed
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {deferredPrompt ? '1-Click Install' : 'Instructions'}
                    </span>
                  )}
                </button>

                {showInstallHelp && !isInstalled && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" /> How to install in Chrome / Safari:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
                      <li><strong>Chrome on PC/Mac:</strong> Click the <em>Install</em> icon in your address bar (top right).</li>
                      <li><strong>Chrome on Android:</strong> Tap the 3 dots (⋮) menu → tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
                      <li><strong>Safari on iPhone:</strong> Tap <strong>Share (⎋)</strong> → tap <strong>"Add to Home Screen"</strong>.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenBackupModal();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                  <span>Backup / Restore</span>
                </button>

                <a
                  href="/api/download-project"
                  download="StudyMate-LK.zip"
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer text-decoration-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </a>
              </div>
            </div>

          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              StudyMate LK • Sri Lankan G.C.E. A/L Study Suite
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
