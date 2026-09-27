import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | EU AI Act Compliance Checker',
  description:
    'How EU AI Act Compliance Checker collects, uses, and protects your personal data under GDPR and Regulation (EU) 2024/1689.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '26 September 2026';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090e1a]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Compliance Checker
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">EU AI Pass</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last updated: {lastUpdated} · Effective immediately
            </p>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              This Privacy Policy explains how EU AI Pass (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;) collects, uses, and protects information when you use our EU AI Act
              Compliance Checker at{' '}
              <a
                href="https://euaipass.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                euaipass.com
              </a>
              .
            </p>
          </div>

          <Divider />

          {/* Section 1 */}
          <Section title="1. Data Controller">
            <p>
              The data controller responsible for your personal data is the operator of{' '}
              <strong>EU AI Pass</strong> (euaipass.com). For privacy inquiries, please contact us
              at:{' '}
              <a
                href="mailto:privacy@euaipass.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                privacy@euaipass.com
              </a>
            </p>
          </Section>

          {/* Section 2 — Zero Retention */}
          <Section title="2. What We Do NOT Collect (Zero-Retention Architecture)">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                ✓ Zero-Retention Guarantee
              </p>
              <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                The AI system descriptions, prompts, and architecture details you submit for
                compliance analysis are processed <strong>exclusively in volatile server memory
                (RAM)</strong> and are <strong>never written to any database, log file, or
                persistent storage</strong>. We retain no copy of your raw input. This is a
                structural guarantee, not a policy choice — the system is architecturally incapable
                of persisting your AI system descriptions.
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              We do not collect: your AI model weights, training datasets, source code, proprietary
              architecture details, customer data, or any sensitive business information you include
              in your system description.
            </p>
          </Section>

          {/* Section 3 — What We DO Collect */}
          <Section title="3. Information We Do Collect">
            <div className="space-y-4">
              <SubSection title="3a. Payment & Receipt Information">
                <p>
                  When you purchase a full compliance report ($29 USD), we collect your{' '}
                  <strong>email address</strong> for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <li>Delivery of your PDF compliance report as an email attachment</li>
                  <li>Sending your Stripe payment receipt</li>
                  <li>Account creation (if you choose to upgrade to a permanent account)</li>
                </ul>
                <p className="mt-2 text-sm">
                  Credit card and payment details are collected and processed exclusively by{' '}
                  <strong>Stripe, Inc.</strong> We never see or store your full card number. See{' '}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Stripe&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </SubSection>

              <SubSection title="3b. Compliance Report Metadata">
                <p>
                  When a paid report is generated, we store the following structured{' '}
                  <strong>output metadata</strong> in our database (not your raw input):
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <li>Risk tier classification result (e.g., High Risk, Limited Risk)</li>
                  <li>Matched EU AI Act article or Annex reference</li>
                  <li>A brief AI-generated description summary (functional behaviour, not your input)</li>
                  <li>Your receipt email address</li>
                  <li>Payment confirmation timestamp and Stripe payment intent ID</li>
                  <li>PDF storage path (stored in Supabase Storage, access-controlled)</li>
                </ul>
              </SubSection>

              <SubSection title="3c. Account Information (Optional)">
                <p>
                  If you choose to upgrade to a permanent account, we store your email address and a
                  hashed password via <strong>Supabase Auth</strong>. We do not store plaintext
                  passwords.
                </p>
              </SubSection>

              <SubSection title="3d. Technical & Usage Data">
                <p>
                  We may collect standard web server logs including IP addresses, browser type, and
                  referring URLs for security and fraud prevention purposes. This data is retained
                  for a maximum of 30 days. We use{' '}
                  <strong>Vercel Web Analytics</strong> (privacy-preserving, no cookies) to
                  understand aggregate usage patterns.
                </p>
              </SubSection>
            </div>
          </Section>

          {/* Section 4 — Third Party Processors */}
          <Section title="4. Third-Party Data Processors">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              We use the following sub-processors to operate the service. Each is GDPR-compliant and
              bound by a Data Processing Agreement (DPA):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">Processor</th>
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">Purpose</th>
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-300">Data Shared</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-400">
                  <TableRow
                    processor="Stripe, Inc."
                    purpose="Payment processing"
                    data="Email, payment card data"
                  />
                  <TableRow
                    processor="Supabase, Inc."
                    purpose="Database, Auth, File Storage"
                    data="Email, hashed password, report metadata, PDF files"
                  />
                  <TableRow
                    processor="Resend, Inc."
                    purpose="Transactional email delivery"
                    data="Email address, PDF report attachment"
                  />
                  <TableRow
                    processor="Google LLC (Gemini API)"
                    purpose="AI compliance classification"
                    data="Your AI system description (in-memory only, zero-retention)"
                  />
                  <TableRow
                    processor="Vercel, Inc."
                    purpose="Web hosting & edge delivery"
                    data="IP address, request logs (30-day retention)"
                  />
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section 5 — Legal Basis */}
          <Section title="5. Legal Basis for Processing (GDPR)">
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Contract performance (Art. 6(1)(b) GDPR):</strong>{' '}
                Processing your email address to deliver your purchased PDF report and receipt.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Legitimate interests (Art. 6(1)(f) GDPR):</strong>{' '}
                Security logging, fraud prevention, and aggregate analytics.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Consent (Art. 6(1)(a) GDPR):</strong>{' '}
                Account creation, where explicitly agreed to at the point of sign-up.
              </li>
            </ul>
          </Section>

          {/* Section 6 — Retention */}
          <Section title="6. Data Retention">
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">AI system descriptions:</strong>{' '}
                Zero retention — never stored.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Compliance report metadata:</strong>{' '}
                Retained for 2 years from the date of purchase, or until you request deletion.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">PDF reports:</strong>{' '}
                Stored in Supabase secure storage for 2 years, accessible only to you.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Account data:</strong>{' '}
                Retained until you delete your account.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Server logs:</strong>{' '}
                Maximum 30 days, then automatically purged.
              </li>
            </ul>
          </Section>

          {/* Section 7 — Your Rights */}
          <Section title="7. Your Rights Under GDPR">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              If you are located in the European Economic Area (EEA), United Kingdom, or Australia,
              you have the following rights:
            </p>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li><strong className="text-slate-800 dark:text-slate-200">Right of access:</strong> Request a copy of your personal data.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to rectification:</strong> Correct inaccurate data.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to erasure:</strong> Request deletion of your data.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to restriction:</strong> Restrict processing of your data.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to data portability:</strong> Receive your data in a machine-readable format.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Right to object:</strong> Object to processing based on legitimate interests.</li>
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              To exercise any of these rights, email{' '}
              <a
                href="mailto:privacy@euaipass.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                privacy@euaipass.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          {/* Section 8 — Cookies */}
          <Section title="8. Cookies & Tracking">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This site uses <strong>no advertising or tracking cookies</strong>. We use:
            </p>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 mt-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Session cookies:</strong> Strictly necessary for authentication (Supabase Auth). These expire when your browser session ends.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Vercel Analytics:</strong> Cookie-free, privacy-preserving aggregate analytics. No personal identifiers are collected.
              </li>
            </ul>
          </Section>

          {/* Section 9 — International Transfers */}
          <Section title="9. International Data Transfers">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Our sub-processors (Stripe, Supabase, Resend, Vercel) may process data in the United
              States. All transfers are governed by Standard Contractual Clauses (SCCs) approved by
              the European Commission, ensuring your data receives equivalent protection to the GDPR.
            </p>
          </Section>

          {/* Section 10 — Changes */}
          <Section title="10. Changes to This Policy">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo;
              date at the top of this page reflects the date of the most recent revision. Continued
              use of the service after changes are posted constitutes acceptance of the updated
              policy.
            </p>
          </Section>

          {/* Contact */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5">
            <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-1">Contact Us</p>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              For any privacy-related questions or to exercise your data rights, contact us at{' '}
              <a
                href="mailto:privacy@euaipass.com"
                className="font-medium hover:underline"
              >
                privacy@euaipass.com
              </a>
              .
            </p>
          </div>

          {/* Back link */}
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to EU AI Act Compliance Checker
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-16 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 space-x-4">
          <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Terms of Service</Link>
          <span>© {new Date().getFullYear()} EU AI Pass</span>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</h3>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}

function TableRow({
  processor,
  purpose,
  data,
}: {
  processor: string;
  purpose: string;
  data: string;
}) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-300">{processor}</td>
      <td className="py-2 pr-4">{purpose}</td>
      <td className="py-2">{data}</td>
    </tr>
  );
}

function Divider() {
  return <hr className="border-slate-200 dark:border-slate-800" />;
}
