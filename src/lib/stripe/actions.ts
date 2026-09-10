'use server';

import { stripe, isStripeMock } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMockReport, updateMockReport } from './mock-store';
import type { ComplianceReport } from '@/types/database';

export interface CreatePaymentIntentInput {
  reportId: string;
}

export type CreatePaymentIntentResult =
  | { success: true; clientSecret: string; paymentIntentId: string }
  | { success: false; error: string };

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
 * Creates a Stripe Payment Intent for $29 ($2900 cents) associated with a Compliance Report.
 * Updates the report's `stripe_payment_intent_id` in Supabase.
 *
 * Supports input as `{ reportId: string }` or plain `string`.
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
    const isPlaceholderDb = checkIsPlaceholderSupabase();
    let report: ComplianceReport | null = null;

    // 1. Retrieve or validate report in Supabase
    if (!isPlaceholderDb) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', cleanReportId)
        .single();

      if (!error && data) {
        report = data as unknown as ComplianceReport;
      }
    }

    // Check mock store fallback
    if (!report) {
      report = getMockReport(cleanReportId) || null;
    }

    // If real database was queried and report wasn't found (and not placeholder)
    if (!isPlaceholderDb && !report) {
      return { success: false, error: `Report ${cleanReportId} not found.` };
    }

    const priceCents = parseInt(process.env.REPORT_PRICE_CENTS || '2900', 10) || 2900;

    // 2. Stripe Payment Intent creation (Mock vs. Live)
    if (isStripeMock) {
      const mockId = `pi_mock_${cleanReportId}_${Date.now()}`;
      const mockSecret = `${mockId}_secret_${Math.random().toString(36).substring(2, 10)}`;

      if (!isPlaceholderDb) {
        const supabase = createAdminClient();
        await supabase
          .from('reports')
          .update({ stripe_payment_intent_id: mockId })
          .eq('id', cleanReportId);
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

    // 3. Update Supabase reports table with stripe_payment_intent_id
    if (!isPlaceholderDb) {
      const supabase = createAdminClient();
      const { error: updateError } = await supabase
        .from('reports')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', cleanReportId);

      if (updateError) {
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

/**
 * Convenient alias accepting direct reportId parameter.
 */
export async function createPaymentIntent(reportId: string): Promise<CreatePaymentIntentResult> {
  return createPaymentIntentAction({ reportId });
}
