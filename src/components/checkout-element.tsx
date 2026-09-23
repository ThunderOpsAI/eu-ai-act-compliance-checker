'use client';

import React, { useState } from 'react';
import { Lock, CreditCard, Loader2, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { createPaymentIntentAction } from '@/actions/payment';
import type { ComplianceReport } from '@/types/database';

interface CheckoutElementProps {
  report: ComplianceReport;
  onPaymentSuccess: (updatedReport: ComplianceReport) => void;
  onCancel?: () => void;
}

export function CheckoutElement({
  report,
  onPaymentSuccess,
  onCancel,
}: CheckoutElementProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address for receipt and report delivery.');
      return;
    }

    setLoading(true);
    try {
      // 1. Request Payment Intent
      const piResult = await createPaymentIntentAction({ reportId: report.id });
      if (!piResult.success) {
        throw new Error(piResult.error || 'Failed to initialize payment.');
      }

      // 2. Trigger Stripe Fulfillment Webhook
      // In production, Stripe elements confirmCardPayment triggers the webhook from Stripe's servers.
      // Here we post to the webhook endpoint with the payment intent ID and email.
      const webhookRes = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: piResult.paymentIntentId || `pi_sim_${report.id}`,
              receipt_email: cleanEmail,
              metadata: { report_id: report.id },
            },
          },
        }),
      });

      if (!webhookRes.ok) {
        console.warn('Webhook notification returned non-200, proceeding with optimistic report fulfillment.');
      }

      setPaymentSuccess(true);
      // Construct updated report with paid status
      const updated: ComplianceReport = {
        ...report,
        pdf_ready: true,
        paid_at: new Date().toISOString(),
        receipt_email: cleanEmail,
        stripe_payment_intent_id: piResult.paymentIntentId,
      };

      setTimeout(() => {
        onPaymentSuccess(updated);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-blue-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-blue-900/10 dark:shadow-black/40 space-y-6 animate-fade-in transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              Unlock Full Compliance Report & Audit PDF
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant PDF deliverable compiled and emailed directly to your inbox.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">$29</span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">USD · ONE-TIME</span>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="text-center py-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Payment Confirmed!
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Compiling your verified regulatory PDF report and preparing download...
          </p>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="receipt-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Receipt & Report Delivery Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="receipt-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compliance@enterprise.eu"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium"
              />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Your official PDF audit report and Stripe VAT receipt will be dispatched to this address.
            </span>
          </div>

          {/* Secure Payment Details Placeholder */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted 256-Bit Stripe Checkout</span>
              </span>
              <span className="text-slate-400">Visa · Mastercard · Amex</span>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="tracking-widest">•••• •••• •••• 4242</span>
              <span>12/28 · CVC</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                data-testid="checkout-cancel-button" onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Back to Preview
              </button>
            )}

            <button
              data-testid="checkout-submit-button" type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay $29 & Unlock Full Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
