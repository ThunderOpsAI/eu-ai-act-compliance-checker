import { createAdminClient } from '@/lib/supabase/admin';
import { generateCompliancePdfBuffer } from '@/lib/pdf/generator';
import { resend, isResendMock } from '@/lib/resend/client';
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
 * Checks if the Supabase environment is using placeholder or test configuration.
 */
function checkIsPlaceholderSupabase(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return (
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your-project') ||
    serviceRoleKey === 'your-service-role-key' ||
    serviceRoleKey.includes('placeholder') ||
    process.env.MOCK_SUPABASE === 'true'
  );
}

/**
 * Background fulfillment task executed asynchronously when Stripe confirms payment.
 *
 * Steps:
 * 1. Look up report by reportId or stripe_payment_intent_id.
 * 2. Webhook Idempotency Check: if report.pdf_ready is already true, log and return immediately.
 * 3. Generate PDF Buffer via generateCompliancePdfBuffer(report).
 * 4. Upload PDF to Supabase Storage 'compliance-reports' bucket under '${report.user_id}/${report.id}.pdf'.
 * 5. Update Supabase 'reports' row: pdf_ready = true, paid_at = now, receipt_email = email, pdf_storage_path = path.
 * 6. Send transactional fulfillment email via Resend attaching the PDF buffer.
 */
export async function fulfillComplianceReportPayment({
  paymentIntentId,
  reportId,
  receiptEmail,
}: FulfillPaymentOptions): Promise<FulfillmentResult> {
  try {
    const isPlaceholderDb = checkIsPlaceholderSupabase();
    let report: ComplianceReport | null = null;

    // 1. Look up the report
    if (!isPlaceholderDb) {
      const supabase = createAdminClient();
      let query = supabase.from('reports').select('*');

      if (reportId) {
        query = query.eq('id', reportId);
      } else {
        query = query.eq('stripe_payment_intent_id', paymentIntentId);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        report = data as unknown as ComplianceReport;
      }
    }

    // Check mock store fallback if not found in db or in mock mode
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

    // 4. Upload PDF to Supabase Storage 'compliance-reports' bucket
    const storagePath = `${report.user_id}/${report.id}.pdf`;
    if (!isPlaceholderDb) {
      try {
        const supabase = createAdminClient();
        const { error: uploadError } = await supabase.storage
          .from('compliance-reports')
          .upload(storagePath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError) {
          console.warn(
            `[Webhook Fulfillment] Supabase storage upload warning for ${storagePath}: ${uploadError.message}`
          );
        } else {
          console.log(`[Webhook Fulfillment] Uploaded PDF to Supabase Storage: ${storagePath}`);
        }
      } catch (uploadErr) {
        console.warn('[Webhook Fulfillment] Storage upload caught error:', uploadErr);
      }
    }

    // 5. Update Supabase 'reports' row
    const paidAt = new Date().toISOString();
    const finalReceiptEmail = receiptEmail || report.receipt_email || null;

    if (!isPlaceholderDb) {
      const supabase = createAdminClient();
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          pdf_ready: true,
          paid_at: paidAt,
          receipt_email: finalReceiptEmail,
          pdf_storage_path: storagePath,
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq('id', report.id);

      if (updateError) {
        console.error(
          `[Webhook Fulfillment] Failed to update report status in Supabase: ${updateError.message}`
        );
      } else {
        console.log(`[Webhook Fulfillment] Successfully marked report ${report.id} as pdf_ready.`);
      }
    }

    // Always keep mock store in sync
    updateMockReport(report.id, {
      pdf_ready: true,
      paid_at: paidAt,
      receipt_email: finalReceiptEmail,
      pdf_storage_path: storagePath,
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
            process.env.RESEND_FROM_EMAIL || 'EU AI Act Compliance <compliance@resend.dev>';
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
      storagePath,
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
