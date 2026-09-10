'use client';

import React, { useState } from 'react';
import { ShieldCheck, Scale, FileText, CheckCircle } from 'lucide-react';
import { Disclaimer } from '@/components/disclaimer';
import { ComplianceForm } from '@/components/compliance-form';
import { ResultView } from '@/components/result-view';
import { ErrorBoundary } from '@/components/error-boundary';
import type { ComplianceReport } from '@/types/database';

export default function HomePage() {
  const [report, setReport] = useState<ComplianceReport | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top EU-Styled Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  EU AI Act Compliance Checker
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Reg 2024/1689
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Automated Risk Tier & Statutory Obligations Classifier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero-Storage Guarantee</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <ErrorBoundary>
          {!report ? (
            <div className="space-y-8 animate-fade-in">
              {/* Hero Header */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide border border-blue-600/20">
                  <Scale className="w-3.5 h-3.5" />
                  Official Regulatory Classification Engine
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Instant EU AI Act <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Risk Tier & Obligations
                  </span>{' '}
                  Audit
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Classify your AI model, prompt pipeline, or software system against Regulation (EU) 2024/1689. Receive your free official risk tier badge and preview critical obligations.
                </p>
              </div>

              {/* Mandatory Legal Disclaimer */}
              <div className="max-w-3xl mx-auto">
                <Disclaimer />
              </div>

              {/* Interactive Compliance Form */}
              <ComplianceForm onReportGenerated={(rep) => setReport(rep)} />

              {/* Trust Indicators & Badges */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-3xl mx-auto">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>In-Memory Only</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your raw system prompts are processed strictly in RAM and never saved to a database.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Strict Schema Output</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Structured classification based on Articles 5, 50, and Annex III criteria.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Audit-Ready PDF</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Detailed statutory citations and prioritized 30/60/90-day remediation action plan.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ResultView report={report} onReset={() => setReport(null)} />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-slate-500 text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              EU AI Act Compliance Checker
            </span>
            <span>• Regulation (EU) 2024/1689</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Last verified against the Act: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
