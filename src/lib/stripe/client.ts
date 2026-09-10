import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

/**
 * Returns true if Stripe is running in mock mode or has placeholder keys.
 */
export const isStripeMock =
  !process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY.includes('...') ||
  process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder' ||
  process.env.MOCK_STRIPE === 'true';

/**
 * Stripe SDK instance configured with the application secret key.
 */
export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});
