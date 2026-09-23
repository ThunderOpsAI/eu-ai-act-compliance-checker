import { vi } from 'vitest';

// Global mocks for testing
vi.mock('@/lib/db/index', () => ({
  sql: vi.fn(),
  neon: vi.fn(),
}));

vi.mock('@/lib/gemini/service', () => ({
  analyzeCompliance: vi.fn(),
}));

vi.mock('@/lib/stripe/actions', () => ({
  createPaymentIntent: vi.fn(),
}));

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: vi.fn(),
    };
  },
}));
