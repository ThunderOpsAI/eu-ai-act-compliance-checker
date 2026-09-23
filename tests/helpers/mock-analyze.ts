/**
 * @helper: Playwright route interceptor for the analyze server action.
 * Intercepts Next.js server action POST requests and returns deterministic fixture data.
 *
 * Usage:
 *   await mockAnalyzeRoute(page, 'High');
 *   // ... run test ...
 *   await restoreAnalyzeRoute(page);
 */
import { Page, Route } from '@playwright/test';
import { HIGH_RISK_REPORT, MINIMAL_RISK_REPORT, PROHIBITED_REPORT } from '../fixtures/reports';
import type { RiskTier } from '@/types/database';

type MockTier = RiskTier | 'High' | 'Minimal' | 'Unacceptable';

export async function mockAnalyzeRoute(
  page: Page,
  tier: MockTier = 'High',
  shouldThrow: boolean = false
) {
  // Next.js server actions are posted to the page URL, matched by action name in headers.
  // We intercept any POST that contains the action path pattern.
  await page.route('**', async (route: Route) => {
    const request = route.request();

    // Only intercept POST requests that look like server action invocations
    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }

    const nextAction = request.headers()['next-action'];
    if (!nextAction) {
      await route.continue();
      return;
    }

    if (shouldThrow) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Simulated server error' }),
      });
      return;
    }

    let report = HIGH_RISK_REPORT;
    if (tier === 'Minimal') report = MINIMAL_RISK_REPORT;
    if (tier === 'Unacceptable') report = PROHIBITED_REPORT;

    // Server actions return a special format: [null, result] or the result directly
    // We return it wrapped as the action would
    await route.fulfill({
      status: 200,
      contentType: 'text/x-component',
      body: JSON.stringify({ success: true, report }),
    });
  });
}

export async function restoreAnalyzeRoute(page: Page) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
