import { Subject, StudyTask, UserStats, TimerSession, ExamResult, SubjectFile, GradeLetter, ActivityLogEntry } from '../types';

export function calculateGrade(score: number, maxScore: number = 100): GradeLetter {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (percentage >= 75) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 55) return 'C';
  if (percentage >= 35) return 'S';
  return 'F';
}


export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subj-physics',
    name: 'Physics',
    category: 'Science',
    color: 'blue',
    icon: 'atom',
    targetHours: 120,
    loggedMinutes: 0,
    updatedAt: Date.now(),
    notes: '',
    subtopics: [
      { id: 'sub-p-1', title: 'Units, Dimensions & Errors', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-2', title: 'Mechanics: Kinematics & Projectiles', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-3', title: 'Newtonian Dynamics & Momentum', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-4', title: 'Circular Motion & Rotational Dynamics', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-5', title: 'Oscillations & Simple Harmonic Motion', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-6', title: 'Mechanical Waves & Sound (Doppler Effect)', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-7', title: 'Geometrical & Physical Optics', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-8', title: 'Thermal Physics & Kinetic Theory', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-9', title: 'Gravitational & Electrostatic Fields', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-10', title: 'Current Electricity & Circuits', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-11', title: 'Electromagnetism & AC Circuits', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-p-12', title: 'Electronics & Modern Physics', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 }
    ]
  },
  {
    id: 'subj-chemistry',
    name: 'Chemistry',
    category: 'Science',
    color: 'emerald',
    icon: 'flask',
    targetHours: 110,
    loggedMinutes: 0,
    updatedAt: Date.now(),
    notes: '',
    subtopics: [
      { id: 'sub-c-1', title: 'Atomic Structure & Quantum Numbers', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-2', title: 'Chemical Bonding & Hybridization', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-3', title: 'Chemical Calculations & Mole Concept', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-4', title: 'Gaseous State & Real Gases', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-5', title: 'Chemical Energetics & Thermodynamics', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-6', title: 'Chemical & Phase Equilibrium', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-7', title: 'Ionic Equilibrium, pH & Buffers', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-8', title: 'Inorganic Chemistry: s & p Block', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-9', title: 'Transition Metals (d-block Complexes)', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-10', title: 'Organic Chemistry: Hydrocarbons & Halides', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-11', title: 'Carbonyls, Acids & Nitrogen Derivatives', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-c-12', title: 'Industrial & Environmental Chemistry', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 }
    ]
  },
  {
    id: 'subj-pure-maths',
    name: 'Pure Maths',
    category: 'Maths',
    color: 'purple',
    icon: 'calculator',
    targetHours: 130,
    loggedMinutes: 0,
    updatedAt: Date.now(),
    notes: '',
    subtopics: [
      { id: 'sub-m-1', title: 'Real Numbers & Mathematical Induction', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-2', title: 'Quadratic Equations & Polynomials', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-3', title: 'Inequalities & Modulus Functions', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-4', title: 'Trigonometric Functions & Proofs', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-5', title: 'Limits & Differentiation Techniques', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-6', title: 'Applications of Derivatives (Max/Min)', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-7', title: 'Definite & Indefinite Integration', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-8', title: 'Straight Lines & Circles', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-9', title: 'Matrices & Determinants', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-10', title: 'Permutations & Combinations', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-11', title: 'Binomial Theorem', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-m-12', title: 'Complex Numbers & De Moivre Theorem', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 }
    ]
  },
  {
    id: 'subj-applied-maths',
    name: 'Applied Maths',
    category: 'Maths',
    color: 'amber',
    icon: 'book',
    targetHours: 110,
    loggedMinutes: 0,
    updatedAt: Date.now(),
    notes: '',
    subtopics: [
      { id: 'sub-a-1', title: 'Vectors & Force Resolution', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-2', title: 'Rectilinear & Relative Motion', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-3', title: 'Newton\'s Laws of Motion & Friction', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-4', title: 'Work, Power, Energy & Impulse', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-5', title: 'Circular Motion & Simple Pendulum', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-6', title: 'Equilibrium of Coplanar Forces & Rigid Bodies', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-7', title: 'Centre of Gravity & Frameworks', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-8', title: 'Jointed Rods & Virtual Work', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-9', title: 'Measures of Central Tendency & Dispersion', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 },
      { id: 'sub-a-10', title: 'Probability & Conditional Probability', status: 'not_started', progress: 0, confidence: 0, pastPapersDone: 0 }
    ]
  }
];

export const DEFAULT_TASKS: StudyTask[] = [];

export const DEFAULT_TASK_HISTORY: StudyTask[] = [];

export const DEFAULT_EXAM_RESULTS: ExamResult[] = [];

export const DEFAULT_SUBJECT_FILES: SubjectFile[] = [];

export const DEFAULT_STATS: UserStats = {
  streak: 0,
  lastStudyDate: '',
  totalMinutesStudied: 0,
  todayMinutesStudied: 0,
  tasksCompletedTotal: 0
};

// Legacy mock identifiers to sanitize from previous test sessions
const LEGACY_MOCK_TASK_IDS = new Set(['task-1', 'task-2', 'task-3', 'task-4', 'task-5']);
const LEGACY_MOCK_EXAM_IDS = new Set(['exam-1', 'exam-2', 'exam-3', 'exam-4', 'exam-5', 'exam-6', 'exam-7', 'exam-8']);
const LEGACY_MOCK_FILE_IDS = new Set(['file-1', 'file-2', 'file-3']);

const STORAGE_KEYS = {
  SUBJECTS: 'studymate_subjects_v2',
  TASKS: 'studymate_tasks_v2',
  STATS: 'studymate_stats_v2',
  SESSIONS: 'studymate_sessions_v2',
  THEME: 'studymate_theme_v2',
  TASK_HISTORY: 'studymate_task_history_v2',
  EXAM_RESULTS: 'studymate_exam_results_v2',
  SUBJECT_FILES: 'studymate_subject_files_v2',
  ACTIVITY_LOG: 'studymate_activity_log_v2'
};


export function loadStoredSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) return DEFAULT_SUBJECTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Clean legacy mock progress if present from original template (e.g. 480 logged minutes or sample notes)
      const isLegacyTemplate = parsed.some(s => s.id === 'subj-physics' && s.loggedMinutes === 480);
      if (isLegacyTemplate) {
        saveStoredSubjects(DEFAULT_SUBJECTS);
        return DEFAULT_SUBJECTS;
      }
      return parsed;
    }
    return DEFAULT_SUBJECTS;
  } catch (e) {
    console.error('Failed to load subjects', e);
    return DEFAULT_SUBJECTS;
  }
}

export function saveStoredSubjects(subjects: Subject[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function loadStoredTasks(): StudyTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(t => !LEGACY_MOCK_TASK_IDS.has(t.id));
      if (cleaned.length !== parsed.length) {
        saveStoredTasks(cleaned);
      }
      return cleaned;
    }
    return DEFAULT_TASKS;
  } catch (e) {
    console.error('Failed to load tasks', e);
    return DEFAULT_TASKS;
  }
}

export function saveStoredTasks(tasks: StudyTask[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadStoredStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return DEFAULT_STATS;
    const stats: UserStats = JSON.parse(raw);

    // Sanitize legacy mock stats
    if (stats.totalMinutesStudied === 1730 && stats.tasksCompletedTotal === 18) {
      saveStoredStats(DEFAULT_STATS);
      return DEFAULT_STATS;
    }

    const today = new Date().toISOString().split('T')[0];

    // Reset today minutes if day rolled over
    if (stats.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (stats.lastStudyDate === yesterday) {
        // streak continues
      } else {
        // streak broke unless it's first run
        if (stats.streak > 1) {
          stats.streak = 1;
        }
      }
      stats.todayMinutesStudied = 0;
      stats.lastStudyDate = today;
      saveStoredStats(stats);
    }
    return stats;
  } catch (e) {
    console.error('Failed to load stats', e);
    return DEFAULT_STATS;
  }
}

export function saveStoredStats(stats: UserStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function loadStoredSessions(): TimerSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredSessions(sessions: TimerSession[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions.slice(-50)));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

export function loadStoredTaskHistory(): StudyTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASK_HISTORY);
    if (!raw) return DEFAULT_TASK_HISTORY;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return DEFAULT_TASK_HISTORY;
  } catch (e) {
    console.error('Failed to load task history', e);
    return DEFAULT_TASK_HISTORY;
  }
}

export function saveStoredTaskHistory(history: StudyTask[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASK_HISTORY, JSON.stringify(history.slice(-200)));
  } catch (e) {
    console.error('Failed to save task history', e);
  }
}

export function recordCompletedTask(task: StudyTask) {
  try {
    const current = loadStoredTaskHistory();
    // Check if task is already in history by id
    const existingIndex = current.findIndex(t => t.id === task.id);
    const completedRecord: StudyTask = {
      ...task,
      done: true,
      completedAt: task.completedAt || Date.now()
    };
    let updated: StudyTask[];
    if (existingIndex >= 0) {
      updated = [completedRecord, ...current.filter(t => t.id !== task.id)];
    } else {
      updated = [completedRecord, ...current];
    }
    saveStoredTaskHistory(updated);
  } catch (e) {
    console.error('Failed to record completed task to history', e);
  }
}

export function deleteTaskFromHistory(taskId: string): StudyTask[] {
  try {
    const current = loadStoredTaskHistory();
    const updated = current.filter(t => t.id !== taskId);
    saveStoredTaskHistory(updated);
    return updated;
  } catch (e) {
    console.error('Failed to delete task from history', e);
    return [];
  }
}

export function clearTaskHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TASK_HISTORY);
  } catch (e) {
    console.error('Failed to clear task history', e);
  }
}

export function loadStoredExamResults(): ExamResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
    if (!raw) return DEFAULT_EXAM_RESULTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(r => !LEGACY_MOCK_EXAM_IDS.has(r.id));
      if (cleaned.length !== parsed.length) {
        saveStoredExamResults(cleaned);
      }
      return cleaned;
    }
    return DEFAULT_EXAM_RESULTS;
  } catch (e) {
    console.error('Failed to load exam results', e);
    return DEFAULT_EXAM_RESULTS;
  }
}

export function saveStoredExamResults(results: ExamResult[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save exam results', e);
  }
}

export function loadStoredSubjectFiles(): SubjectFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECT_FILES);
    if (!raw) return DEFAULT_SUBJECT_FILES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(f => !LEGACY_MOCK_FILE_IDS.has(f.id));
      if (cleaned.length !== parsed.length) {
        saveStoredSubjectFiles(cleaned);
      }
      return cleaned;
    }
    return DEFAULT_SUBJECT_FILES;
  } catch (e) {
    console.error('Failed to load subject files', e);
    return DEFAULT_SUBJECT_FILES;
  }
}

export function saveStoredSubjectFiles(files: SubjectFile[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECT_FILES, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save subject files', e);
  }
}

export function loadStoredActivityLog(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load activity log', e);
    return [];
  }
}

export function saveStoredActivityLog(log: ActivityLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(log.slice(0, 2000)));
  } catch (e) {
    console.error('Failed to save activity log', e);
  }
}

export function logActivityEvent(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): ActivityLogEntry {
  try {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: entry.id || 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: entry.timestamp || Date.now()
    };
    const current = loadStoredActivityLog();
    // Avoid exact duplicate events within a 2-second window
    const isDuplicate = current.some(e => 
      e.type === newEntry.type && 
      e.title === newEntry.title && 
      e.subjectId === newEntry.subjectId &&
      Math.abs(e.timestamp - newEntry.timestamp) < 2000
    );
    if (isDuplicate) {
      return newEntry;
    }
    const updated = [newEntry, ...current];
    saveStoredActivityLog(updated);
    return newEntry;
  } catch (e) {
    console.error('Failed to log activity event', e);
    return {
      ...entry,
      id: entry.id || 'act-' + Date.now(),
      timestamp: entry.timestamp || Date.now()
    };
  }
}

export function deleteActivityLogEntries(entryIds: string[]): ActivityLogEntry[] {
  try {
    const idSet = new Set(entryIds);
    const current = loadStoredActivityLog();
    const updated = current.filter(e => !idSet.has(e.id));
    saveStoredActivityLog(updated);
    return updated;
  } catch (e) {
    console.error('Failed to delete activity log entries', e);
    return [];
  }
}

export function clearActivityLog(options?: { olderThanMs?: number; type?: string }): ActivityLogEntry[] {
  try {
    if (!options) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOG);
      return [];
    }
    const current = loadStoredActivityLog();
    const now = Date.now();
    const filtered = current.filter(e => {
      if (options.olderThanMs && (now - e.timestamp) <= options.olderThanMs) {
        return true; // Keep newer
      }
      if (options.type && options.type !== 'all' && e.type !== options.type) {
        return true; // Keep other types
      }
      return false; // Remove matching
    });
    saveStoredActivityLog(filtered);
    return filtered;
  } catch (e) {
    console.error('Failed to clear activity log', e);
    return [];
  }
}

export function calculateSubjectProgress(subject: Subject): number {
  if (!subject.subtopics || subject.subtopics.length === 0) return 0;
  const total = subject.subtopics.reduce((acc, curr) => acc + (curr.progress || 0), 0);
  return Math.round(total / subject.subtopics.length);
}

export function exportStudyData(): string {
  const data = {
    version: 4,
    exportedAt: new Date().toISOString(),
    subjects: loadStoredSubjects(),
    tasks: loadStoredTasks(),
    taskHistory: loadStoredTaskHistory(),
    stats: loadStoredStats(),
    sessions: loadStoredSessions(),
    examResults: loadStoredExamResults(),
    subjectFiles: loadStoredSubjectFiles(),
    activityLog: loadStoredActivityLog()
  };
  return JSON.stringify(data, null, 2);
}

export function importStudyData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.subjects && Array.isArray(data.subjects)) {
      saveStoredSubjects(data.subjects);
    }
    if (data.tasks && Array.isArray(data.tasks)) {
      saveStoredTasks(data.tasks);
    }
    if (data.taskHistory && Array.isArray(data.taskHistory)) {
      saveStoredTaskHistory(data.taskHistory);
    }
    if (data.stats) {
      saveStoredStats(data.stats);
    }
    if (data.sessions && Array.isArray(data.sessions)) {
      saveStoredSessions(data.sessions);
    }
    if (data.examResults && Array.isArray(data.examResults)) {
      saveStoredExamResults(data.examResults);
    }
    if (data.subjectFiles && Array.isArray(data.subjectFiles)) {
      saveStoredSubjectFiles(data.subjectFiles);
    }
    if (data.activityLog && Array.isArray(data.activityLog)) {
      saveStoredActivityLog(data.activityLog);
    }
    return true;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
}


