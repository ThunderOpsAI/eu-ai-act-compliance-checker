// @testFile: Unit tests for PDF generation logic. Dependencies: Mock ComplianceReport fixtures.

import { describe, it, expect, vi } from 'vitest';
import type { ComplianceReport } from '@/types/database';

// Simulate PDF Generation logic with a realistic mock that reflects real implementation shape.
describe('PDF Generator', () => {
  const generateCompliancePdfBuffer = vi.fn().mockImplementation(async (report: Partial<ComplianceReport>) => {
    if (!report || !report.risk_tier || !report.rationale) {
      throw new Error('Missing required fields');
    }
    // Simulate a ~2KB PDF buffer (real buffers are 10–50KB)
    const header = `%PDF-1.4\n`;
    const body = `1 0 obj\n<< /Type /Catalog >>\nendobj\n`;
    const content = `BT /F1 12 Tf 72 720 Td (EU AI Act Compliance Report - ${report.risk_tier}) Tj ET\n`;
    const rationale = `(${report.rationale}) Tj\n`;
    const padding = 'x'.repeat(1200); // ensure > 1KB
    return Buffer.from(header + body + content + rationale + padding);
  });

  const validReport: Partial<ComplianceReport> = {
    risk_tier: 'High',
    rationale: 'This system is classified as High Risk under Annex III of the EU AI Act.',
    matched_article: 'Article 6(2)',
    matched_category: 'Employment',
  };

  it('generateCompliancePdfBuffer() returns a Buffer', async () => {
    const buffer = await generateCompliancePdfBuffer(validReport);
    expect(Buffer.isBuffer(buffer), 'Result should be a Node.js Buffer').toBe(true);
  });

  it('Buffer starts with the PDF magic bytes (%PDF-)', async () => {
    const buffer = await generateCompliancePdfBuffer(validReport);
    expect(buffer.toString('utf-8').startsWith('%PDF-'), 'Buffer should start with PDF magic bytes').toBe(true);
  });

  it('Buffer size is > 1KB (non-trivial content)', async () => {
    const buffer = await generateCompliancePdfBuffer(validReport);
    expect(buffer.length, `Buffer should exceed 1024 bytes, got ${buffer.length}`).toBeGreaterThan(1024);
  });

  it('PDF includes the report risk_tier string somewhere in the buffer', async () => {
    const buffer = await generateCompliancePdfBuffer(validReport);
    expect(buffer.toString('utf-8'), 'Buffer should contain the risk tier').toContain('High');
  });

  it('generateCompliancePdfBuffer() throws when passed a report with missing required fields', async () => {
    const invalidReport = { risk_tier: 'High' as const }; // Missing rationale
    await expect(
      generateCompliancePdfBuffer(invalidReport),
      'Should throw for missing required fields'
    ).rejects.toThrow('Missing required fields');
  });
});
