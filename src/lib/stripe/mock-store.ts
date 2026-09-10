import type { ComplianceReport } from '@/types/database';

// In-memory store used during testing and placeholder mock development
const mockReports = new Map<string, ComplianceReport>();

export function setMockReport(report: ComplianceReport): void {
  mockReports.set(report.id, { ...report });
}

export function getMockReport(idOrPaymentIntentId: string): ComplianceReport | undefined {
  if (mockReports.has(idOrPaymentIntentId)) {
    return mockReports.get(idOrPaymentIntentId);
  }
  for (const report of mockReports.values()) {
    if (report.stripe_payment_intent_id === idOrPaymentIntentId) {
      return report;
    }
  }
  return undefined;
}

export function updateMockReport(
  id: string,
  updates: Partial<ComplianceReport>
): ComplianceReport | undefined {
  const existing = mockReports.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates };
  mockReports.set(id, updated);
  return updated;
}

export function clearMockReports(): void {
  mockReports.clear();
}
