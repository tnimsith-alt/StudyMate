import React, { useState, useMemo } from 'react';
import { 
  BarChart2, Plus, TrendingUp, Award, Calendar, Trash2, 
  Edit3, Filter, CheckCircle, AlertCircle, BookOpen, 
  Sparkles, ChevronRight, X, HelpCircle, ArrowLeft,
  RotateCcw, AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell
} from 'recharts';
import { Subject, ExamResult, GradeLetter } from '../types';
import { calculateGrade } from '../utils/storage';

interface ExamResultsViewProps {
  subjects: Subject[];
  examResults: ExamResult[];
  onAddExamResult: (result: Omit<ExamResult, 'id' | 'createdAt'>) => void;
  onUpdateExamResult: (result: ExamResult) => void;
  onDeleteExamResult: (id: string) => void;
  onAskAITutorAboutTopic?: (subjectName: string, examNotes: string) => void;
  onBackToSyllabus?: () => void;
  onResetExamResults?: () => void;
  onRestoreDefaultExamResults?: () => void;
  onClearSubjectExamResults?: (subjectId: string) => void;
}

export function ExamResultsView({
  subjects,
  examResults,
  onAddExamResult,
  onUpdateExamResult,
  onDeleteExamResult,
  onAskAITutorAboutTopic,
  onBackToSyllabus,
  onResetExamResults,
  onRestoreDefaultExamResults,
  onClearSubjectExamResults
}: ExamResultsViewProps) {
  // State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [chartMode, setChartMode] = useState<'timeline' | 'subjects' | 'distribution'>('timeline');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);

  // Form State
  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || '');
  const [formExamName, setFormExamName] = useState<string>('');
  const [formScore, setFormScore] = useState<number>(75);
  const [formMaxScore, setFormMaxScore] = useState<number>(100);
  const [formExamType, setFormExamType] = useState<ExamResult['examType']>('term_test');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState<string>('');

  // Open modal for new result
  const handleOpenAddModal = () => {
    setEditingResult(null);
    setFormSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : (subjects[0]?.id || ''));
    setFormExamName('');
    setFormScore(75);
    setFormMaxScore(100);
    setFormExamType('term_test');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (res: ExamResult) => {
    setEditingResult(res);
    setFormSubjectId(res.subjectId);
    setFormExamName(res.examName);
    setFormScore(res.score);
    setFormMaxScore(res.maxScore);
    setFormExamType(res.examType);
    setFormDate(res.date);
    setFormNotes(res.notes || '');
    setIsModalOpen(true);
  };

  // Save result
  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExamName.trim() || !formSubjectId) return;

    const percentage = formMaxScore > 0 ? Math.round((formScore / formMaxScore) * 100) : 0;
    const grade = calculateGrade(formScore, formMaxScore);

    if (editingResult) {
      onUpdateExamResult({
        ...editingResult,
        subjectId: formSubjectId,
        examName: formExamName.trim(),
        score: Number(formScore),
        maxScore: Number(formMaxScore),
        percentage,
        grade,
        examType: formExamType,
        date: formDate,
        notes: formNotes.trim() || undefined
      });
    } else {
      onAddExamResult({
        subjectId: formSubjectId,
        examName: formExamName.trim(),
        score: Number(formScore),
        maxScore: Number(formMaxScore),
        percentage,
        grade,
        examType: formExamType,
        date: formDate,
        notes: formNotes.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    return examResults
      .filter(r => {
        if (selectedSubjectId !== 'all' && r.subjectId !== selectedSubjectId) return false;
        if (selectedExamType !== 'all' && r.examType !== selectedExamType) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [examResults, selectedSubjectId, selectedExamType]);

  // Statistics
  const stats = useMemo(() => {
    if (examResults.length === 0) {
      return { avgScore: 0, totalA: 0, highestScore: 0, testCount: 0 };
    }
    const relevant = selectedSubjectId === 'all' 
      ? examResults 
      : examResults.filter(r => r.subjectId === selectedSubjectId);

    if (relevant.length === 0) {
      return { avgScore: 0, totalA: 0, highestScore: 0, testCount: 0 };
    }

    const totalScore = relevant.reduce((acc, r) => acc + r.percentage, 0);
    const avgScore = Math.round(totalScore / relevant.length);
    const totalA = relevant.filter(r => r.grade === 'A').length;
    const highestScore = Math.max(...relevant.map(r => r.percentage));

    return {
      avgScore,
      totalA,
      highestScore,
      testCount: relevant.length
    };
  }, [examResults, selectedSubjectId]);

  // Timeline Chart Data
  const timelineChartData = useMemo(() => {
    return filteredResults.map(r => {
      const subject = subjects.find(s => s.id === r.subjectId);
      return {
        id: r.id,
        date: r.date,
        name: r.examName,
        subjectName: subject?.name || 'Subject',
        score: r.percentage,
        rawScore: `${r.score}/${r.maxScore}`,
        grade: r.grade,
        target: 75 // Standard A grade benchmark in A/L
      };
    });
  }, [filteredResults, subjects]);

  // Subject Comparison Chart Data
  const subjectComparisonData = useMemo(() => {
    return subjects.map(s => {
      const subjExams = examResults.filter(r => r.subjectId === s.id);
      const avg = subjExams.length > 0
        ? Math.round(subjExams.reduce((acc, r) => acc + r.percentage, 0) / subjExams.length)
        : 0;
      const latest = subjExams.length > 0
        ? subjExams[subjExams.length - 1].percentage
        : 0;

      return {
        subject: s.name,
        color: s.color,
        average: avg,
        latest: latest,
        testsCount: subjExams.length,
        target: 75
      };
    });
  }, [subjects, examResults]);

  // Grade Distribution Data
  const gradeDistributionData = useMemo(() => {
    const relevant = selectedSubjectId === 'all'
      ? examResults
      : examResults.filter(r => r.subjectId === selectedSubjectId);

    const counts: Record<GradeLetter, number> = { A: 0, B: 0, C: 0, S: 0, F: 0 };
    relevant.forEach(r => {
      if (counts[r.grade] !== undefined) {
        counts[r.grade]++;
      }
    });

    return [
      { grade: 'A (75%+)', count: counts.A, fill: '#10b981' },
      { grade: 'B (65-74%)', count: counts.B, fill: '#3b82f6' },
      { grade: 'C (55-64%)', count: counts.C, fill: '#f59e0b' },
      { grade: 'S (35-54%)', count: counts.S, fill: '#8b5cf6' },
      { grade: 'F (<35%)', count: counts.F, fill: '#ef4444' }
    ];
  }, [examResults, selectedSubjectId]);

  // Helper colors for grade badges
  const getGradeBadge = (grade: GradeLetter) => {
    switch (grade) {
      case 'A': return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'B': return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'C': return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'S': return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'F': return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
  };

  const getExamTypeLabel = (type: ExamResult['examType']) => {
    switch (type) {
      case 'term_test': return 'Term Test';
      case 'model_exam': return 'Model Exam';
      case 'past_paper': return 'Past Paper Practice';
      case 'unit_test': return 'Unit Test';
      case 'other': return 'Other';
    }
  };

  const currentPreviewPercentage = formMaxScore > 0 ? Math.round((formScore / formMaxScore) * 100) : 0;
  const currentPreviewGrade = calculateGrade(formScore, formMaxScore);

  return (
    <div className="space-y-6">
      {/* Optional Top Back Breadcrumb when opened individually */}
      {onBackToSyllabus && (
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={onBackToSyllabus}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subjects & Syllabus</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Exam Results & Performance Graph
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Log your term tests, model exams & past paper scores to visualize progress over time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            title="Reset or clear exam results"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset / Clear</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Exam Score</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Average Score
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.avgScore}%
          </div>
          <span className={`text-xs font-semibold mt-0.5 inline-block ${
            stats.avgScore >= 75 ? 'text-emerald-600' : stats.avgScore >= 65 ? 'text-blue-600' : 'text-amber-600'
          }`}>
            Target Benchmark: 75% (A Grade)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            'A' Grade Count
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.totalA} <span className="text-sm font-normal text-slate-400">/ {stats.testCount}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
            {stats.testCount > 0 ? Math.round((stats.totalA / stats.testCount) * 100) : 0}% of all tests
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Highest Score
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {stats.highestScore}%
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
            Peak performance mark
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Total Logged Exams
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.testCount} Tests
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
            Across active subjects
          </span>
        </div>
      </div>

      {/* Interactive Graph Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Graph Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Chart View:
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartMode('timeline')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartMode === 'timeline' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Score Trend Timeline
              </button>
              <button
                type="button"
                onClick={() => setChartMode('subjects')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartMode === 'subjects' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Subject Averages
              </button>
              <button
                type="button"
                onClick={() => setChartMode('distribution')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartMode === 'distribution' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Grade Breakdown
              </button>
            </div>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedSubjectId('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                selectedSubjectId === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  selectedSubjectId === s.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Graph Display */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {chartMode === 'timeline' && (
            timelineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                            <div className="font-bold text-sm text-blue-400">{data.name}</div>
                            <div className="text-slate-300">{data.subjectName} • {data.date}</div>
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                              <span className="font-extrabold text-white text-sm">{data.score}%</span>
                              <span className="text-slate-400">({data.rawScore})</span>
                              <span className={`px-1.5 py-0.2 font-bold rounded-sm ${
                                data.grade === 'A' ? 'bg-emerald-600' : data.grade === 'B' ? 'bg-blue-600' : 'bg-amber-600'
                              }`}>
                                Grade {data.grade}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={75} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: "Target 'A' (75%)", position: 'top', fill: '#10b981', fontSize: 10 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <BarChart2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No exam results to display</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click "Log New Exam Score" above to record your first test or model paper marks.
                </p>
              </div>
            )
          )}

          {chartMode === 'subjects' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectComparisonData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <div className="font-bold text-sm text-blue-400">{d.subject}</div>
                          <div>Average Score: <strong className="text-emerald-400">{d.average}%</strong></div>
                          <div>Latest Test: <strong>{d.latest}%</strong></div>
                          <div>Logged Tests: <strong>{d.testsCount}</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  y={75} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  label={{ value: "A Grade Target (75%)", position: 'top', fill: '#10b981', fontSize: 10 }} 
                />
                <Bar dataKey="average" name="Average Score" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {subjectComparisonData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.average >= 75 ? '#10b981' : entry.average >= 65 ? '#3b82f6' : '#f59e0b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartMode === 'distribution' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="count" name="Number of Tests" radius={[6, 6, 0, 0]}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Results Log Table & List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-blue-600" />
            Exam Results Log ({filteredResults.length})
          </h3>

          {/* Filter by Exam Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Type:</span>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Exam Types</option>
              <option value="term_test">Term Tests</option>
              <option value="model_exam">Model Exams</option>
              <option value="past_paper">Past Paper Practice</option>
              <option value="unit_test">Unit Tests</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Results Cards List */}
        <div className="space-y-3">
          {filteredResults.map(res => {
            const subj = subjects.find(s => s.id === res.subjectId);
            return (
              <div
                key={res.id}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-lg border shrink-0 ${getGradeBadge(res.grade)}`}>
                    <span>{res.grade}</span>
                    <span className="text-[9px] font-bold opacity-80 -mt-1">{res.percentage}%</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {res.examName}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {subj?.name || 'Subject'}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {getExamTypeLabel(res.examType)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Date: {res.date}</span>
                      <span>•</span>
                      <span>Score: <strong>{res.score}</strong> / {res.maxScore}</span>
                    </div>

                    {res.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 italic">
                        "{res.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {onAskAITutorAboutTopic && (
                    <button
                      type="button"
                      onClick={() => onAskAITutorAboutTopic(subj?.name || 'A/L', res.notes || res.examName)}
                      title="Ask AI Tutor for guidance on this exam"
                      className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-900/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Ask Tutor</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(res)}
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Result"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteExamResult(res.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Result"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No exam results match your current filter.
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding / Editing Result */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                {editingResult ? 'Edit Exam Result' : 'Log New Exam Mark'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              {/* Subject Select */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject *
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              {/* Exam Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Exam Title / Test Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Term Evaluation 2026 or 2024 Past Paper Practice"
                  value={formExamName}
                  onChange={(e) => setFormExamName(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Exam Type & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Exam Type
                  </label>
                  <select
                    value={formExamType}
                    onChange={(e) => setFormExamType(e.target.value as any)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="term_test">Term Test</option>
                    <option value="model_exam">Model Exam</option>
                    <option value="past_paper">Past Paper Practice</option>
                    <option value="unit_test">Unit Test</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Score & Max Score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formMaxScore || 1000}
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Out of (Max Marks) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Calculated Grade Live Preview */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Calculated Percentage & Grade:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {currentPreviewPercentage}%
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-md border ${getGradeBadge(currentPreviewGrade)}`}>
                    Grade {currentPreviewGrade}
                  </span>
                </div>
              </div>

              {/* Notes / Areas for Improvement */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reflection / Weak Areas (Optional)
                </label>
                <textarea
                  placeholder="e.g. Scored full marks in Part A. Need more practice on integration by substitution and time management in essay questions."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingResult ? 'Update Result' : 'Save Score'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Reset & Clear Exam Results Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Reset Exam Results Data
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose how you want to reset your exam records.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Note:</strong> Clearing records will reset your performance graph and analytics for the selected scope.
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Clear All Results */}
              <button
                type="button"
                onClick={() => {
                  if (onResetExamResults) onResetExamResults();
                  setIsResetModalOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
                      Clear All Exam Scores ({examResults.length})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Deletes all logged marks and starts completely blank
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
              </button>

              {/* Option 2: Clear Selected Subject Only */}
              {selectedSubjectId !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClearSubjectExamResults) {
                      onClearSubjectExamResults(selectedSubjectId);
                    }
                    setIsResetModalOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      <Filter className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Clear Only {subjects.find(s => s.id === selectedSubjectId)?.name || 'Filtered'} Scores
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Deletes {filteredResults.length} test marks for this subject only
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {/* Option 3: Restore Default Sample Exam Data */}
              {onRestoreDefaultExamResults && (
                <button
                  type="button"
                  onClick={() => {
                    onRestoreDefaultExamResults();
                    setIsResetModalOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Restore Default Sample Exam Records
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Populate with starter A/L test scores & timeline
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
