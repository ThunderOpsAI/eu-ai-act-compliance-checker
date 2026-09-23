import React from 'react';
import type { RiskTier } from '@/types/database';
import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  tier: RiskTier;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export function RiskBadge({ tier, size = 'md', showDescription = false, className = '' }: RiskBadgeProps) {
  const configs = {
    Unacceptable: {
      label: 'Unacceptable Risk (Prohibited)',
      shortLabel: 'Prohibited / Unacceptable',
      subtext: 'Banned under Article 5 of Regulation (EU) 2024/1689. Deployment and marketing strictly prohibited in the EU.',
      bgColor: 'bg-red-500/10 dark:bg-red-950/30',
      borderColor: 'border-red-500/30 dark:border-red-800/60',
      textColor: 'text-red-700 dark:text-red-300',
      accentColor: 'text-red-600 dark:text-red-400',
      badgeColor: 'bg-red-600 text-white shadow-sm shadow-red-600/30',
      icon: AlertOctagon,
      legalRef: 'Article 5 Prohibition',
    },
    High: {
      label: 'High Risk (Annex III)',
      shortLabel: 'High Risk — Annex III',
      subtext: 'Subject to strict conformity assessments, fundamental rights impact assessment, and Chapter 2 statutory obligations.',
      bgColor: 'bg-amber-500/10 dark:bg-amber-950/30',
      borderColor: 'border-amber-500/30 dark:border-amber-800/60',
      textColor: 'text-amber-800 dark:text-amber-300',
      accentColor: 'text-amber-600 dark:text-amber-400',
      badgeColor: 'bg-amber-600 text-white shadow-sm shadow-amber-600/30',
      icon: AlertTriangle,
      legalRef: 'Annex III Classification',
    },
    Limited: {
      label: 'Limited Risk (Transparency)',
      shortLabel: 'Limited Risk — Article 50',
      subtext: 'Subject to statutory transparency disclosures, user notification, and synthetic media watermarking under Article 50.',
      bgColor: 'bg-blue-500/10 dark:bg-blue-950/30',
      borderColor: 'border-blue-500/30 dark:border-blue-800/60',
      textColor: 'text-blue-800 dark:text-blue-300',
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeColor: 'bg-blue-600 text-white shadow-sm shadow-blue-600/30',
      icon: ShieldAlert,
      legalRef: 'Article 50 Transparency',
    },
    Minimal: {
      label: 'Minimal / No Risk',
      shortLabel: 'Minimal Risk',
      subtext: 'Permitted with no mandatory statutory restrictions under the Act. Voluntary adherence to ethical codes of conduct welcomed.',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-500/30 dark:border-emerald-800/60',
      textColor: 'text-emerald-800 dark:text-emerald-300',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badgeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
      icon: CheckCircle2,
      legalRef: 'Article 69 Minimal Tier',
    },
  };

  const config = configs[tier] || configs.Minimal;
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${config.badgeColor} print:shadow-none print:border print:border-current ${className}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="whitespace-nowrap">{config.shortLabel}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-7 ${config.bgColor} ${config.borderColor} transition-all shadow-sm print:bg-white print:border-slate-400 print:shadow-none print:p-5 print:break-inside-avoid ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`p-4 rounded-xl ${config.badgeColor} shrink-0 print:shadow-none`}>
              <Icon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 print:text-slate-600">
                <span>EU AI Act Classification</span>
                <span aria-hidden="true">·</span>
                <span className={`${config.accentColor} print:text-black font-bold`}>{config.legalRef}</span>
              </div>
              <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${config.textColor} print:text-black`}>
                {config.label}
              </h3>
              {showDescription && (
                <p className="text-sm font-normal text-slate-700 dark:text-slate-300 print:text-slate-800 max-w-2xl leading-relaxed pt-0.5">
                  {config.subtext}
                </p>
              )}
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-end justify-center shrink-0 border-l border-slate-200/60 dark:border-slate-800/80 print:border-slate-300 pl-6">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 print:text-slate-600 uppercase tracking-wider">Statutory Level</span>
            <span className={`text-base font-extrabold ${config.accentColor} print:text-black`}>
              {tier === 'Unacceptable' ? 'Level 4 / Prohibited' : tier === 'High' ? 'Level 3 / High Risk' : tier === 'Limited' ? 'Level 2 / Transparency' : 'Level 1 / Permitted'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor} font-semibold text-sm print:bg-white print:border-slate-400 print:text-black print:shadow-none ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{config.label}</span>
    </div>
  );
}
