"use server";

import { linkReportToUser } from '@/lib/db/reports';

export async function linkReportAction(reportId: string, userId: string): Promise<boolean> {
  if (!reportId || !userId) return false;
  if (process.env.DATABASE_URL) {
    try {
      await linkReportToUser(reportId, userId);
      return true;
    } catch (err) {
      console.warn('Error linking report to user:', err);
    }
  }
  return true;
}
