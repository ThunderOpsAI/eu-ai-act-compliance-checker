// @testFile: E2E tests for the core compliance analysis flow. Dependencies: Analyze API action, Form, Result View.
/*
Required data-testids to be added in source components:
- [data-testid="preset-button"] (on each preset button in compliance-form.tsx)
- [data-testid="char-counter"] (on the character counter in compliance-form.tsx)
- [data-testid="risk-badge"] (on the risk badge in result-view.tsx)
- [data-testid="matched-article"] (on the article citation in result-view.tsx)
- [data-testid="progress-stepper"] (on the loading progress stepper)
- [data-testid="error-boundary"] (on the error state container)
- [data-testid="retry-button"] (on the try again button in error state)
- [data-testid="obligation-item"] (on each obligation in the result-view list)
- [data-testid="mandatory-badge"] (on the mandatory/recommended badge)
- [data-testid="blurred-teaser"] (on the locked premium content area)
- [data-testid="checkout-cta"] (on the Unlock Full Audit PDF Report button)
- [data-testid="download-pdf"] (on the Download Official PDF Report button)
*/

import { test, expect } from '@playwright/test';
import { mockAnalyzeRoute, restoreAnalyzeRoute } from './helpers/mock-analyze';

test.describe('EU AI Act Compliance Checker - AI Core Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.afterEach(async ({ page }) => {
    await restoreAnalyzeRoute(page);
  });

  test.describe('Form Validation & Presets', () => {
    test('validates input length and updates character counter', async ({ page }) => {
      const textarea = page.locator('#system-description');
      const submitBtn = page.getByRole('button', { name: /Check EU AI Act Compliance/i });
      
      await textarea.fill('too short');
      await expect(submitBtn, 'Submit button should be disabled for < 10 chars').toBeDisabled();
      
      // Wait for React state to update if needed
      await expect(page.getByTestId('char-counter'), 'Character counter should show current length').toContainText('9');
      
      const validText = 'a'.repeat(10);
      await textarea.fill(validText);
      await expect(submitBtn, 'Submit button should be enabled for >= 10 chars').toBeEnabled();
    });

    test('presets populate form correctly', async ({ page }) => {
      const presetButtons = page.getByTestId('preset-button');

      // The app has exactly 4 presets as defined in PRESETS array in compliance-form.tsx
      const count = await presetButtons.count();
      expect(count, 'There should be exactly 4 preset buttons').toBe(4);

      const textarea = page.locator('#system-description');

      for (let i = 0; i < count; i++) {
        await presetButtons.nth(i).click();
        const content = await textarea.inputValue();
        expect(content.length, `Preset ${i} content should be >= 10 chars`).toBeGreaterThanOrEqual(10);

        // Check that pressing a second preset replaces, not appends
        if (i > 0) {
          const prevText = await presetButtons.nth(i - 1).textContent();
          expect(content, 'Preset should replace content, not append to it').not.toContain(prevText || '__no_match__');
        }
      }
    });
  });


  test.describe('API Interaction Mocking', () => {
    test('handles HIGH RISK correctly', async ({ page }) => {
      await mockAnalyzeRoute(page, 'High');

      await page.getByTestId('preset-button').first().click();
      await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();

      await expect(page.getByTestId('progress-stepper'), 'Progress stepper should be visible while loading').toBeVisible();

      await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('risk-badge'), 'Risk badge should display High Risk').toContainText('High');
      await expect(page.getByTestId('matched-article'), 'Matched article should be displayed').toBeVisible();
    });

    test('handles MINIMAL RISK correctly', async ({ page }) => {
      await mockAnalyzeRoute(page, 'Minimal');

      await page.getByTestId('preset-button').first().click();
      await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();

      await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('risk-badge'), 'Risk badge should display Minimal Risk').toContainText('Minimal');
    });

    test('handles PROHIBITED/UNACCEPTABLE correctly', async ({ page }) => {
      await mockAnalyzeRoute(page, 'Unacceptable');

      await page.getByTestId('preset-button').first().click();
      await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();

      await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('risk-badge'), 'Risk badge should display Unacceptable/Prohibited').toContainText(/Unacceptable|Prohibited/i);
    });

    test('handles API errors gracefully', async ({ page }) => {
      await mockAnalyzeRoute(page, 'High', true); // shouldThrow = true

      await page.getByTestId('preset-button').first().click();
      await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();

      await expect(page.getByTestId('error-boundary'), 'Error state should render on failure').toBeVisible();

      // Retry without error
      await restoreAnalyzeRoute(page);
      await mockAnalyzeRoute(page, 'High', false);
      await page.getByTestId('retry-button').click();
      await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Result View Assertions', () => {
    test.beforeEach(async ({ page }) => {
      await mockAnalyzeRoute(page, 'High');
      await page.getByTestId('preset-button').first().click();
      await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();
      await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
    });

    test('renders executive rationale and obligations correctly', async ({ page }) => {
      // The component renders "Executive Legal & Operational Rationale" heading
      await expect(
        page.getByText(/Executive Legal.*Operational Rationale/i),
        'Executive rationale section should be visible'
      ).toBeVisible();

      const obligations = page.getByTestId('obligation-item');
      await expect(obligations.first(), 'Obligations list should render >= 1 item').toBeVisible();

      const badge = obligations.first().getByTestId('mandatory-badge');
      await expect(badge, 'Obligation item should have a mandatory/recommended badge').toBeVisible();
    });

    test('unpaid reports show blurred teaser and CTA', async ({ page }) => {
      await expect(page.getByTestId('blurred-teaser'), 'Blurred teaser should be visible for unpaid reports').toBeVisible();

      const cta = page.getByTestId('checkout-cta');
      await expect(cta, 'Checkout CTA button should be visible').toBeVisible();

      await cta.click();
      // Checkout element should appear in-page without full navigation
      await expect(
        page.locator('[data-testid="checkout-element"]'),
        'Checkout element should appear without full navigation'
      ).toBeVisible();
    });

    test('paid reports show download button', async ({ page }) => {
      // Override the mock with a paid report fixture
      await restoreAnalyzeRoute(page);
      const { PAID_REPORT } = await import('./fixtures/reports');
      await page.route('**', async (route) => {
        const req = route.request();
        if (req.method() === 'POST' && req.headers()['next-action']) {
          await route.fulfill({
            status: 200,
            contentType: 'text/x-component',
            body: JSON.stringify({ success: true, report: PAID_REPORT }),
          });
          return;
        }
        await route.continue();
      });

      await page.goto('/');
      await page.getByTestId('preset-button').first().click();
      await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();

      await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('download-pdf'), 'Download PDF button should be visible for paid reports').toBeVisible();
    });

    test('Analyze Another System resets form', async ({ page }) => {
      const resetBtn = page.getByRole('button', { name: /Analyze Another System/i });
      await resetBtn.click();

      await expect(page.locator('#system-description'), 'Form should be visible again').toBeVisible();
      await expect(page.locator('#system-description'), 'Form textarea should be empty after reset').toBeEmpty();
    });
  });
});
