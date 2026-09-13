'use server';

import { stripe, isStripeMock } from './client';
import { getReportById, updateReportPaymentIntent } from '@/lib/db/reports';
import { getMockReport, updateMockReport } from './mock-store';
import type { ComplianceReport } from '@/types/database';

export interface CreatePaymentIntentInput {
  reportId: string;
}

export type CreatePaymentIntentResult =
  | { success: true; clientSecret: string; paymentIntentId: string }
  | { success: false; error: string };

/**
 * Creates a Stripe Payment Intent for $29 ($2900 cents) associated with a Compliance Report.
 * Updates the report's `stripe_payment_intent_id` in the database.
 */
export async function createPaymentIntentAction(
  inputOrReportId: CreatePaymentIntentInput | string
): Promise<CreatePaymentIntentResult> {
  try {
    const reportId =
      typeof inputOrReportId === 'string'
        ? inputOrReportId
        : inputOrReportId?.reportId;

    if (!reportId || typeof reportId !== 'string' || reportId.trim().length === 0) {
      return { success: false, error: 'Valid report ID is required.' };
    }

    const cleanReportId = reportId.trim();
    let report: ComplianceReport | null = null;

    // 1. Retrieve report from Neon DB
    if (process.env.DATABASE_URL) {
      try {
        report = await getReportById(cleanReportId);
      } catch (err) {
        console.warn('Failed querying Neon for report, falling back to mock store:', err);
      }
    }

    // Check mock store fallback
    if (!report) {
      report = getMockReport(cleanReportId) || null;
    }

    if (!report) {
      return { success: false, error: `Report ${cleanReportId} not found.` };
    }

    const priceCents = parseInt(process.env.REPORT_PRICE_CENTS || '2900', 10) || 2900;

    // 2. Stripe Payment Intent creation (Mock vs. Live)
    if (isStripeMock) {
      const mockId = `pi_mock_${cleanReportId}_${Date.now()}`;
      const mockSecret = `${mockId}_secret_${Math.random().toString(36).substring(2, 10)}`;

      if (process.env.DATABASE_URL) {
        try {
          await updateReportPaymentIntent(cleanReportId, mockId);
        } catch (err) {
          console.warn('Could not update payment intent in Neon:', err);
        }
      }

      updateMockReport(cleanReportId, {
        stripe_payment_intent_id: mockId,
      });

      return {
        success: true,
        clientSecret: mockSecret,
        paymentIntentId: mockId,
      };
    }

    // Live Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceCents,
      currency: 'usd',
      metadata: {
        report_id: cleanReportId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      return {
        success: false,
        error: 'Failed to generate Stripe payment intent client secret.',
      };
    }

    // 3. Update database with stripe_payment_intent_id
    if (process.env.DATABASE_URL) {
      try {
        await updateReportPaymentIntent(cleanReportId, paymentIntent.id);
      } catch (updateError) {
        console.error(
          `Failed to record stripe_payment_intent_id on report ${cleanReportId}:`,
          updateError
        );
      }
    }

    updateMockReport(cleanReportId, {
      stripe_payment_intent_id: paymentIntent.id,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error creating payment intent.';
    console.error('createPaymentIntentAction error:', err);
    return { success: false, error: message };
  }
}

export async function createPaymentIntent(reportId: string): Promise<CreatePaymentIntentResult> {
  return createPaymentIntentAction({ reportId });
}
