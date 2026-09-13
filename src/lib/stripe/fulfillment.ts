import { generateCompliancePdfBuffer } from '@/lib/pdf/generator';
import { resend, isResendMock } from '@/lib/resend/client';
import { getReportById, getReportByPaymentIntentId, updateReportPaid } from '@/lib/db/reports';
import { uploadReportPdf } from '@/lib/storage';
import { getMockReport, updateMockReport } from './mock-store';
import type { ComplianceReport } from '@/types/database';

export interface FulfillPaymentOptions {
  paymentIntentId: string;
  reportId?: string | null;
  receiptEmail?: string | null;
}

export interface FulfillmentResult {
  success: boolean;
  alreadyFulfilled?: boolean;
  reportId?: string;
  storagePath?: string;
  emailSent?: boolean;
  error?: string;
}

/**
 * Background fulfillment task executed asynchronously when Stripe confirms payment.
 *
 * Steps:
 * 1. Look up report by reportId or stripe_payment_intent_id in Neon DB.
 * 2. Webhook Idempotency Check: if report.pdf_ready is already true, return immediately.
 * 3. Generate PDF Buffer via generateCompliancePdfBuffer(report).
 * 4. Upload PDF to Vercel Blob (or virtual path if token not set).
 * 5. Update Neon DB 'reports' row: pdf_ready = true, paid_at = now, receipt_email, pdf_storage_path.
 * 6. Send transactional fulfillment email via Resend attaching the PDF buffer.
 */
export async function fulfillComplianceReportPayment({
  paymentIntentId,
  reportId,
  receiptEmail,
}: FulfillPaymentOptions): Promise<FulfillmentResult> {
  try {
    let report: ComplianceReport | null = null;

    // 1. Look up the report in Neon DB
    if (process.env.DATABASE_URL) {
      try {
        if (reportId) {
          report = await getReportById(reportId);
        } else {
          report = await getReportByPaymentIntentId(paymentIntentId);
        }
      } catch (dbErr) {
        console.warn('[Webhook Fulfillment] DB query error, trying fallback:', dbErr);
      }
    }

    // Check mock store fallback
    if (!report) {
      if (reportId) {
        report = getMockReport(reportId) || null;
      }
      if (!report && paymentIntentId) {
        report = getMockReport(paymentIntentId) || null;
      }
    }

    if (!report) {
      const errMsg = `[Webhook Fulfillment] Report not found for PaymentIntent: ${paymentIntentId}, ReportId: ${reportId}`;
      console.error(errMsg);
      return { success: false, error: errMsg };
    }

    // 2. Webhook Idempotency Check
    if (report.pdf_ready) {
      console.log(
        `[Webhook Fulfillment] Idempotency: Report ${report.id} is already fulfilled (pdf_ready=true). Skipping generation.`
      );
      return {
        success: true,
        alreadyFulfilled: true,
        reportId: report.id,
        storagePath: report.pdf_storage_path || undefined,
      };
    }

    console.log(
      `[Webhook Fulfillment] Starting PDF generation for Report ${report.id} (Tier: ${report.risk_tier})...`
    );

    // 3. Generate PDF Buffer
    const pdfBuffer = await generateCompliancePdfBuffer(report);
    console.log(
      `[Webhook Fulfillment] Generated PDF buffer (${pdfBuffer.length} bytes) for Report ${report.id}`
    );

    // 4. Upload PDF to Vercel Blob (or fallback)
    const storagePath = `compliance-reports/${report.user_id}/${report.id}.pdf`;
    const uploadedUrlOrPath = await uploadReportPdf(storagePath, pdfBuffer);

    // 5. Update Neon 'reports' row
    const paidAt = new Date().toISOString();
    const finalReceiptEmail = receiptEmail || report.receipt_email || null;

    if (process.env.DATABASE_URL) {
      try {
        await updateReportPaid(report.id, {
          paid_at: paidAt,
          receipt_email: finalReceiptEmail,
          pdf_storage_path: uploadedUrlOrPath,
          stripe_payment_intent_id: paymentIntentId,
        });
        console.log(`[Webhook Fulfillment] Successfully marked report ${report.id} as pdf_ready in Neon.`);
      } catch (updateError) {
        console.error('[Webhook Fulfillment] Failed to update report status in Neon:', updateError);
      }
    }

    // Always keep mock store in sync
    updateMockReport(report.id, {
      pdf_ready: true,
      paid_at: paidAt,
      receipt_email: finalReceiptEmail,
      pdf_storage_path: uploadedUrlOrPath,
      stripe_payment_intent_id: paymentIntentId,
    });

    // 6. Send transactional fulfillment email via Resend
    let emailSent = false;
    if (finalReceiptEmail) {
      if (isResendMock) {
        console.log(
          `[Webhook Fulfillment] (Mock Resend) Simulated delivery of PDF report to ${finalReceiptEmail}`
        );
        emailSent = true;
      } else {
        try {
          const fromEmail =
            process.env.RESEND_FROM_EMAIL || 'EU AI Act Compliance <onboarding@resend.dev>';
          const emailResponse = await resend.emails.send({
            from: fromEmail,
            to: finalReceiptEmail,
            subject: `Your EU AI Act Compliance Audit Report [${report.risk_tier} Risk]`,
            text: `Thank you for your purchase. Attached is your complete EU AI Act Compliance Audit Report (ID: ${report.id}).\n\nClassification: ${report.risk_tier} Risk\nPrimary Citation: ${report.matched_article}\n\nYou can also download it anytime from your dashboard.`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                <h2 style="color: #2563eb; margin-bottom: 8px;">EU AI Act Compliance Audit Report</h2>
                <p>Thank you for purchasing your official regulatory compliance audit report under Regulation (EU) 2024/1689.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 4px 0;"><strong>System ID:</strong> ${report.id}</p>
                  <p style="margin: 4px 0;"><strong>Risk Classification:</strong> ${report.risk_tier} Risk</p>
                  <p style="margin: 4px 0;"><strong>Category:</strong> ${report.matched_category}</p>
                  <p style="margin: 4px 0;"><strong>Primary Citation:</strong> ${report.matched_article}</p>
                </div>
                <p>Your complete PDF report containing the Articles 9–17 statutory obligations matrix and prioritized remediation action plan is attached to this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 11px; color: #64748b;">This automated report is for informational purposes and does not constitute formal legal counsel.</p>
              </div>
            `,
            attachments: [
              {
                filename: `EU-AI-Act-Compliance-Report-${report.id}.pdf`,
                content: pdfBuffer,
              },
            ],
          });

          if (emailResponse.error) {
            console.warn(
              `[Webhook Fulfillment] Resend email delivery failed: ${emailResponse.error.message}`
            );
          } else {
            console.log(
              `[Webhook Fulfillment] Resend email dispatched successfully (ID: ${emailResponse.data?.id})`
            );
            emailSent = true;
          }
        } catch (emailErr) {
          console.warn('[Webhook Fulfillment] Caught error during Resend email dispatch:', emailErr);
        }
      }
    } else {
      console.log('[Webhook Fulfillment] No receipt_email available on PaymentIntent. Skipped email dispatch.');
    }

    return {
      success: true,
      reportId: report.id,
      storagePath: uploadedUrlOrPath,
      emailSent,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Unexpected error occurred during webhook report fulfillment.';
    console.error('[Webhook Fulfillment] Fatal fulfillment error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
