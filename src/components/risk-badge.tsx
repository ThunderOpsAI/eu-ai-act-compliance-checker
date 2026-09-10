import React from 'react';
import type { RiskTier } from '@/types/database';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  tier: RiskTier;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export function RiskBadge({ tier, size = 'md', showDescription = false }: RiskBadgeProps) {
  const configs = {
    Unacceptable: {
      label: 'Unacceptable Risk (Prohibited)',
      shortLabel: 'Prohibited / Unacceptable',
      subtext: 'Banned under Article 5 of the EU AI Act.',
      bgColor: 'bg-red-500/10 dark:bg-red-950/40',
      borderColor: 'border-red-500/30 dark:border-red-700/50',
      textColor: 'text-red-700 dark:text-red-400',
      badgeColor: 'bg-red-600 text-white',
      icon: AlertOctagon,
    },
    High: {
      label: 'High Risk (Annex III)',
      shortLabel: 'High Risk — Annex III',
      subtext: 'Subject to strict conformity assessment & Chapter 2 obligations.',
      bgColor: 'bg-amber-500/10 dark:bg-amber-950/40',
      borderColor: 'border-amber-500/30 dark:border-amber-700/50',
      textColor: 'text-amber-700 dark:text-amber-400',
      badgeColor: 'bg-amber-600 text-white',
      icon: AlertTriangle,
    },
    Limited: {
      label: 'Limited Risk (Article 50)',
      shortLabel: 'Limited Risk — Transparency',
      subtext: 'Subject to transparency disclosures and synthetic content labeling.',
      bgColor: 'bg-blue-500/10 dark:bg-blue-950/40',
      borderColor: 'border-blue-500/30 dark:border-blue-700/50',
      textColor: 'text-blue-700 dark:text-blue-400',
      badgeColor: 'bg-blue-600 text-white',
      icon: Info,
    },
    Minimal: {
      label: 'Minimal / No Risk',
      shortLabel: 'Minimal Risk',
      subtext: 'Permitted with no mandatory statutory restrictions under the Act.',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-500/30 dark:border-emerald-700/50',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      badgeColor: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
    },
  };

  const config = configs[tier] || configs.Minimal;
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeColor}`}>
        <Icon className="w-3 h-3" />
        {config.shortLabel}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`rounded-2xl border p-6 ${config.bgColor} ${config.borderColor} transition-all`}>
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${config.badgeColor} shadow-md`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                EU AI Act Classification
              </span>
            </div>
            <h3 className={`text-2xl font-black tracking-tight ${config.textColor}`}>
              {config.label}
            </h3>
            {showDescription && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                {config.subtext}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.bgColor} ${config.borderColor} ${config.textColor} font-semibold text-sm`}>
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
}
