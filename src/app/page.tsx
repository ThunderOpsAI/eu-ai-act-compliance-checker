'use client';

import React, { useState } from 'react';
import { ShieldCheck, Scale, FileText, CheckCircle } from 'lucide-react';
import { Disclaimer } from '@/components/disclaimer';
import { ComplianceForm } from '@/components/compliance-form';
import { ResultView } from '@/components/result-view';
import { ProgressStepper } from '@/components/progress-stepper';
import { ErrorBoundary } from '@/components/error-boundary';
import { FaqSection } from '@/components/faq-section';
import type { ComplianceReport } from '@/types/database';

export default function HomePage() {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [hasInput, setHasInput] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white overflow-x-hidden print:bg-white print:text-black">
      {/* High-tech ambient background layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden print:hidden" aria-hidden="true">
        {/* Fine Technical Grid Matrix with Radial Falloff */}
        <div className="absolute inset-0 bg-compliance-grid opacity-70 dark:opacity-45 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_15%,#000_45%,transparent_90%)]" />

        {/* Central Atmospheric Deep-Blue Radial Beacon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[920px] h-[540px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/12 via-indigo-600/5 to-transparent dark:from-blue-600/22 dark:via-blue-950/15 dark:to-transparent blur-3xl" />

        {/* Secondary subtle cool cyan/slate ambient washes for depth */}
        <div className="absolute top-48 left-1/4 -translate-x-1/2 w-[520px] h-[360px] bg-cyan-500/5 dark:bg-cyan-500/8 blur-[100px]" />
        <div className="absolute top-72 right-1/4 translate-x-1/2 w-[460px] h-[320px] bg-indigo-500/5 dark:bg-indigo-500/8 blur-[95px]" />

        {/* Subtle Institutional Viewport Coordinate Badges */}
        <div className="hidden xl:flex justify-between w-full max-w-6xl mx-auto px-6 pt-20 text-[10px] font-mono text-slate-400/40 dark:text-slate-600/50 uppercase select-none tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
            <span>REG 2024/1689 // STATUTORY AUDIT ENGINE</span>
          </div>
          <div className="flex items-center gap-2">
            <span>ZERO-LOG // RAM-ONLY PROCESSING</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
          </div>
        </div>
      </div>

      {/* Top EU-Styled Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090e1a]/80 backdrop-blur-md print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  EU AI Act Compliance Checker
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Reg 2024/1689
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Automated Risk Tier & Statutory Obligations Classifier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Zero-Storage In-Memory</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 print:py-0 print:px-0 print:space-y-4 print:max-w-none">
        <ErrorBoundary>
          {!report ? (
            <div className="space-y-8 animate-fade-in print:hidden">
              {/* Hero Header */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide border border-blue-600/20 shadow-xs">
                  <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Official Regulatory Classification Engine
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                  Instant EU AI Act <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                    Risk Tier & Obligations
                  </span>{' '}
                  Audit
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                  Classify your AI model, prompt pipeline, or software system against Regulation (EU) 2024/1689. Receive your official risk tier badge and preview critical obligations.
                </p>
              </div>

              {/* Mandatory Legal Disclaimer */}
              <div className="max-w-3xl mx-auto">
                <Disclaimer />
              </div>

              {/* Visual Progress Step Indicator */}
              <ProgressStepper
                currentStep={isAnalyzing ? 2 : 1}
                isAnalyzing={isAnalyzing}
                statusMessage={statusMessage}
                hasInput={hasInput}
              />

              {/* Interactive Compliance Form */}
              <ComplianceForm
                onReportGenerated={(rep) => {
                  setIsAnalyzing(false);
                  setReport(rep);
                }}
                onAnalysisStateChange={(analyzing, msg) => {
                  setIsAnalyzing(analyzing);
                  setStatusMessage(msg);
                }}
                onInputChange={(valid) => setHasInput(valid)}
              />

              {/* Trust Indicators & Badges */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-3xl mx-auto">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>In-Memory Only</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Your raw system prompts are processed strictly in RAM and never saved to a database.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span>Strict Schema Output</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Structured classification based on Articles 5, 50, and Annex III regulatory criteria.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span>Audit-Ready PDF</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Detailed statutory citations and prioritized 30/60/90-day remediation action plan.
                  </p>
                </div>
              </div>

              {/* Regulatory FAQ Accordion */}
              <div className="max-w-3xl mx-auto pt-2">
                <FaqSection />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="max-w-4xl mx-auto print:hidden">
                <ProgressStepper
                  currentStep={report.pdf_ready ? 4 : 3}
                  hasInput={true}
                />
              </div>
              <ResultView
                report={report}
                onReset={() => {
                  setReport(null);
                  setIsAnalyzing(false);
                  setHasInput(false);
                  setStatusMessage(undefined);
                }}
                onReportUpdated={(updated) => setReport(updated)}
              />
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/70 dark:bg-[#090e1a]/70 backdrop-blur-md text-slate-500 text-xs mt-auto print:hidden">
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
