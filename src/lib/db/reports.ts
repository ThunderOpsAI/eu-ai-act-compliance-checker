import { getDbPool } from './index';
import { getMockReport, setMockReport, updateMockReport } from '@/lib/stripe/mock-store';
import type { ComplianceReport } from '@/types/database';

export async function insertReport(report: Omit<ComplianceReport, 'id' | 'created_at'>): Promise<ComplianceReport> {
  const fallbackReport: ComplianceReport = {
    id: `rep_${Math.random().toString(36).substring(2, 12)}`,
    ...report,
    created_at: new Date().toISOString(),
  };

  if (!process.env.DATABASE_URL) {
    setMockReport(fallbackReport);
    return fallbackReport;
  }

  try {
    const pool = getDbPool();
    const query = `
      INSERT INTO public.reports (
        user_id,
        risk_tier,
        matched_category,
        matched_article,
        confidence,
        rationale,
        obligations,
        action_plan,
        is_saved,
        expires_at,
        pdf_ready,
        stripe_payment_intent_id,
        receipt_email,
        pdf_storage_path,
        paid_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      report.user_id,
      report.risk_tier,
      report.matched_category,
      report.matched_article,
      report.confidence,
      report.rationale,
      JSON.stringify(report.obligations || []),
      JSON.stringify(report.action_plan || []),
      report.is_saved ?? false,
      report.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      report.pdf_ready ?? false,
      report.stripe_payment_intent_id ?? null,
      report.receipt_email ?? null,
      report.pdf_storage_path ?? null,
      report.paid_at ?? null,
    ];

    const result = await pool.query(query, values);
    const saved = formatReport(result.rows[0]);
    setMockReport(saved);
    return saved;
  } catch (err) {
    console.warn('[DB] insertReport error, using mock store:', err);
    setMockReport(fallbackReport);
    return fallbackReport;
  }
}

export async function getReportById(id: string): Promise<ComplianceReport | null> {
  if (!id) return null;
  if (!process.env.DATABASE_URL) {
    return getMockReport(id) || null;
  }
  try {
    const pool = getDbPool();
    const result = await pool.query('SELECT * FROM public.reports WHERE id = $1 LIMIT 1;', [id]);
    if (!result.rows.length) return getMockReport(id) || null;
    return formatReport(result.rows[0]);
  } catch (err) {
    console.warn('[DB] getReportById error, fallback to mock store:', err);
    return getMockReport(id) || null;
  }
}

export async function getReportByPaymentIntentId(paymentIntentId: string): Promise<ComplianceReport | null> {
  if (!paymentIntentId) return null;
  if (!process.env.DATABASE_URL) {
    return getMockReport(paymentIntentId) || null;
  }
  try {
    const pool = getDbPool();
    const result = await pool.query(
      'SELECT * FROM public.reports WHERE stripe_payment_intent_id = $1 LIMIT 1;',
      [paymentIntentId]
    );
    if (!result.rows.length) return getMockReport(paymentIntentId) || null;
    return formatReport(result.rows[0]);
  } catch (err) {
    console.warn('[DB] getReportByPaymentIntentId error, fallback to mock store:', err);
    return getMockReport(paymentIntentId) || null;
  }
}

export async function updateReportPaymentIntent(id: string, paymentIntentId: string): Promise<void> {
  updateMockReport(id, { stripe_payment_intent_id: paymentIntentId });
  if (!process.env.DATABASE_URL) return;
  try {
    const pool = getDbPool();
    await pool.query(
      'UPDATE public.reports SET stripe_payment_intent_id = $1 WHERE id = $2;',
      [paymentIntentId, id]
    );
  } catch (err) {
    console.warn('[DB] updateReportPaymentIntent warning:', err);
  }
}

export async function updateReportPaid(
  id: string,
  updates: {
    paid_at: string;
    receipt_email: string | null;
    pdf_storage_path: string | null;
    stripe_payment_intent_id?: string | null;
  }
): Promise<void> {
  updateMockReport(id, {
    pdf_ready: true,
    paid_at: updates.paid_at,
    receipt_email: updates.receipt_email,
    pdf_storage_path: updates.pdf_storage_path,
    stripe_payment_intent_id: updates.stripe_payment_intent_id,
  });
  if (!process.env.DATABASE_URL) return;
  try {
    const pool = getDbPool();
    await pool.query(
      `UPDATE public.reports 
       SET pdf_ready = true, 
           paid_at = $1, 
           receipt_email = COALESCE($2, receipt_email), 
           pdf_storage_path = $3,
           stripe_payment_intent_id = COALESCE($4, stripe_payment_intent_id)
       WHERE id = $5;`,
      [
        updates.paid_at,
        updates.receipt_email,
        updates.pdf_storage_path,
        updates.stripe_payment_intent_id ?? null,
        id,
      ]
    );
  } catch (err) {
    console.warn('[DB] updateReportPaid warning:', err);
  }
}

export async function linkReportToUser(reportId: string, newUserId: string): Promise<void> {
  updateMockReport(reportId, { user_id: newUserId, is_saved: true });
  if (!process.env.DATABASE_URL) return;
  try {
    const pool = getDbPool();
    await pool.query(
      'UPDATE public.reports SET user_id = $1, is_saved = true WHERE id = $2;',
      [newUserId, reportId]
    );
  } catch (err) {
    console.warn('[DB] linkReportToUser warning:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatReport(row: any): ComplianceReport {
  return {
    ...row,
    id: String(row.id),
    user_id: String(row.user_id),
    obligations: typeof row.obligations === 'string' ? JSON.parse(row.obligations) : row.obligations,
    action_plan: typeof row.action_plan === 'string' ? JSON.parse(row.action_plan) : row.action_plan,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    expires_at: row.expires_at ? new Date(row.expires_at).toISOString() : '',
    paid_at: row.paid_at ? new Date(row.paid_at).toISOString() : null,
  };
}
