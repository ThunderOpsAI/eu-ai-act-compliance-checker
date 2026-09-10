import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder';

/**
 * Returns true if Resend is running in mock mode or has placeholder keys.
 */
export const isResendMock =
  !process.env.RESEND_API_KEY ||
  process.env.RESEND_API_KEY.includes('...') ||
  process.env.RESEND_API_KEY === 're_placeholder' ||
  process.env.MOCK_RESEND === 'true';

/**
 * Resend SDK instance configured with the application API key.
 */
export const resend = new Resend(resendApiKey);
