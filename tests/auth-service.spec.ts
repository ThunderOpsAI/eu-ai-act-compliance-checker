import { test, expect } from '@playwright/test';
import {
  ensureAnonymousUser,
  signInAnonymously,
  upgradeAnonymousAccount,
  upgradeAccount,
  getCurrentUser,
  signOut,
} from '../src/lib/auth/auth-service';

test.describe('Auth Service Client Helpers', () => {
  test('should export all required functions', async () => {
    expect(typeof ensureAnonymousUser).toBe('function');
    expect(typeof signInAnonymously).toBe('function');
    expect(typeof upgradeAnonymousAccount).toBe('function');
    expect(typeof upgradeAccount).toBe('function');
    expect(typeof getCurrentUser).toBe('function');
    expect(typeof signOut).toBe('function');
  });

  test('upgradeAnonymousAccount should reject when email or password is missing', async () => {
    await expect(upgradeAnonymousAccount('', 'password123')).rejects.toThrow(
      'Email and password are required to upgrade account'
    );
    await expect(upgradeAnonymousAccount('test@example.com', '')).rejects.toThrow(
      'Email and password are required to upgrade account'
    );
  });
});
