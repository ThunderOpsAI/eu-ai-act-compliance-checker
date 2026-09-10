import { test, expect } from '@playwright/test';

test.describe('EU AI Act Compliance Checker - Smoke Test', () => {
  test('landing page loads properly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EU AI Act/i);
  });
});
