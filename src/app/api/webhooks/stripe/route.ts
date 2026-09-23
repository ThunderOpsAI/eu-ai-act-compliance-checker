import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { fulfillComplianceReportPayment } from '@/lib/stripe/fulfillment';

function safeWaitUntil(promise: Promise<unknown>) {
  try {
    waitUntil(promise);
  } catch {
    // Standalone Node.js environment fallback
    promise.catch((err) => {
      console.error('[Stripe Webhook] Background task error:', err);
    });
  }
}

/**
 * Stripe Webhook Route Handler
 *
 * CRITICAL PERFORMANCE & TIMEOUT DESIGN:
 * Vercel Hobby tier limits synchronous route handlers to 10-15s. Compiling a
 * 10-page compliance report PDF with @react-pdf/renderer and dispatching via Resend
 * can exceed or approach this boundary.
 *
 * We utilize `waitUntil()` from @vercel/functions to decouple the heavy PDF generation
 * and fulfillment task from the HTTP response lifecycle. The route immediately
 * responds to Stripe with HTTP 200 OK ({ received: true }), preventing Stripe webhook
 * timeouts and retries while the task completes safely in the background.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // 1. Signature Verification
  const isSecretConfigured =
    webhookSecret &&
    !webhookSecret.includes('...') &&
    !webhookSecret.includes('placeholder') &&
    webhookSecret.startsWith('whsec_');

  if (isSecretConfigured && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }
  } else {
    // Development / Mock fallback when secrets are unconfigured or testing
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err: unknown) {
      console.error('[Stripe Webhook] Failed to parse JSON payload:', err);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  // 2. Handle relevant fulfillment events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentIntentId = paymentIntent.id;
    const reportId = paymentIntent.metadata?.report_id || null;

    // Extract receipt email from PaymentIntent or associated charges
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chargesData = (paymentIntent as any).charges?.data;
    const chargeEmail =
      chargesData?.[0]?.billing_details?.email || chargesData?.[0]?.receipt_email;

    const receiptEmail =
      paymentIntent.receipt_email ||
      chargeEmail ||
      paymentIntent.metadata?.receipt_email ||
      paymentIntent.metadata?.email ||
      null;

    console.log(
      `[Stripe Webhook] Received payment_intent.succeeded for PI: ${paymentIntentId} (Report ID: ${reportId})`
    );

    // CRITICAL REQUIREMENT: Enforce asynchronous execution using waitUntil
    safeWaitUntil(
      fulfillComplianceReportPayment({
        paymentIntentId,
        reportId,
        receiptEmail,
      }).catch((fulfillmentErr) => {
        console.error(
          '[Stripe Webhook] Background asynchronous fulfillment task failed:',
          fulfillmentErr
        );
      })
    );
  } else if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || session.id;
    const reportId = session.metadata?.report_id || session.client_reference_id || null;
    const receiptEmail = session.customer_details?.email || session.customer_email || null;

    console.log(
      `[Stripe Webhook] Received checkout.session.completed for Session: ${session.id} (Report ID: ${reportId})`
    );

    safeWaitUntil(
      fulfillComplianceReportPayment({
        paymentIntentId,
        reportId,
        receiptEmail,
      }).catch((fulfillmentErr) => {
        console.error(
          '[Stripe Webhook] Background asynchronous fulfillment task failed:',
          fulfillmentErr
        );
      })
    );
  } else {
    console.log(`[Stripe Webhook] Ignored event type: ${event.type}`);
  }

  // 3. Return immediate 200 OK to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}
