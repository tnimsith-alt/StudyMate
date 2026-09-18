export interface Subtopic {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number; // 0 - 100
  notes?: string;
  pastPapersDone?: number;
  confidence?: number; // 1 - 5
  completedAt?: number;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'teal';
  icon: string;
  subtopics: Subtopic[];
  loggedMinutes: number;
  targetHours: number;
  notes?: string;
  updatedAt: number;
}

export interface StudyTask {
  id: string;
  text: string;
  done: boolean;
  subjectId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  completedAt?: number;
}

export interface TimerSession {
  id: string;
  subjectId?: string;
  durationMinutes: number;
  completedAt: number;
  mode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch';
}

export interface UserStats {
  streak: number;
  lastStudyDate: string;
  totalMinutesStudied: number;
  todayMinutesStudied: number;
  tasksCompletedTotal: number;
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  subjectId?: string;
}

export type GradeLetter = 'A' | 'B' | 'C' | 'S' | 'F';

export interface ExamResult {
  id: string;
  subjectId: string;
  examName: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: GradeLetter;
  examType: 'term_test' | 'model_exam' | 'past_paper' | 'unit_test' | 'other';
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

export interface SubjectFile {
  id: string;
  subjectId: string;
  name: string;
  size: number; // in bytes
  type: string; // file mime or extension
  category: 'past_paper' | 'short_notes' | 'marking_scheme' | 'formula_sheet' | 'assignment' | 'other';
  dataUrl?: string; // base64 representation
  textContent?: string; // raw text/markdown note
  uploadedAt: number;
  tags?: string[];
  description?: string;
}

export interface ActivityLogEntry {
  id: string;
  type: 'subtopic' | 'task' | 'session' | 'exam' | 'note' | 'general';
  title: string;
  subtitle?: string;
  subjectId?: string;
  subjectName?: string;
  timestamp: number;
  meta?: {
    progress?: number;
    score?: number;
    maxScore?: number;
    grade?: GradeLetter;
    durationMinutes?: number;
    priority?: 'low' | 'medium' | 'high';
    mode?: string;
    originalId?: string;
    [key: string]: any;
  };
}

