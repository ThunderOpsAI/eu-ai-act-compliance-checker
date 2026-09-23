'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2, BookOpen, ShieldAlert } from 'lucide-react';
import { analyzeComplianceAction } from '@/actions/analyze';
import { ensureAnonymousUser } from '@/lib/auth/auth-service';
import type { ComplianceReport } from '@/types/database';

interface ComplianceFormProps {
  onReportGenerated: (report: ComplianceReport) => void;
  onAnalysisStateChange?: (isAnalyzing: boolean, stepMessage?: string) => void;
  onInputChange?: (hasValidInput: boolean) => void;
}

const PRESETS = [
  {
    title: 'Recruitment & CV Screening',
    systemName: 'TalentScreen CV Evaluator v2',
    tag: 'Annex III',
    text: 'An automated candidate screening and scoring engine that parses resume PDFs, video interview transcripts, and work histories to rank candidates for hiring and promotion decisions.',
  },
  {
    title: 'Customer Support Chatbot',
    systemName: 'SupportBot E-Commerce LLM',
    tag: 'Article 50',
    text: 'A conversational customer support chatbot deployed on our e-commerce storefront to resolve order tracking inquiries and provide product recommendations to consumers.',
  },
  {
    title: 'Subliminal Behavioral Nudge',
    systemName: 'AudioNudge Subliminal Engine',
    tag: 'Article 5',
    text: 'An AI audio plugin that embeds high-frequency imperceptible subliminal acoustic patterns into mobile games to induce in-app purchases among adolescent players without conscious awareness.',
  },
  {
    title: 'Warehouse Stock Recommender',
    systemName: 'LogiStock Predictor AI',
    tag: 'Minimal Risk',
    text: 'A predictive inventory management system using linear regression and tree ensembles to optimize re-order quantities of automotive replacement parts based on seasonal order volumes.',
  },
];

const ANALYSIS_STEPS = [
  'Verifying inputs against Article 5 (Prohibited Practices)...',
  'Cross-referencing Annex III (High-Risk Critical Domains)...',
  'Evaluating Article 50 (Transparency & Chatbot Disclosures)...',
  'Formulating statutory obligations & remediation checklist...',
];

export function ComplianceForm({
  onReportGenerated,
  onAnalysisStateChange,
  onInputChange,
}: ComplianceFormProps) {
  const [systemName, setSystemName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [description, setDescription] = useState('');
  const [isDescFocused, setIsDescFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Floating label active states
  const isNameFloating = isNameFocused || systemName.trim().length > 0;
  const isDescFloating = isDescFocused || description.trim().length > 0;

  // Initialize or restore anonymous user on mount
  useEffect(() => {
    async function initUser() {
      try {
        const uid = await ensureAnonymousUser();
        setUserId(uid);
      } catch (err) {
        console.warn('Anonymous user auto-init deferred to submit:', err);
      }
    }
    initUser();
  }, []);

  // Cycle through loading steps during analysis
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = (prev + 1) % ANALYSIS_STEPS.length;
        onAnalysisStateChange?.(true, ANALYSIS_STEPS[next]);
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [loading, onAnalysisStateChange]);

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    onInputChange?.(text.trim().length >= 10);
  };

  const handlePresetSelect = (preset: typeof PRESETS[number]) => {
    setSystemName(preset.systemName);
    handleDescriptionChange(preset.text);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 10) {
      setError('Please provide at least 10 characters describing your AI system.');
      return;
    }

    setLoading(true);
    onAnalysisStateChange?.(true, ANALYSIS_STEPS[0]);

    try {
      // Ensure we have a valid anonymous UID
      let activeUserId = userId;
      if (!activeUserId) {
        activeUserId = await ensureAnonymousUser();
        setUserId(activeUserId);
      }

      const payloadDescription = systemName.trim()
        ? `[System Name: ${systemName.trim()}]\n\n${trimmedDesc}`
        : trimmedDesc;

      const result = await analyzeComplianceAction({
        systemDescription: payloadDescription,
        userId: activeUserId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete classification.');
      }

      onAnalysisStateChange?.(false);
      onReportGenerated(result.report);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(msg);
      onAnalysisStateChange?.(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form data-testid="form-container" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/20 overflow-hidden transition-all">
          <div className="p-6 sm:p-8 space-y-5">
            {/* Input 1: System Name / Model Identifier with Floating Label */}
            <div className="relative">
              <input
                id="system-name"
                type="text"
                value={systemName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                onChange={(e) => setSystemName(e.target.value)}
                disabled={loading}
                className={`peer w-full rounded-xl border bg-slate-50/60 dark:bg-slate-950/60 px-4 pt-6 pb-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-transparent focus:outline-none transition-all duration-200 disabled:opacity-60 ${
                  isNameFocused
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/25 dark:ring-blue-500/20 bg-white dark:bg-slate-950 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                placeholder="System Name"
              />
              <label
                htmlFor="system-name"
                className={`absolute left-4 transition-all duration-200 ease-out pointer-events-none select-none flex items-center gap-1.5 ${
                  isNameFloating
                    ? 'top-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase'
                    : 'top-4 text-sm font-normal text-slate-400 dark:text-slate-500'
                }`}
              >
                <span>AI System Name or Internal Identifier</span>
                <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400 dark:text-slate-500">
                  (optional)
                </span>
              </label>
            </div>

            {/* Input 2: System Description / Architecture with Floating Label */}
            <div className="relative">
              <textarea
                id="system-description"
                rows={6}
                value={description}
                onFocus={() => setIsDescFocused(true)}
                onBlur={() => setIsDescFocused(false)}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                disabled={loading}
                placeholder="Paste system prompt or product description here..."
                className={`peer w-full rounded-xl border bg-slate-50/60 dark:bg-slate-950/60 px-4 pt-7 pb-4 text-sm text-slate-900 dark:text-slate-100 placeholder-transparent focus:outline-none transition-all duration-200 disabled:opacity-60 resize-y leading-relaxed font-normal ${
                  isDescFocused
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/25 dark:ring-blue-500/20 bg-white dark:bg-slate-950 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              />
              <label
                htmlFor="system-description"
                className={`absolute left-4 transition-all duration-200 ease-out pointer-events-none select-none flex items-center gap-1.5 ${
                  isDescFloating
                    ? 'top-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase'
                    : 'top-4 text-sm font-normal text-slate-400 dark:text-slate-500'
                }`}
              >
                <span>AI System Description, Architecture & Intended Purpose</span>
                <span className="text-red-500 font-bold">*</span>
              </label>

              {/* Status and Character Counter Bar */}
              <div className="flex items-center justify-between px-1 pt-1.5 text-xs text-slate-400 font-mono">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {description.trim().length >= 10 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready for classification</span>
                  ) : (
                    <span>Min. 10 characters required</span>
                  )}
                </span>
                <span data-testid="char-counter" className="tabular-nums font-medium text-[11px]">
                  {description.length.toLocaleString()} / 10,000 chars
                </span>
              </div>
            </div>

            {error && (
              <div
                data-testid="error-boundary"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
                <button
                  data-testid="retry-button"
                  type="submit"
                  className="shrink-0 text-xs font-semibold underline underline-offset-2 text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Presets */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Or select a regulatory test scenario:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    disabled={loading}
                    data-testid="preset-button" onClick={() => handlePresetSelect(preset)}
                    className="text-left p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between group disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {preset.title}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all">
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50/90 dark:bg-slate-950/80 px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/20" />
              <span>EU Regulation 2024/1689 Reference Engine</span>
            </span>

            <button
              type="submit"
              disabled={loading || description.trim().length < 10}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Classifying Risk Tier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Check EU AI Act Compliance</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Loading Stepper Animation */}
      {loading && (
        <div
          data-testid="progress-stepper"
          className="mt-6 p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-center animate-fade-in shadow-xs"
        >
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-xs sm:text-sm font-semibold text-blue-950 dark:text-blue-200">
              {ANALYSIS_STEPS[currentStepIndex]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
