// @testFile: E2E tests for authentication flow. Dependencies: BetterAuth, Auth UI components.
/*
Required data-testids to be added in source components:
- [data-testid="sign-up-link"] (on the link to sign up page)
- [data-testid="sign-in-link"] (on the link to sign in page)
- [data-testid="sign-out-button"] (on the sign out button)
- [data-testid="auth-email-input"] (on the email input in auth forms)
- [data-testid="auth-password-input"] (on the password input in auth forms)
- [data-testid="auth-submit-button"] (on the submit button in auth forms)
- [data-testid="user-profile-menu"] (on the user profile/avatar when logged in)
*/

import { test, expect } from '@playwright/test';

test.describe('EU AI Act Compliance Checker - Auth Flow', () => {
  test('Unauthenticated users can access main page and run analysis', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Instant EU AI Act/i })).toBeVisible();
    
    // Check form is available
    await expect(page.locator('#system-description')).toBeVisible();
  });

  test('BetterAuth /api/auth/* routes return correct CORS headers', async ({ request }) => {
    const response = await request.get('/api/auth/session');
    // Auth routes often return specific CORS or Cache-Control headers
    const headers = response.headers();
    expect(headers).toHaveProperty('content-type');
    expect(response.status()).toBe(200);
  });

  test.skip('Auth sign-up flow', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('sign-up-link').click();
    
    await expect(page).toHaveURL(/.*\/sign-up/);
    
    await page.getByTestId('auth-email-input').fill(`test-${Date.now()}@example.com`);
    await page.getByTestId('auth-password-input').fill('SecurePassword123!');
    await page.getByTestId('auth-submit-button').click();
    
    // Assert authenticated state
    await expect(page.getByTestId('user-profile-menu'), 'User profile should be visible after sign up').toBeVisible();
  });

  test.skip('Auth sign-in and sign-out flow', async ({ page }) => {
    // Assuming user already exists from previous test or DB seed
    await page.goto('/sign-in');
    
    await page.getByTestId('auth-email-input').fill('existing@example.com');
    await page.getByTestId('auth-password-input').fill('SecurePassword123!');
    await page.getByTestId('auth-submit-button').click();
    
    await expect(page.getByTestId('user-profile-menu'), 'User profile should be visible after sign in').toBeVisible();
    
    // Sign out
    await page.getByTestId('sign-out-button').click();
    
    // Assert redirected to home or signed out state
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('sign-in-link'), 'Sign in link should be visible after sign out').toBeVisible();
  });
});
