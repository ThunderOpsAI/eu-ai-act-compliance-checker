// @testFile: Responsive design tests across viewports. Dependencies: Layout components.
/*
Required data-testids to be added in source components:
- [data-testid="checkout-cta"] (on the Unlock Full Audit PDF Report button)
- [data-testid="result-view-container"] (on the main result view container)
- [data-testid="form-container"] (on the main form container)
*/

import { test, expect } from '@playwright/test';
import { mockAnalyzeRoute, restoreAnalyzeRoute } from './helpers/mock-analyze';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    test.describe(`${vp.name} viewport`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('Layout renders without horizontal overflow', async ({ page }) => {
        await page.goto('/');
        
        const isMobile = vp.width < 768;
        if (isMobile) {
          const formContainer = page.getByTestId('form-container');
          // In mobile, form should likely take up full width or mostly full width
          // Just ensure it doesn't cause overflow
        }

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth, 'Body should not overflow horizontally on load').toBeLessThanOrEqual(windowWidth);
      });

      test('Result view and CTA render correctly', async ({ page }) => {
        await mockAnalyzeRoute(page, 'High Risk');
        await page.goto('/');
        await page.getByTestId('preset-button').first().click();
        await page.getByRole('button', { name: /Check EU AI Act Compliance/i }).click();
        await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });

        const cta = page.getByTestId('checkout-cta');
        await expect(cta, 'CTA button should be visible').toBeVisible();

        // Check if CTA overflows
        const ctaBox = await cta.boundingBox();
        const windowWidth = await page.evaluate(() => window.innerWidth);
        
        expect(ctaBox?.x).toBeGreaterThanOrEqual(0);
        if (ctaBox) {
          expect(ctaBox.x + ctaBox.width, 'CTA button should not overflow the viewport').toBeLessThanOrEqual(windowWidth);
        }

        // Check result view for horizontal overflow
        const resultViewContainer = page.getByTestId('result-view-container');
        if (await resultViewContainer.count() > 0) {
          const containerBox = await resultViewContainer.boundingBox();
          if (containerBox) {
            expect(containerBox.width, 'Result view should not overflow horizontally').toBeLessThanOrEqual(windowWidth);
          }
        }
        
        await restoreAnalyzeRoute(page);
      });
    });
  }
});
