'use server';

import {
  createPaymentIntentAction as libCreatePaymentIntentAction,
  createPaymentIntent as libCreatePaymentIntent,
  type CreatePaymentIntentInput,
  type CreatePaymentIntentResult,
} from '@/lib/stripe/actions';

export async function createPaymentIntentAction(
  inputOrReportId: CreatePaymentIntentInput | string
): Promise<CreatePaymentIntentResult> {
  return libCreatePaymentIntentAction(inputOrReportId);
}

export async function createPaymentIntent(
  reportId: string
): Promise<CreatePaymentIntentResult> {
  return libCreatePaymentIntent(reportId);
}
