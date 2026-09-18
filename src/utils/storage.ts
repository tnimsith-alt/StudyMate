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
    loggedMinutes: 480,
    updatedAt: Date.now(),
    notes: 'Focus on mechanics numerical problems and electromagnetic induction graphs.',
    subtopics: [
      { id: 'sub-p-1', title: 'Units, Dimensions & Errors', status: 'completed', progress: 100, confidence: 5, pastPapersDone: 8 },
      { id: 'sub-p-2', title: 'Mechanics: Kinematics & Projectiles', status: 'completed', progress: 95, confidence: 5, pastPapersDone: 12 },
      { id: 'sub-p-3', title: 'Newtonian Dynamics & Momentum', status: 'in_progress', progress: 80, confidence: 4, pastPapersDone: 6 },
      { id: 'sub-p-4', title: 'Circular Motion & Rotational Dynamics', status: 'in_progress', progress: 70, confidence: 4, pastPapersDone: 5 },
      { id: 'sub-p-5', title: 'Oscillations & Simple Harmonic Motion', status: 'in_progress', progress: 65, confidence: 3, pastPapersDone: 4 },
      { id: 'sub-p-6', title: 'Mechanical Waves & Sound (Doppler Effect)', status: 'in_progress', progress: 60, confidence: 3, pastPapersDone: 5 },
      { id: 'sub-p-7', title: 'Geometrical & Physical Optics', status: 'not_started', progress: 40, confidence: 2, pastPapersDone: 2 },
      { id: 'sub-p-8', title: 'Thermal Physics & Kinetic Theory', status: 'in_progress', progress: 75, confidence: 4, pastPapersDone: 7 },
      { id: 'sub-p-9', title: 'Gravitational & Electrostatic Fields', status: 'not_started', progress: 35, confidence: 2, pastPapersDone: 1 },
      { id: 'sub-p-10', title: 'Current Electricity & Circuits', status: 'completed', progress: 90, confidence: 5, pastPapersDone: 10 },
      { id: 'sub-p-11', title: 'Electromagnetism & AC Circuits', status: 'not_started', progress: 20, confidence: 2, pastPapersDone: 1 },
      { id: 'sub-p-12', title: 'Electronics & Modern Physics', status: 'not_started', progress: 15, confidence: 1, pastPapersDone: 0 }
    ]
  },
  {
    id: 'subj-chemistry',
    name: 'Chemistry',
    category: 'Science',
    color: 'emerald',
    icon: 'flask',
    targetHours: 110,
    loggedMinutes: 390,
    updatedAt: Date.now(),
    notes: 'Review organic reaction flowcharts daily. Practice buffer solution calculations.',
    subtopics: [
      { id: 'sub-c-1', title: 'Atomic Structure & Quantum Numbers', status: 'completed', progress: 100, confidence: 5, pastPapersDone: 9 },
      { id: 'sub-c-2', title: 'Chemical Bonding & Hybridization', status: 'completed', progress: 95, confidence: 5, pastPapersDone: 11 },
      { id: 'sub-c-3', title: 'Chemical Calculations & Mole Concept', status: 'completed', progress: 90, confidence: 4, pastPapersDone: 8 },
      { id: 'sub-c-4', title: 'Gaseous State & Real Gases', status: 'in_progress', progress: 75, confidence: 4, pastPapersDone: 6 },
      { id: 'sub-c-5', title: 'Chemical Energetics & Thermodynamics', status: 'in_progress', progress: 65, confidence: 3, pastPapersDone: 4 },
      { id: 'sub-c-6', title: 'Chemical & Phase Equilibrium', status: 'in_progress', progress: 60, confidence: 3, pastPapersDone: 5 },
      { id: 'sub-c-7', title: 'Ionic Equilibrium, pH & Buffers', status: 'in_progress', progress: 50, confidence: 3, pastPapersDone: 3 },
      { id: 'sub-c-8', title: 'Inorganic Chemistry: s & p Block', status: 'in_progress', progress: 55, confidence: 3, pastPapersDone: 4 },
      { id: 'sub-c-9', title: 'Transition Metals (d-block Complexes)', status: 'not_started', progress: 30, confidence: 2, pastPapersDone: 1 },
      { id: 'sub-c-10', title: 'Organic Chemistry: Hydrocarbons & Halides', status: 'in_progress', progress: 60, confidence: 3, pastPapersDone: 5 },
      { id: 'sub-c-11', title: 'Carbonyls, Acids & Nitrogen Derivatives', status: 'not_started', progress: 35, confidence: 2, pastPapersDone: 2 },
      { id: 'sub-c-12', title: 'Industrial & Environmental Chemistry', status: 'not_started', progress: 20, confidence: 2, pastPapersDone: 1 }
    ]
  },
  {
    id: 'subj-pure-maths',
    name: 'Pure Maths',
    category: 'Maths',
    color: 'purple',
    icon: 'calculator',
    targetHours: 130,
    loggedMinutes: 520,
    updatedAt: Date.now(),
    notes: 'Master substitution techniques in integration and trigonometric transformation proofs.',
    subtopics: [
      { id: 'sub-m-1', title: 'Real Numbers & Mathematical Induction', status: 'completed', progress: 100, confidence: 5, pastPapersDone: 10 },
      { id: 'sub-m-2', title: 'Quadratic Equations & Polynomials', status: 'completed', progress: 95, confidence: 5, pastPapersDone: 12 },
      { id: 'sub-m-3', title: 'Inequalities & Modulus Functions', status: 'completed', progress: 90, confidence: 4, pastPapersDone: 8 },
      { id: 'sub-m-4', title: 'Trigonometric Functions & Proofs', status: 'in_progress', progress: 85, confidence: 4, pastPapersDone: 9 },
      { id: 'sub-m-5', title: 'Limits & Differentiation Techniques', status: 'in_progress', progress: 80, confidence: 4, pastPapersDone: 7 },
      { id: 'sub-m-6', title: 'Applications of Derivatives (Max/Min)', status: 'in_progress', progress: 70, confidence: 3, pastPapersDone: 5 },
      { id: 'sub-m-7', title: 'Definite & Indefinite Integration', status: 'in_progress', progress: 65, confidence: 3, pastPapersDone: 6 },
      { id: 'sub-m-8', title: 'Straight Lines & Circles', status: 'in_progress', progress: 75, confidence: 4, pastPapersDone: 6 },
      { id: 'sub-m-9', title: 'Matrices & Determinants', status: 'in_progress', progress: 70, confidence: 4, pastPapersDone: 5 },
      { id: 'sub-m-10', title: 'Permutations & Combinations', status: 'not_started', progress: 35, confidence: 2, pastPapersDone: 2 },
      { id: 'sub-m-11', title: 'Binomial Theorem', status: 'in_progress', progress: 60, confidence: 3, pastPapersDone: 4 },
      { id: 'sub-m-12', title: 'Complex Numbers & De Moivre Theorem', status: 'not_started', progress: 20, confidence: 1, pastPapersDone: 1 }
    ]
  },
  {
    id: 'subj-applied-maths',
    name: 'Applied Maths',
    category: 'Maths',
    color: 'amber',
    icon: 'book',
    targetHours: 110,
    loggedMinutes: 340,
    updatedAt: Date.now(),
    notes: 'Draw clear free-body diagrams first. Check dimensions before final answers.',
    subtopics: [
      { id: 'sub-a-1', title: 'Vectors & Force Resolution', status: 'completed', progress: 95, confidence: 5, pastPapersDone: 10 },
      { id: 'sub-a-2', title: 'Rectilinear & Relative Motion', status: 'in_progress', progress: 80, confidence: 4, pastPapersDone: 8 },
      { id: 'sub-a-3', title: 'Newton\'s Laws of Motion & Friction', status: 'in_progress', progress: 75, confidence: 4, pastPapersDone: 7 },
      { id: 'sub-a-4', title: 'Work, Power, Energy & Impulse', status: 'in_progress', progress: 65, confidence: 3, pastPapersDone: 5 },
      { id: 'sub-a-5', title: 'Circular Motion & Simple Pendulum', status: 'not_started', progress: 40, confidence: 2, pastPapersDone: 3 },
      { id: 'sub-a-6', title: 'Equilibrium of Coplanar Forces & Rigid Bodies', status: 'in_progress', progress: 60, confidence: 3, pastPapersDone: 4 },
      { id: 'sub-a-7', title: 'Centre of Gravity & Frameworks', status: 'not_started', progress: 30, confidence: 2, pastPapersDone: 2 },
      { id: 'sub-a-8', title: 'Jointed Rods & Virtual Work', status: 'not_started', progress: 20, confidence: 1, pastPapersDone: 1 },
      { id: 'sub-a-9', title: 'Measures of Central Tendency & Dispersion', status: 'in_progress', progress: 70, confidence: 4, pastPapersDone: 5 },
      { id: 'sub-a-10', title: 'Probability & Conditional Probability', status: 'not_started', progress: 35, confidence: 2, pastPapersDone: 2 }
    ]
  }
];

export const DEFAULT_TASKS: StudyTask[] = [
  { id: 'task-1', text: 'Physics — Review Kinematics projectile formulas & do 3 past paper questions', done: false, subjectId: 'subj-physics', priority: 'high', createdAt: Date.now() - 3600000 },
  { id: 'task-2', text: 'Chemistry — Memorize Organic SN1 vs SN2 mechanism pathways', done: true, subjectId: 'subj-chemistry', priority: 'high', createdAt: Date.now() - 7200000, completedAt: Date.now() - 3600000 },
  { id: 'task-3', text: 'Pure Maths — Complete Trigonometry transformation exercise set', done: false, subjectId: 'subj-pure-maths', priority: 'medium', createdAt: Date.now() - 10800000 },
  { id: 'task-4', text: 'Applied Maths — Friction on inclined plane problem set', done: false, subjectId: 'subj-applied-maths', priority: 'medium', createdAt: Date.now() - 14400000 },
  { id: 'task-5', text: 'Past paper review: 2024 Physics Structured Essay Section A', done: false, subjectId: 'subj-physics', priority: 'high', createdAt: Date.now() - 18000000 }
];

export const DEFAULT_TASK_HISTORY: StudyTask[] = [];

export const DEFAULT_EXAM_RESULTS: ExamResult[] = [
  {
    id: 'exam-1',
    subjectId: 'subj-physics',
    examName: '1st Term Evaluation',
    score: 78,
    maxScore: 100,
    percentage: 78,
    grade: 'A',
    examType: 'term_test',
    date: '2026-03-15',
    notes: 'Good performance in Mechanics; need more revision in Wave Doppler effect.',
    createdAt: Date.now() - 86400000 * 60
  },
  {
    id: 'exam-2',
    subjectId: 'subj-chemistry',
    examName: '1st Term Evaluation',
    score: 72,
    maxScore: 100,
    percentage: 72,
    grade: 'B',
    examType: 'term_test',
    date: '2026-03-18',
    notes: 'Lost marks on buffer calculations and transition metal isomers.',
    createdAt: Date.now() - 86400000 * 57
  },
  {
    id: 'exam-3',
    subjectId: 'subj-pure-maths',
    examName: '1st Term Evaluation',
    score: 85,
    maxScore: 100,
    percentage: 85,
    grade: 'A',
    examType: 'term_test',
    date: '2026-03-20',
    notes: 'Excellent in Calculus. Fast solution on trigonometric identities.',
    createdAt: Date.now() - 86400000 * 55
  },
  {
    id: 'exam-4',
    subjectId: 'subj-applied-maths',
    examName: '1st Term Evaluation',
    score: 68,
    maxScore: 100,
    percentage: 68,
    grade: 'B',
    examType: 'term_test',
    date: '2026-03-22',
    notes: 'Rigid body equilibrium problem had numerical calculation mistake.',
    createdAt: Date.now() - 86400000 * 53
  },
  {
    id: 'exam-5',
    subjectId: 'subj-physics',
    examName: 'Mid-Year Model Paper 1',
    score: 84,
    maxScore: 100,
    percentage: 84,
    grade: 'A',
    examType: 'model_exam',
    date: '2026-06-10',
    notes: 'Improved in optics and thermal physics. Scored 42/50 in MCQs.',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'exam-6',
    subjectId: 'subj-chemistry',
    examName: 'Mid-Year Model Paper 1',
    score: 81,
    maxScore: 100,
    percentage: 81,
    grade: 'A',
    examType: 'model_exam',
    date: '2026-06-12',
    notes: 'Reached A grade target! Organic synthesis questions fully correct.',
    createdAt: Date.now() - 86400000 * 28
  },
  {
    id: 'exam-7',
    subjectId: 'subj-pure-maths',
    examName: 'Mid-Year Model Paper 1',
    score: 91,
    maxScore: 100,
    percentage: 91,
    grade: 'A',
    examType: 'model_exam',
    date: '2026-06-15',
    notes: 'Outstanding score. All 5 essay questions completed with full marks.',
    createdAt: Date.now() - 86400000 * 25
  },
  {
    id: 'exam-8',
    subjectId: 'subj-applied-maths',
    examName: 'Mid-Year Model Paper 1',
    score: 79,
    maxScore: 100,
    percentage: 79,
    grade: 'A',
    examType: 'model_exam',
    date: '2026-06-17',
    notes: 'Friction and relative velocity problems solved accurately.',
    createdAt: Date.now() - 86400000 * 23
  }
];

export const DEFAULT_SUBJECT_FILES: SubjectFile[] = [
  {
    id: 'file-1',
    subjectId: 'subj-physics',
    name: 'Physics_Mechanics_Formulas_Summary.txt',
    size: 2048,
    type: 'text/plain',
    category: 'formula_sheet',
    textContent: `# Physics Mechanics Core Formulas\n\n## 1. Kinematics\n- v = u + at\n- s = ((u + v) / 2) * t\n- s = ut + 0.5 * a * t^2\n- v^2 = u^2 + 2as\n\n## 2. Projectiles\n- Time of Flight: T = (2u sin θ) / g\n- Maximum Height: H = (u^2 sin^2 θ) / (2g)\n- Range: R = (u^2 sin 2θ) / g\n\n## 3. Newton's 2nd Law & Momentum\n- F_net = ma = dp/dt\n- Linear Momentum: p = mv\n- Impulse: J = F * Δt = Δp\n\n## 4. Circular Motion\n- Angular velocity: ω = v / r\n- Centripetal acceleration: a = v^2 / r = r * ω^2\n- Centripetal force: F = (m * v^2) / r`,
    uploadedAt: Date.now() - 86400000 * 14,
    tags: ['Mechanics', 'Formulas', 'A/L Physics'],
    description: 'Quick reference sheet for mechanics formulas & derivations.'
  },
  {
    id: 'file-2',
    subjectId: 'subj-chemistry',
    name: 'Organic_Chemistry_Reaction_Flowchart.txt',
    size: 3120,
    type: 'text/plain',
    category: 'short_notes',
    textContent: `# Organic Chemistry Conversions & Reagents\n\n## 1. Alkyl Halides -> Alcohols\n- Reagent: Aqueous NaOH or KOH (Warm)\n- Type: Nucleophilic Substitution (SN1/SN2)\n\n## 2. Alcohols -> Aldehydes / Ketones\n- Primary alcohol: PCC / CH2Cl2 -> Aldehyde\n- Primary alcohol: Acidified K2Cr2O7 (reflux) -> Carboxylic Acid\n- Secondary alcohol: Acidified K2Cr2O7 -> Ketone\n\n## 3. Carbonyls -> Alcohols\n- Reagent: NaBH4 in MeOH or LiAlH4 in dry ether\n\n## 4. Carboxylic Acids -> Acyl Chlorides\n- Reagent: SOCl2 or PCl5`,
    uploadedAt: Date.now() - 86400000 * 10,
    tags: ['Organic', 'Flowchart', 'Reagents'],
    description: 'Comprehensive organic chemistry reagents cheat sheet.'
  },
  {
    id: 'file-3',
    subjectId: 'subj-pure-maths',
    name: 'Trigonometry_Standard_Identities_Summary.txt',
    size: 1840,
    type: 'text/plain',
    category: 'formula_sheet',
    textContent: `# Pure Maths Trigonometry Essentials\n\n## 1. Pythagorean Identities\n- sin^2 θ + cos^2 θ = 1\n- 1 + tan^2 θ = sec^2 θ\n- 1 + cot^2 θ = cosec^2 θ\n\n## 2. Compound Angles\n- sin(A ± B) = sin A cos B ± cos A sin B\n- cos(A ± B) = cos A cos B ∓ sin A sin B\n- tan(A ± B) = (tan A ± tan B) / (1 ∓ tan A tan B)\n\n## 3. Double Angle Formulas\n- sin 2A = 2 sin A cos A\n- cos 2A = cos^2 A - sin^2 A = 2 cos^2 A - 1 = 1 - 2 sin^2 A\n- tan 2A = (2 tan A) / (1 - tan^2 A)`,
    uploadedAt: Date.now() - 86400000 * 7,
    tags: ['Trigonometry', 'Pure Maths', 'Formulas'],
    description: 'Master trigonometric identities and product-to-sum transformations.'
  }
];

export const DEFAULT_STATS: UserStats = {
  streak: 3,
  lastStudyDate: new Date().toISOString().split('T')[0],
  totalMinutesStudied: 1730,
  todayMinutesStudied: 45,
  tasksCompletedTotal: 18
};

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
    if (Array.isArray(parsed)) return parsed;
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
    if (Array.isArray(parsed)) return parsed;
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
    if (Array.isArray(parsed)) return parsed;
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
    if (Array.isArray(parsed)) return parsed;
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


