import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, RotateCcw, HelpCircle, BookOpen, Globe } from 'lucide-react';
import { Subject } from '../types';

interface AITutorProps {
  subjects: Subject[];
  activeSubjectId: string;
  initialQuestion?: string;
}

export const AITutor: React.FC<AITutorProps> = ({
  subjects,
  activeSubjectId,
  initialQuestion = ''
}) => {
  const [language, setLanguage] = useState<'en' | 'si'>('en');
  const [question, setQuestion] = useState(initialQuestion);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || (subjects[0]?.id || ''));
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  // Suggested prompt pills
  const samplePrompts = [
    { en: 'Explain Newton’s second law with A/L past paper example', si: 'නිව්ටන්ගේ දෙවන නියමය සහ එහි ප්‍රායෝගික යෙදීම් පැහැදිලි කරන්න' },
    { en: 'Step-by-step method to solve Integration by Parts', si: 'කොටස් වශයෙන් අනුකලනය පියවරෙන් පියවර පැහැදිලි කරන්න' },
    { en: 'Summarize SN1 vs SN2 organic reaction mechanisms', si: 'SN1 සහ SN2 ප්‍රතික්‍රියා යාන්ත්‍රණ අතර වෙනස්කම් පැහැදිලි කරන්න' },
    { en: 'Key differences between transverse and longitudinal waves', si: 'තීර්යක් සහ අන්වායාම තරංග අතර වෙනස පැහැදිලි කරන්න' }
  ];

  const handleAsk = async (promptOverride?: string) => {
    const q = (promptOverride !== undefined ? promptOverride : question).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    if (promptOverride) {
      setQuestion(promptOverride);
    }

    try {
      const response = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language,
          subject: activeSubject?.name || 'A/L General'
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected response (${response.status})`);
      }

      if (!response.ok || !data) {
        throw new Error(data?.error || `Server error (${response.status})`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnswer(data.text || 'No response generated.');
    } catch (err: unknown) {
      console.error('Tutor ask error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(
        language === 'si'
          ? `දෝෂයක් සිදු විය (${msg}). කරුණාකර නැවත උත්සාහ කරන්න.`
          : `Something went wrong: ${msg}. Please check your connection or try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="ai-tutor-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              🤖 Ask StudyMate AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Instant syllabus explanations, steps, formulas & hints in English or Sinhala
            </p>
          </div>
        </div>

        {/* Language & Subject Context Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('si')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                language === 'si'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              සිංහල
            </button>
          </div>

          {/* Subject Context Selector */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="flex-1 sm:flex-none text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">General Subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="my-4">
        <span className="text-xs font-semibold text-slate-400 block mb-2">
          {language === 'si' ? 'උදාහරණ ප්‍රශ්න:' : 'Suggested topics:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => {
            const label = language === 'si' ? p.si : p.en;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(label)}
                disabled={loading}
                className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-300 bg-slate-50/50 dark:bg-slate-800/40 transition-colors text-left cursor-pointer"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <textarea
          id="tutor-question-input"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            language === 'si'
              ? 'ඔබට අවශ්‍ය ප්‍රශ්නය හෝ පැහැදිලි කරගත යුතු කොටස ඇතුළත් කරන්න (උදා: නිව්ටන්ගේ දෙවන නියමය සරලව පැහැදිලි කරන්න)…'
              : 'Type your study question, e.g. "Explain the difference between elastic and inelastic collisions with formulas"…'
          }
          className="w-full text-sm p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-xs"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {language === 'si' ? 'සිංහල හෝ ඉංග්‍රීසි භාෂාවෙන් විමසන්න' : 'Powered by Gemini AI'}
          </span>

          <div className="flex items-center gap-2">
            {answer && (
              <button
                type="button"
                onClick={() => {
                  setAnswer('');
                  setQuestion('');
                }}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              id="tutor-ask-btn"
              type="button"
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'si' ? 'සිතමින්…' : 'Thinking…'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{language === 'si' ? 'පැහැදිලි කරන්න' : 'Explain'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Answer Container */}
      {answer && (
        <div id="tutor-answer-box" className="mt-5 p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'si' ? 'StudyMate පැහැදිලි කිරීම:' : 'Tutor Explanation:'}
            </span>

            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};
