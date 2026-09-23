'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export type StepNumber = 1 | 2 | 3 | 4;

export interface ProgressStepperProps {
  currentStep: StepNumber;
  isAnalyzing?: boolean;
  statusMessage?: string;
  hasInput?: boolean;
}

const STEPS = [
  {
    step: 1 as StepNumber,
    title: 'System Definition',
    shortTitle: 'Definition',
    description: 'Specs & intended purpose',
  },
  {
    step: 2 as StepNumber,
    title: 'Statutory Audit',
    shortTitle: 'Audit',
    description: 'Arts. 5, 50 & Annex III',
  },
  {
    step: 3 as StepNumber,
    title: 'Risk Findings',
    shortTitle: 'Findings',
    description: 'Tier & obligations preview',
  },
  {
    step: 4 as StepNumber,
    title: 'Audit Deliverable',
    shortTitle: 'Deliverable',
    description: 'Signed PDF & action plan',
  },
];

export function ProgressStepper({
  currentStep,
  isAnalyzing = false,
  statusMessage,
  hasInput = false,
}: ProgressStepperProps) {
  return (
    <div
      aria-label="Regulatory classification progress"
      className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm transition-all"
    >
      {/* Header with Step Context & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span>Audit Workflow Progression</span>
        </div>

        <div className="flex items-center gap-1.5 font-semibold text-xs">
          <span className="text-slate-400">Phase</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[11px] border border-blue-200/50 dark:border-blue-900/50">
            {currentStep} / 4
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-medium ml-1">
            {STEPS[currentStep - 1].title}
          </span>
        </div>
      </div>

      {/* Responsive Stepper Container */}
      <ol className="grid grid-cols-4 gap-2 sm:gap-3 relative">
        {STEPS.map((s, idx) => {
          const isCompleted = s.step < currentStep || (s.step === 1 && currentStep === 1 && hasInput);
          const isCurrent = s.step === currentStep;

          return (
            <li key={s.step} className="relative flex flex-col items-center text-center group">
              {/* Connector line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors duration-300 ${
                    s.step < currentStep
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}

              {/* Step Circle Indicator */}
              <div
                className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCompleted && !isCurrent
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30 ring-2 ring-white dark:ring-slate-900'
                    : isCurrent
                    ? isAnalyzing
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-sm animate-pulse'
                      : 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-sm shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent && isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="font-mono text-xs">{s.step}</span>
                )}
              </div>

              {/* Text Labels */}
              <div className="mt-2.5 space-y-0.5 w-full px-1">
                <p
                  className={`text-xs font-bold tracking-tight truncate ${
                    isCurrent
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200 font-semibold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span className="hidden sm:inline">{s.title}</span>
                  <span className="sm:hidden">{s.shortTitle}</span>
                </p>
                <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                  {s.description}
                </p>
              </div>

              {/* Status pill under active step */}
              {isCurrent && (
                <div className="mt-1.5 hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  {isAnalyzing ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                      <span>Analyzing</span>
                    </>
                  ) : isCompleted ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Input Ready</span>
                    </>
                  ) : (
                    <span>In Progress</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Live active step banner during background analysis */}
      {isAnalyzing && statusMessage && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30 py-2 px-3 rounded-xl">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="font-medium truncate">{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
