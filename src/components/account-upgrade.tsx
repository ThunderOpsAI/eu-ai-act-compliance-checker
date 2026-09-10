'use client';

import React, { useState } from 'react';
import { upgradeAnonymousAccount } from '@/lib/auth/auth-service';
import { ShieldCheck, Lock, Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface AccountUpgradeProps {
  initialEmail?: string | null;
  onUpgradeSuccess?: () => void;
}

export function AccountUpgrade({ initialEmail, onUpgradeSuccess }: AccountUpgradeProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await upgradeAnonymousAccount(cleanEmail, cleanPassword);
      setSuccess(true);
      if (onUpgradeSuccess) onUpgradeSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Account upgrade failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-6 text-center space-y-2 animate-fade-in">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white text-base">
          Account Successfully Upgraded!
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Your anonymous session has been converted to a permanent account. All your past reports and audit records remain securely linked to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
            Save This Report to Your Permanent Account
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Upgrade your current anonymous session to a permanent account for free. Keep your full EU AI Act audit history permanently accessible and unlock unlimited recurring checks.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpgrade} className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="upgrade-email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Account Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                id="upgrade-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@company.eu"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="upgrade-password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Create Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                id="upgrade-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Upgrading Account...</span>
            </>
          ) : (
            <>
              <span>Save & Upgrade to Permanent Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
