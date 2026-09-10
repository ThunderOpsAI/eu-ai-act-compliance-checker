import { test, expect } from '@playwright/test';

test.describe('EU AI Act Compliance Checker - AI Core Flow', () => {
  test('renders landing page with legal disclaimer and presets', async ({ page }) => {
    await page.goto('/');

    // Check header and title
    await expect(page).toHaveTitle(/EU AI Act/i);
    await expect(page.getByRole('heading', { name: /Instant EU AI Act/i })).toBeVisible();

    // Check mandatory legal disclaimer
    await expect(page.getByText(/Legal & Regulatory Disclaimer/i)).toBeVisible();
    await expect(page.getByText(/does not constitute formal legal counsel/i)).toBeVisible();

    // Check presence of form and presets
    await expect(page.locator('#system-description')).toBeVisible();
    await expect(page.getByText('Recruitment & CV Screening')).toBeVisible();
    await expect(page.getByText('Customer Support Chatbot')).toBeVisible();
  });

  test('classifies a High-Risk AI system and displays free badge with locked teaser', async ({ page }) => {
    await page.goto('/');

    // Click a preset (Recruitment & CV Screening)
    await page.getByRole('button', { name: /Recruitment & CV Screening/i }).click();

    // Ensure textarea has content
    const textarea = page.locator('#system-description');
    await expect(textarea).not.toBeEmpty();

    // Click submit button
    const submitBtn = page.getByRole('button', { name: /Check EU AI Act Compliance/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Wait for result view
    await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });

    // Verify Risk Badge displays High Risk
    await expect(page.getByText(/High Risk \(Annex III\)/i)).toBeVisible();

    // Verify key metrics
    await expect(page.getByText(/Matched Category/i)).toBeVisible();
    await expect(page.getByText(/Primary Article Citation/i)).toBeVisible();
    await expect(page.getByText(/Executive Legal & Operational Rationale/i)).toBeVisible();

    // Verify locked premium teaser
    await expect(page.getByText(/Unlock Full 10-Page Audit PDF & Action Plan/i)).toBeVisible();
    await expect(page.getByText(/Statutory obligations & prioritized action items locked/i)).toBeVisible();

    // Test "Analyze Another System" reset button
    const resetBtn = page.getByRole('button', { name: /Analyze Another System/i });
    await resetBtn.click();
    await expect(page.locator('#system-description')).toBeVisible();
  });

  test('validates input length before allowing submission', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#system-description');
    await textarea.fill('too short');

    const submitBtn = page.getByRole('button', { name: /Check EU AI Act Compliance/i });
    await expect(submitBtn).toBeDisabled();
  });
});
