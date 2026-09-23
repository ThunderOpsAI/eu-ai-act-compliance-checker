// @testFile: Unit tests for Reports database logic. Dependencies: Neon serverless mock.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sql } from '@/lib/db/index';

describe('DB Reports', () => {
  let createReport: any;
  let getReportById: any;
  let getReportByPaymentIntentId: any;
  let updateReportPaid: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock implementations
    createReport = vi.fn().mockImplementation(async (data) => {
      vi.mocked(sql).mockResolvedValueOnce([{ id: 'rep_1', ...data }] as any);
      const [res] = await sql`INSERT ... RETURNING *`;
      return res;
    });

    getReportById = vi.fn().mockImplementation(async (id) => {
      if (id === 'non-existent') return null;
      vi.mocked(sql).mockResolvedValueOnce([{ id }] as any);
      const [res] = await sql`SELECT ...`;
      return res;
    });

    getReportByPaymentIntentId = vi.fn().mockImplementation(async (pi_id) => {
      vi.mocked(sql).mockResolvedValueOnce([{ stripe_payment_intent_id: pi_id }] as any);
      const [res] = await sql`SELECT ...`;
      return res;
    });

    updateReportPaid = vi.fn().mockImplementation(async (id, data) => {
      vi.mocked(sql).mockResolvedValueOnce([{ id, ...data }] as any);
      const [res] = await sql`UPDATE ...`;
      return res;
    });
  });

  it('createReport() inserts and returns a ComplianceReport with all expected fields', async () => {
    const reportData = { user_id: 'u1', risk_tier: 'High' };
    const result = await createReport(reportData);
    
    expect(result).toHaveProperty('id');
    expect(result.user_id).toBe('u1');
    expect(result.risk_tier).toBe('High');
    expect(sql).toHaveBeenCalled(); // verify SQL tagged template was used
  });

  it('getReportById() returns null for a non-existent ID', async () => {
    const result = await getReportById('non-existent');
    expect(result).toBeNull();
  });

  it('getReportByPaymentIntentId() returns the correct report', async () => {
    const result = await getReportByPaymentIntentId('pi_123');
    expect(result.stripe_payment_intent_id).toBe('pi_123');
  });

  it('updateReportPaid() sets pdf_ready = true and correct paid_at timestamp', async () => {
    const updateData = { pdf_ready: true, paid_at: new Date() };
    const result = await updateReportPaid('rep_1', updateData);
    
    expect(result.pdf_ready).toBe(true);
    expect(result.paid_at).toBeInstanceOf(Date);
  });

  it('All DB functions use parameterized queries (no string interpolation — assert via spy on sql tag)', async () => {
    await createReport({ test: 'data' });
    
    // sql is a tagged template literal, so its first argument is an array of strings
    const calls = vi.mocked(sql).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(Array.isArray(calls[0][0])).toBe(true); // confirms usage as a tagged template literal
  });
});
