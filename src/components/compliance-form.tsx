'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2, BookOpen, ShieldAlert } from 'lucide-react';
import { analyzeComplianceAction } from '@/actions/analyze';
import { ensureAnonymousUser } from '@/lib/auth/auth-service';
import type { ComplianceReport } from '@/types/database';

interface ComplianceFormProps {
  onReportGenerated: (report: ComplianceReport) => void;
}

const PRESETS = [
  {
    title: 'Recruitment & CV Screening',
    tag: 'Annex III',
    text: 'An automated candidate screening and scoring engine that parses resume PDFs, video interview transcripts, and work histories to rank candidates for hiring and promotion decisions.',
  },
  {
    title: 'Customer Support Chatbot',
    tag: 'Article 50',
    text: 'A conversational customer support chatbot deployed on our e-commerce storefront to resolve order tracking inquiries and provide product recommendations to consumers.',
  },
  {
    title: 'Subliminal Behavioral Nudge',
    tag: 'Article 5',
    text: 'An AI audio plugin that embeds high-frequency imperceptible subliminal acoustic patterns into mobile games to induce in-app purchases among adolescent players without conscious awareness.',
  },
  {
    title: 'Warehouse Stock Recommender',
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

export function ComplianceForm({ onReportGenerated }: ComplianceFormProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
      setCurrentStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = description.trim();
    if (trimmed.length < 10) {
      setError('Please provide at least 10 characters describing your AI system.');
      return;
    }

    setLoading(true);
    try {
      // Ensure we have a valid anonymous UID
      let activeUserId = userId;
      if (!activeUserId) {
        activeUserId = await ensureAnonymousUser();
        setUserId(activeUserId);
      }

      const result = await analyzeComplianceAction({
        systemDescription: trimmed,
        userId: activeUserId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete classification.');
      }

      onReportGenerated(result.report);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="system-description"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Describe Your AI System & Intended Purpose
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {description.length}/10,000 chars
              </span>
            </div>

            <textarea
              id="system-description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Paste your system prompt, data architecture, or product description here (e.g., 'An automated AI engine that analyzes video interviews to rank candidates for hiring...')"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-60 resize-y"
            />

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Or try a realistic sample use case:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    disabled={loading}
                    onClick={() => setDescription(preset.text)}
                    className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-xs text-slate-600 dark:text-slate-300 transition-all flex items-center justify-between group disabled:opacity-50"
                  >
                    <span className="font-medium truncate pr-2">{preset.title}</span>
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Verified against EU Regulation 2024/1689
            </span>

            <button
              type="submit"
              disabled={loading || description.trim().length < 10}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
        <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {ANALYSIS_STEPS[currentStepIndex]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
