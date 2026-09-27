'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error monitoring service here if you add one (e.g. Sentry)
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            An unexpected error occurred. Your data has not been affected. Please try again or
            return to the home page.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-600">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Return to home
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          If this keeps happening, contact{' '}
          <a
            href="mailto:support@euaipass.com"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            support@euaipass.com
          </a>
        </p>
      </div>
    </div>
  );
}
