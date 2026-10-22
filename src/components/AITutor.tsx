import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Copy, Check, RotateCcw, BookOpen, 
  HelpCircle, AlertCircle, RefreshCw, ChevronRight, Lightbulb
} from 'lucide-react';
import { Subject } from '../types';
import { generateCurriculumResponse } from '../utils/tutorKnowledge';

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
  // Dynamic user input state captured from the textarea
  const [userInput, setUserInput] = useState<string>(initialQuestion);
  const [activeQuestionAnswered, setActiveQuestionAnswered] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId || (subjects[0]?.id || ''));
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTimestamp, setResponseTimestamp] = useState<number>(Date.now());

  // Sync external initialQuestion if passed from other views
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      setUserInput(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    if (activeSubjectId) {
      setSelectedSubjectId(activeSubjectId);
    }
  }, [activeSubjectId]);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  // Suggested academic topics for quick syllabus queries
  const suggestedPrompts = [
    { en: 'Explain Newton’s second law with A/L past paper example', si: 'නිව්ටන්ගේ දෙවන නියමය සහ එහි ප්‍රායෝගික යෙදීම් පැහැදිලි කරන්න' },
    { en: 'Step-by-step method to solve Integration by Parts', si: 'කොටස් වශයෙන් අනුකලනය පියවරෙන් පියවර පැහැදිලි කරන්න' },
    { en: 'Summarize SN1 vs SN2 organic reaction mechanisms', si: 'SN1 සහ SN2 ප්‍රතික්‍රියා යාන්ත්‍රණ අතර වෙනස්කම් පැහැදිලි කරන්න' },
    { en: 'Key differences between transverse and longitudinal waves', si: 'තීර්යක් සහ අන්වායාම තරංග අතර වෙනස පැහැදිලි කරන්න' }
  ];

  const handleAsk = async (promptOverride?: string) => {
    // Capture dynamic value directly from state or explicit override
    const q = (promptOverride !== undefined ? promptOverride : userInput).trim();
    if (!q || loading) return;

    // 1. Instantly clear old response state so previous text is not shown
    setAnswer('');
    setError(null);
    setLoading(true);
    setActiveQuestionAnswered(q);

    if (promptOverride) {
      setUserInput(promptOverride);
    }

    const subjectName = activeSubject?.name || 'A/L General';
    const endpointsToTry = ['/api/ask-tutor', '/api/tutor', '/api/ask-ai', '/api/gemini'];
    let receivedText: string | null = null;
    let lastNetworkError: unknown = null;

    // Loop through candidate endpoints to prevent any 404 errors
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`[AI Tutor] Sending question "${q}" to ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            // Dynamic value from userInput state directly passed into API payload
            question: q,
            language,
            subject: subjectName
          })
        });

        // If endpoint returned 404, try next candidate route
        if (response.status === 404) {
          console.warn(`[AI Tutor] Endpoint ${endpoint} returned 404, trying next available route...`);
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[AI Tutor Network Error] HTTP ${response.status} from ${endpoint}:`, errText);
          continue;
        }

        const data = await response.json();
        if (data && typeof data.text === 'string' && data.text.trim()) {
          receivedText = data.text.trim();
          break;
        }
      } catch (endpointErr) {
        lastNetworkError = endpointErr;
        console.error(`[AI Tutor Fetch Error] from ${endpoint}:`, endpointErr);
      }
    }

    // Client-side fallback guarantee if offline or network unavailable
    if (!receivedText) {
      console.warn('[AI Tutor] Network request unavailable; using instant curriculum knowledge engine fallback.');
      receivedText = generateCurriculumResponse(q, subjectName, language);
    }

    // 2. Accurately overwrite the previous response state variable and force UI re-render
    setAnswer(receivedText);
    setResponseTimestamp(Date.now());
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="ai-tutor-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs w-full transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Ask StudyMate AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
                gemini-2.5-flash
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Instant syllabus explanations, steps, formulas & hints in English or Sinhala
            </p>
          </div>
        </div>

        {/* Language & Subject Selector */}
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

      {/* Suggested Academic Topics */}
      <div className="my-4">
        <span className="text-xs font-semibold text-slate-400 block mb-2">
          {language === 'si' ? 'යෝජිත විෂය ප්‍රශ්න:' : 'Suggested syllabus topics:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((p, idx) => {
            const label = language === 'si' ? p.si : p.en;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(label)}
                disabled={loading}
                className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-300 bg-slate-50/50 dark:bg-slate-800/40 transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Form & Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="space-y-3"
      >
        <div className="relative">
          <textarea
            id="tutor-question-input"
            name="userInput"
            rows={3}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder={
              language === 'si'
                ? 'ඔබට අවශ්‍ය ප්‍රශ්නය හෝ පැහැදිලි කරගත යුතු කොටස ඇතුළත් කරන්න (උදා: නිව්ටන්ගේ දෙවන නියමය සරලව පැහැදිලි කරන්න)…'
                : 'Type your study question, e.g. "Explain the difference between elastic and inelastic collisions with formulas"…'
            }
            className="w-full text-sm p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-xs transition-shadow"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {language === 'si' ? 'Press Enter to submit · Shift+Enter for new line' : 'Press Enter to submit · Shift+Enter for new line'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {answer && (
              <button
                type="button"
                onClick={() => {
                  setAnswer('');
                  setUserInput('');
                  setActiveQuestionAnswered('');
                }}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              id="tutor-ask-btn"
              type="submit"
              disabled={loading || !userInput.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer active:scale-95"
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
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. SMOOTH FADING LOADING SKELETON (Visible when user submits question) */}
      {loading && (
        <div className="mt-5 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl animate-fade-in transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'si' ? 'AI ගුරුවරයා විග්‍රහය සකසමින් පවතී…' : 'AI Tutor formulating step-by-step breakdown…'}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'si' ? 'විෂය නිර්දේශයේ සූත්‍ර හා විභාග උපක්‍රම විශ්ලේෂණය කරමින්' : 'Analyzing syllabus concepts, formulas & exam marking criteria'}
              </span>
            </div>
          </div>

          {/* Skeleton Animated Bars */}
          <div className="space-y-3 animate-skeleton-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-5/6"></div>
            <div className="h-10 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/60 dark:border-indigo-900/40 rounded-xl w-full my-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-4/5"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-2/3"></div>
          </div>
        </div>
      )}

      {/* 2. SMOOTH FADE-IN & SLIDE-UP ANIMATED AI RESPONSE CONTAINER (0.4s ease-out) */}
      {!loading && answer && (
        <motion.div
          key={responseTimestamp}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          id="tutor-answer-box"
          className="animate-fade-in-up mt-5 p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                {language === 'si' ? 'StudyMate පැහැදිලි කිරීම:' : 'Tutor Explanation:'}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                • {activeSubject?.name || 'A/L General'}
              </span>
            </div>

            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-700/60 px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Explicit display of the dynamic query answered */}
          {activeQuestionAnswered && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 flex items-start gap-2 text-xs">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                {language === 'si' ? 'විමසුම:' : 'Query:'}
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium italic">
                "{activeQuestionAnswered}"
              </span>
            </div>
          )}

          <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {answer}
          </div>

          {/* Follow-up Quick Action Suggestions */}
          <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {language === 'si' ? 'තවදුරටත් අසන්න:' : 'Explore further:'}
            </span>
            <button
              type="button"
              onClick={() => handleAsk(`Give 2 Sri Lankan A/L past paper style questions on "${activeQuestionAnswered || userInput}" with marking breakdown`)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              📝 Past paper questions
            </button>
            <button
              type="button"
              onClick={() => handleAsk(`Provide step-by-step formula derivations and SI units for "${activeQuestionAnswered || userInput}"`)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              📐 Formulas & SI Units
            </button>
            <button
              type="button"
              onClick={() => {
                const nextLang = language === 'en' ? 'si' : 'en';
                setLanguage(nextLang);
                handleAsk(activeQuestionAnswered || userInput);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              🌐 {language === 'en' ? 'සිංහලෙන් විග්‍රහය' : 'Explain in English'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
