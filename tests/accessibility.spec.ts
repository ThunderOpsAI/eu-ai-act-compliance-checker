// @testFile: Accessibility tests for core pages. Dependencies: @axe-core/playwright.
/*
Required data-testids to be added in source components:
- [data-testid="risk-badge"] (Ensure it has aria-label or accessible text)
- [data-testid="checkout-cta"] (on the Unlock Full Audit PDF Report button)
- [data-testid="checkout-element"] (on the checkout modal/overlay)
*/

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockAnalyzeRoute, restoreAnalyzeRoute } from './helpers/mock-analyze';

test.describe('Accessibility - Axe Core', () => {
  test('Home page has zero critical violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
      
    expect(accessibilityScanResults.violations, 'Should have no accessibility violations on home page').toEqual([]);
  });

  test('Result view has zero critical violations', async ({ page }) => {
    await mockAnalyzeRoute(page, 'High Risk');
    
    await page.goto('/');
    await page.getByTestId('preset-button').first().click();
    await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();
    await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
      
    expect(accessibilityScanResults.violations, 'Should have no accessibility violations on result view').toEqual([]);
    
    await restoreAnalyzeRoute(page);
  });

  test('Checkout element has zero critical violations', async ({ page }) => {
    await mockAnalyzeRoute(page, 'High Risk');
    
    await page.goto('/');
    await page.getByTestId('preset-button').first().click();
    await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();
    await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
    
    await page.getByTestId('checkout-cta').click();
    await expect(page.locator('.StripeElement, [data-testid="checkout-element"]')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
      
    expect(accessibilityScanResults.violations, 'Should have no accessibility violations in checkout element').toEqual([]);
    
    await restoreAnalyzeRoute(page);
  });

  test('Risk badge has accessible text', async ({ page }) => {
    await mockAnalyzeRoute(page, 'High Risk');
    await page.goto('/');
    await page.getByTestId('preset-button').first().click();
    await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();
    await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });

    const badge = page.getByTestId('risk-badge');
    const ariaLabel = await badge.getAttribute('aria-label');
    const text = await badge.textContent();
    
    const hasAccessibleContext = Boolean(ariaLabel || (text && text.trim().length > 0));
    expect(hasAccessibleContext, 'Risk badge should have an aria-label or accessible text').toBe(true);
    
    await restoreAnalyzeRoute(page);
  });
});
