import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ComplianceReport } from '@/types/database';
import { ComplianceReportDocument } from './report-document';

/**
 * Generates a Node.js Buffer containing the compiled PDF compliance report.
 * Can be called server-side by Stripe Webhooks, API routes, or test runners.
 *
 * @param report The ComplianceReport object containing classification, obligations, and action items.
 * @param verifiedDate Optional string indicating the date of the EU AI Act verification.
 * @returns Promise<Buffer> of the binary PDF data.
 */
export async function generateCompliancePdfBuffer(
  report: ComplianceReport,
  verifiedDate?: string
): Promise<Buffer> {
  const document = React.createElement(ComplianceReportDocument, {
    report,
    verifiedDate,
  });

  // Cast to the parameter type expected by renderToBuffer without using explicit any
  const buffer = await renderToBuffer(
    document as unknown as Parameters<typeof renderToBuffer>[0]
  );
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}
