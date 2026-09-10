import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 dark:border-slate-800 rounded-md p-2 bg-slate-50 dark:bg-slate-900/50">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong>Notice:</strong> This automated tool provides regulatory risk classification for informational purposes only and does <strong>not constitute legal advice</strong> under Regulation (EU) 2024/1689.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 dark:bg-amber-900/50 p-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-sm">
          <h4 className="font-semibold text-amber-900 dark:text-amber-200">
            Legal & Regulatory Disclaimer
          </h4>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            This tool provides an automated risk assessment based on Regulation (EU) 2024/1689 (EU AI Act). It does <strong>not constitute formal legal counsel</strong>, legal advice, or official regulatory certification. High-risk and prohibited designations require definitive review by qualified legal counsel and designated notified bodies before deployment in the European Single Market.
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Raw system inputs are processed in-memory and are never stored or logged to databases.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
