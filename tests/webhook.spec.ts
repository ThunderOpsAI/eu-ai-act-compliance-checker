// @testFile: API tests for Stripe webhook. Dependencies: Stripe Signature Header, Webhook Endpoint.

import { test, expect } from '@playwright/test';
import { generateStripeSignature, postStripeWebhook } from './helpers/stripe-webhook';

test.describe('API /api/webhooks/stripe', () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';

  test('wrong Stripe signature returns 400', async ({ request }) => {
    const payload = { id: 'evt_123', type: 'payment_intent.succeeded' };
    const response = await request.post('/api/webhooks/stripe', {
      data: JSON.stringify(payload),
      headers: {
        'Stripe-Signature': 't=123,v1=invalid_signature',
        'Content-Type': 'application/json',
      },
    });
    
    expect(response.status(), 'Should reject invalid signature with 400').toBe(400);
  });

  test('valid signature but unknown event type returns 200 (ignored)', async ({ request }) => {
    const payload = { id: 'evt_123', type: 'unknown.event' };
    const response = await postStripeWebhook(request, payload, secret);
    
    expect(response.status(), 'Should return 200 and ignore unknown events').toBe(200);
  });

  test('without a body returns 400', async ({ request }) => {
    const response = await request.post('/api/webhooks/stripe', {
      headers: {
        'Stripe-Signature': 't=123,v1=sig',
        'Content-Type': 'application/json',
      },
      // No body
    });
    
    expect(response.status(), 'Should return 400 when body is missing').toBe(400);
  });

  test.skip('payment_intent.succeeded triggers fulfillment', async ({ request }) => {
    // Note: requires setting up a test DB context where the intent exists.
    const payload = {
      id: 'evt_pi_success',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123'
        }
      }
    };
    
    const response = await postStripeWebhook(request, payload, secret);
    expect(response.status(), 'Should process successful payment intent').toBe(200);
  });

  test.skip('webhook is idempotent', async ({ request }) => {
    const payload = {
      id: 'evt_pi_success_2',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_1234'
        }
      }
    };
    
    const res1 = await postStripeWebhook(request, payload, secret);
    expect(res1.status()).toBe(200);
    
    const res2 = await postStripeWebhook(request, payload, secret);
    expect(res2.status(), 'Second request should also succeed without double-fulfillment').toBe(200);
  });
});
