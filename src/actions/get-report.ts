"use server";

import { getReportById } from '@/lib/db/reports';
import { getMockReport } from '@/lib/stripe/mock-store';
import type { ComplianceReport } from '@/types/database';

export async function getReportStatusAction(reportId: string): Promise<ComplianceReport | null> {
  if (!reportId) return null;
  if (process.env.DATABASE_URL) {
    try {
      const report = await getReportById(reportId);
      if (report) return report;
    } catch {
      // Fallback below
    }
  }
  return getMockReport(reportId) || null;
}
