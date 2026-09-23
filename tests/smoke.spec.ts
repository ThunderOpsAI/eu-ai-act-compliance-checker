// @testFile: Smoke tests for main entry points and configuration. Dependencies: None.

import { test, expect } from '@playwright/test';

test.describe('EU AI Act Compliance Checker - Smoke Test', () => {
  test('landing page loads properly', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/');
    
    // Check page load status
    expect(response?.status(), 'Page should return 200 OK').toBe(200);

    // Title and Meta
    await expect(page, 'Page should have correct title').toHaveTitle(/EU AI Act/i);
    
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription, 'Page should have a meta description').toHaveAttribute('content', /.*/);
    
    // Robots/canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical, 'Page should have a canonical link').toBeAttached();

    // No JS console errors
    expect(consoleErrors.length, `Expected no console errors, got: ${consoleErrors.join(', ')}`).toBe(0);

    // External links
    const externalLinks = await page.locator('a[href^="http"]:not([href*="localhost"]):not([href*="127.0.0.1"])').all();
    for (const link of externalLinks) {
      await expect(link, 'External link should have rel="noopener noreferrer"').toHaveAttribute('rel', /noopener noreferrer/);
    }
  });

  test('favicon is reachable', async ({ request }) => {
    const response = await request.get('/favicon.ico');
    expect(response.status(), 'Favicon should be reachable with 200 status').toBe(200);
  });
});
