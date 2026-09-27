import Link from 'next/link';
import type { Metadata } from 'next';
import { Scale, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 — Page Not Found | EU AI Pass',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <Search className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
            404
          </p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back to the
            compliance checker to continue.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          <Scale className="w-4 h-4" />
          Go to EU AI Act Compliance Checker
        </Link>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
