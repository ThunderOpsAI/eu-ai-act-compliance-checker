import crypto from 'crypto';

export function generateStripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payloadToSign = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

export async function postStripeWebhook(request: any, payload: any, secret: string) {
  const body = JSON.stringify(payload);
  const signature = generateStripeSignature(body, secret);

  return request.post('/api/webhooks/stripe', {
    data: body,
    headers: {
      'Stripe-Signature': signature,
      'Content-Type': 'application/json',
    },
  });
}
