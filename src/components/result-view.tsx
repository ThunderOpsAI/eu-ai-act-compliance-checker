'use client';

import React, { useState, useEffect } from 'react';
import type { ComplianceReport } from '@/types/database';
import { RiskBadge } from './risk-badge';
import { CheckoutElement } from './checkout-element';
import { AccountUpgrade } from './account-upgrade';
import {
  FileText,
  Lock,
  CheckCircle2,
  RefreshCw,
  Download,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getReportStatusAction } from '@/actions/get-report';

interface ResultViewProps {
  report: ComplianceReport;
  onReset: () => void;
  onInitiateCheckout?: () => void;
  children?: React.ReactNode;
}

export function ResultView({
  report: initialReport,
  onReset,
  children,
}: ResultViewProps) {
  const [report, setReport] = useState<ComplianceReport>(initialReport);
  const [showCheckout, setShowCheckout] = useState(false);

  // Poll for pdf_ready if a payment has been made but PDF is not ready yet
  useEffect(() => {
    if (report.pdf_ready) return;

    // Only actively poll if report has a stripe_payment_intent_id or paid_at
    const shouldPoll = Boolean(report.stripe_payment_intent_id || report.paid_at);
    if (!shouldPoll) return;

    const interval = setInterval(async () => {
      try {
        const updated = await getReportStatusAction(report.id);
        if (updated) {
          setReport(updated);
          if (updated.pdf_ready) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [report.id, report.pdf_ready, report.stripe_payment_intent_id, report.paid_at]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">
            Automated Audit Result
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            EU AI Act Classification Summary
          </h2>
        </div>
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Analyze Another System</span>
        </button>
      </div>

      {/* Primary Classification Banner */}
      <RiskBadge tier={report.risk_tier} size="lg" showDescription={true} />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Matched Category
          </span>
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">
            {report.matched_category}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Primary Article Citation
          </span>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400">
            {report.matched_article}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Confidence Rating
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                report.confidence === 'High'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : report.confidence === 'Medium'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-slate-500/10 text-slate-600'
              }`}
            >
              {report.confidence} Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Executive Rationale Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Executive Legal & Operational Rationale</span>
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {report.rationale}
        </p>
      </div>

      {/* Slot for Children (Phase 3 Stripe checkout & fulfillment) */}
      {children}

      {/* PDF Ready State & Account Upgrade Upsell */}
      {report.pdf_ready ? (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 sm:p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Your Complete Compliance Report is Ready!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Your official PDF audit report has been compiled and emailed to{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {report.receipt_email || 'your receipt email'}
                </span>
                .
              </p>
            </div>
            <a
              href={`/api/reports/${report.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Report</span>
            </a>
          </div>

          {/* Micro-SaaS Upsell: Permanent Account Conversion */}
          <AccountUpgrade initialEmail={report.receipt_email} />
        </div>
      ) : showCheckout ? (
        <CheckoutElement
          report={report}
          onPaymentSuccess={(updated) => {
            setReport(updated);
            setShowCheckout(false);
          }}
          onCancel={() => setShowCheckout(false)}
        />
      ) : (
        /* Locked Teaser Section */
        <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-8 overflow-hidden shadow-2xl">
          {/* Background decorative glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium Regulatory Deliverable
                </span>
                <h3 className="text-2xl font-black mt-2 tracking-tight">
                  Unlock Full 10-Page Audit PDF & Action Plan
                </h3>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-xs text-slate-400 block">one-time investment</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Don&apos;t navigate EU AI Act enforcement in the dark. Unlock the complete, board-ready regulatory audit report complete with article citations, statutory obligations matrix, and prioritized implementation checklist.
            </p>

            {/* Checklist items teaser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Complete Articles 9–17 Statutory Obligations Matrix</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Prioritized 30/60/90-Day Remediation Action Plan</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Executive-Ready PDF Signed with Verification Date</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Self-Assessment vs. Third-Party Conformity Guide</span>
              </div>
            </div>

            {/* Blurred Preview Teaser */}
            <div className="relative rounded-xl bg-slate-800/80 p-4 border border-slate-700 overflow-hidden">
              <div className="filter blur-[3px] select-none pointer-events-none space-y-2 opacity-50">
                <div className="h-4 bg-slate-600 rounded w-3/4" />
                <div className="h-3 bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-700 rounded w-5/6" />
                <div className="h-3 bg-slate-700 rounded w-2/3" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Statutory obligations & prioritized action items locked
                </span>
              </div>
            </div>

            {/* Checkout Trigger Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCheckout(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-xl hover:shadow-blue-600/30 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Full Audit PDF Report ($29)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
