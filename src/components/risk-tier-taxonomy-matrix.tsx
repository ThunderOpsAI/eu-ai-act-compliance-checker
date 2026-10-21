'use client';

import React, { useState } from 'react';
import { RiskTier } from '@/types/database';
import { CheckCircle2, ShieldAlert, AlertTriangle, Info, Check, Sparkles } from 'lucide-react';

interface RiskTierInfo {
  tier: RiskTier;
  label: string;
  tagline: string;
  annexArticle: string;
  colorBorder: string;
  colorBg: string;
  colorBadgeBg: string;
  colorText: string;
  icon: React.ReactNode;
  obligationsCount: string;
  penalties: string;
}

const RISK_TIERS: RiskTierInfo[] = [
  {
    tier: 'Unacceptable',
    label: 'Unacceptable Risk',
    tagline: 'Strictly Prohibited AI Practices',
    annexArticle: 'Article 5 (Prohibitions)',
    colorBorder: 'border-red-500/60 dark:border-red-500/70',
    colorBg: 'bg-red-500/10 dark:bg-red-950/30',
    colorBadgeBg: 'bg-red-500/20 text-red-400 border border-red-500/30',
    colorText: 'text-red-500',
    icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
    obligationsCount: 'Prohibited from EU Market',
    penalties: 'Up to €35M or 7% of Global Turnover',
  },
  {
    tier: 'High',
    label: 'High-Risk',
    tagline: 'Annex III & Safety Components (Regulated)',
    annexArticle: 'Annex III / Articles 6, 9–17',
    colorBorder: 'border-amber-500/60 dark:border-amber-500/70',
    colorBg: 'bg-amber-500/10 dark:bg-amber-950/30',
    colorBadgeBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    colorText: 'text-amber-500',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    obligationsCount: 'Mandatory Conformity & Governance',
    penalties: 'Up to €15M or 3% of Global Turnover',
  },
  {
    tier: 'Limited',
    label: 'Limited-Risk / Transparency',
    tagline: 'Informational AI & GenAI Systems',
    annexArticle: 'Article 50 (Transparency)',
    colorBorder: 'border-blue-500/60 dark:border-blue-500/70',
    colorBg: 'bg-blue-500/10 dark:bg-blue-950/30',
    colorBadgeBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    colorText: 'text-blue-500',
    icon: <Info className="w-5 h-5 text-blue-500" />,
    obligationsCount: 'User Disclosure & Watermarking',
    penalties: 'Up to €7.5M or 1.5% of Global Turnover',
  },
  {
    tier: 'Minimal',
    label: 'Minimal / No Risk',
    tagline: 'Unregulated Routine AI Systems',
    annexArticle: 'Article 95 (Codes of Conduct)',
    colorBorder: 'border-emerald-500/60 dark:border-emerald-500/70',
    colorBg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    colorBadgeBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    colorText: 'text-emerald-500',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    obligationsCount: 'Voluntary Code of Practice',
    penalties: 'Standard Commercial Law Only',
  },
];

interface ComplianceChecklistItem {
  id: string;
  article: string;
  title: string;
  description: string;
  mandatory: boolean;
  timeframe: string;
}

const DEFAULT_CHECKLISTS: Record<RiskTier, ComplianceChecklistItem[]> = {
  Unacceptable: [
    {
      id: 'unacc-1',
      article: 'Article 5(1)(a)',
      title: 'Halt Prohibited Subliminal & Deceptive Techniques',
      description: 'Ensure system does not deploy subliminal techniques beyond consciousness or purposeful deceptive tactics distorting behavior.',
      mandatory: true,
      timeframe: 'Immediate Prohibition (Feb 2025)',
    },
    {
      id: 'unacc-2',
      article: 'Article 5(1)(c)',
      title: 'Cease Social Scoring & General Trust Profiling',
      description: 'Decommission any evaluations leading to unjustified detrimental treatment across multiple social contexts.',
      mandatory: true,
      timeframe: 'Immediate Prohibition (Feb 2025)',
    },
    {
      id: 'unacc-3',
      article: 'Article 5(1)(d)',
      title: 'Audit Biometric Categorization & Emotion Recognition',
      description: 'Remove emotion recognition in workplaces and educational institutions unless for verified medical or safety reasons.',
      mandatory: true,
      timeframe: 'Immediate Prohibition (Feb 2025)',
    },
  ],
  High: [
    {
      id: 'high-1',
      article: 'Article 9',
      title: 'Continuous Risk Management System',
      description: 'Establish, implement, document, and maintain an ongoing iterative risk management system throughout the entire AI lifecycle.',
      mandatory: true,
      timeframe: 'Prior to Market Placement (Aug 2026)',
    },
    {
      id: 'high-2',
      article: 'Article 10',
      title: 'Data Quality & Bias Governance',
      description: 'Ensure training, validation, and testing datasets meet high standards for relevance, representativeness, and statistical balance.',
      mandatory: true,
      timeframe: 'Development & Pre-deployment',
    },
    {
      id: 'high-3',
      article: 'Article 11 & Annex IV',
      title: 'Comprehensive Technical Documentation',
      description: 'Draft living technical documentation demonstrating compliance and keeping it available for national supervisory authorities.',
      mandatory: true,
      timeframe: '10 Years Post-Market Placement',
    },
    {
      id: 'high-4',
      article: 'Article 12',
      title: 'Automated Logging & Traceability',
      description: 'Build native event logging capabilities enabling trace auditing across inference cycles and error conditions.',
      mandatory: true,
      timeframe: 'Operational Deployment',
    },
    {
      id: 'high-5',
      article: 'Article 13',
      title: 'Transparency & Provision of User Instructions',
      description: 'Provide deployers with concise, accessible instructions covering operational capabilities, known limits, and human oversight specs.',
      mandatory: true,
      timeframe: 'Delivery to Deployers',
    },
    {
      id: 'high-6',
      article: 'Article 14',
      title: 'Human Oversight Architecture',
      description: 'Implement built-in operational safeguards allowing human overseers to understand, override, or interrupt the system.',
      mandatory: true,
      timeframe: 'Design & Deployment Phase',
    },
    {
      id: 'high-7',
      article: 'Article 15',
      title: 'Cybersecurity, Accuracy & Robustness Testing',
      description: 'Subject models to adversarial perturbation testing, fail-safe fallback design, and cybersecurity hardening.',
      mandatory: true,
      timeframe: 'Pre-deployment Verification',
    },
  ],
  Limited: [
    {
      id: 'lim-1',
      article: 'Article 50(1)',
      title: 'Direct Interaction Notice (AI Identity Disclosure)',
      description: 'Inform natural persons in a timely, clear manner that they are directly interacting with an AI system.',
      mandatory: true,
      timeframe: 'At Point of Interaction',
    },
    {
      id: 'lim-2',
      article: 'Article 50(2)',
      title: 'Synthetic Content & Deepfake Watermarking',
      description: 'Ensure synthetic audio, image, video, or text outputs are machine-readable and visibly tagged as artificially generated.',
      mandatory: true,
      timeframe: 'Inference Output Generation',
    },
    {
      id: 'lim-3',
      article: 'Article 50(4)',
      title: 'Emotion Recognition / Biometric Categorization Disclosure',
      description: 'Disclose the operation of emotion detection or biometric categorization to affected persons before processing.',
      mandatory: true,
      timeframe: 'Prior to Exposure',
    },
  ],
  Minimal: [
    {
      id: 'min-1',
      article: 'Article 95',
      title: 'Voluntary Code of Conduct Adherence',
      description: 'Optional adoption of trustworthy AI guidelines, environmental sustainability reporting, and algorithmic transparency.',
      mandatory: false,
      timeframe: 'Voluntary / Self-Paced',
    },
    {
      id: 'min-2',
      article: 'GDPR Alignment',
      title: 'Standard EU Data Protection & Consumer Law',
      description: 'Maintain normal compliance with GDPR, e-Privacy Directive, and national unfair competition statutes.',
      mandatory: true,
      timeframe: 'Ongoing Corporate Standard',
    },
  ],
};

interface RiskTierTaxonomyMatrixProps {
  currentTier: RiskTier;
  confidenceScore?: number;
  confidenceLevel?: string;
  matchedArticle?: string;
  matchedCategory?: string;
}

export function RiskTierTaxonomyMatrix({
  currentTier,
  confidenceScore = 92,
  confidenceLevel = 'High',
  matchedArticle,
  matchedCategory,
}: RiskTierTaxonomyMatrixProps) {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklist = DEFAULT_CHECKLISTS[currentTier] || [];
  const completedCount = checklist.filter((item) => completedItems[item.id]).length;
  const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="w-full space-y-6" data-testid="risk-tier-taxonomy-matrix">
      {/* 4-Tier Visual Classification Matrix Cards */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>EU AI Act 4-Tier Risk Taxonomy Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categorization under Regulation (EU) 2024/1689. Current system matched to highlighted tier.
            </p>
          </div>

          {/* Confidence & Certainty Meter */}
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Classification Certainty
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{confidenceScore}%</span>
                <span>({confidenceLevel} Confidence)</span>
              </div>
            </div>
            <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RISK_TIERS.map((tierInfo) => {
            const isCurrent = tierInfo.tier === currentTier;

            return (
              <div
                key={tierInfo.tier}
                className={`relative rounded-xl p-4 transition-all duration-200 border ${
                  isCurrent
                    ? `${tierInfo.colorBorder} ${tierInfo.colorBg} shadow-lg ring-2 ring-blue-500/30 scale-[1.02]`
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-60 hover:opacity-90'
                }`}
              >
                {/* Active Indicator Badge */}
                {isCurrent && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Current Outcome
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {tierInfo.icon}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {tierInfo.label}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-3 line-clamp-2">
                  {tierInfo.tagline}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/50 text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase">Statutory Basis:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {isCurrent && matchedArticle ? matchedArticle : tierInfo.annexArticle}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase">Obligations:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {tierInfo.obligationsCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matched Annex / Article Citation Pill Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Matched Legal Basis &amp; Scope:
            </span>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono border border-blue-500/30">
              {matchedArticle || 'Regulation (EU) 2024/1689'}
            </span>
            {matchedCategory && (
              <span className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Category: {matchedCategory}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-500">
            Penalties: {RISK_TIERS.find((t) => t.tier === currentTier)?.penalties}
          </span>
        </div>
      </div>

      {/* Interactive Compliance Action Checklist */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Interactive Statutory Compliance Checklist</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track mandatory and recommended actions for this risk tier before EU market deployment.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {completedCount} of {checklist.length} Completed ({progressPct}%)
            </span>
            <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => {
            const isDone = Boolean(completedItems[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
                }`}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isDone
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                      {item.article}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.mandatory
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.mandatory ? 'MANDATORY' : 'RECOMMENDED'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {item.timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
