// @testFile: E2E tests for Account Upgrade feature. Dependencies: AccountUpgrade component.
/*
Required data-testids to be added in source components:
- [data-testid="account-upgrade-container"] (on the main account upgrade component)
- [data-testid="upgrade-email-input"] (on the email input)
- [data-testid="upgrade-submit-button"] (on the submit button)
- [data-testid="upgrade-success-message"] (on the success confirmation message)
- [data-testid="upgrade-error-message"] (on the inline validation error)
*/

import { test, expect } from '@playwright/test';

test.describe('EU AI Act Compliance Checker - Account Upgrade', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the analyze route to return a paid report so that AccountUpgrade renders
    await page.route('**/analyze', async route => {
      const { PAID_REPORT } = await import('./fixtures/reports');
      await route.fulfill({ json: PAID_REPORT });
    });

    await page.goto('/');
    await page.getByTestId('preset-button').first().click();
    await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();
    await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
  });

  test('AccountUpgrade component renders when pdf_ready is true', async ({ page }) => {
    await expect(page.getByTestId('account-upgrade-container'), 'Account upgrade section should be visible for paid reports').toBeVisible();
  });

  test('Email field is pre-populated with receipt_email', async ({ page }) => {
    const emailInput = page.getByTestId('upgrade-email-input');
    await expect(emailInput, 'Email input should be pre-populated').toHaveValue('test@example.com');
  });

  test('Submitting upgrade with invalid email shows validation error', async ({ page }) => {
    const emailInput = page.getByTestId('upgrade-email-input');
    await emailInput.clear();
    await emailInput.fill('not-an-email');
    
    await page.getByTestId('upgrade-submit-button').click();
    
    await expect(page.getByTestId('upgrade-error-message'), 'Validation error should be visible').toBeVisible();
  });

  test('Submitting upgrade with valid email shows success message', async ({ page }) => {
    // Mock the upgrade API endpoint if it exists, or assume component state handles it
    await page.route('**/api/auth/upgrade*', async route => {
      await route.fulfill({ status: 200, json: { success: true } });
    });

    const emailInput = page.getByTestId('upgrade-email-input');
    await emailInput.clear();
    await emailInput.fill('newuser@example.com');
    
    await page.getByTestId('upgrade-submit-button').click();
    
    await expect(page.getByTestId('upgrade-success-message'), 'Success message should be visible after upgrade').toBeVisible();
  });
});
