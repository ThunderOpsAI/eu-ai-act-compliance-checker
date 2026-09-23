import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50/80 dark:bg-slate-900/60 leading-normal">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong className="font-semibold text-slate-800 dark:text-slate-200">Statutory Notice:</strong> This automated tool provides regulatory risk classification for informational purposes and does not constitute formal legal counsel under Regulation (EU) 2024/1689.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-start gap-3.5">
        <div className="rounded-lg bg-amber-100/90 dark:bg-amber-900/60 p-2 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
              Legal & Regulatory Disclaimer
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700/80 dark:text-amber-400/80">
              Informational Only
            </span>
          </div>
          <p className="text-amber-900/80 dark:text-amber-300/80 leading-relaxed font-normal">
            This tool provides an automated risk assessment based on Regulation (EU) 2024/1689 (EU AI Act). It does <strong>not constitute formal legal counsel</strong>, legal advice, or official conformity certification. High-risk and prohibited designations require definitive review by qualified legal counsel and designated notified bodies before deployment in the European Single Market.
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Raw system inputs are processed strictly in-memory and are never stored or logged to persistent databases.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
