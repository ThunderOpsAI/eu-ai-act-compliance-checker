import { test, expect } from '@playwright/test';

test.describe('EU AI Act Compliance Checker - Payments, Fulfillment & Upsell Flow', () => {
  test('end-to-end checkout, fulfillment, PDF download, and account upgrade', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');

    // 2. Select a preset (Recruitment & CV Screening)
    await page.getByRole('button', { name: /Recruitment & CV Screening/i }).click();

    // 3. Submit for classification
    const submitBtn = page.getByRole('button', { name: /Check EU AI Act Compliance/i });
    await submitBtn.click();

    // 4. Verify Free Classification result displays
    await expect(page.getByText(/EU AI Act Classification Summary/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/High Risk \(Annex III\)/i)).toBeVisible();

    // 5. Verify Locked Teaser & Unlock CTA
    const unlockBtn = page.getByRole('button', { name: /Unlock Full Audit PDF Report \(\$29\)/i });
    await expect(unlockBtn).toBeVisible();
    await unlockBtn.click();

    // 6. Verify Checkout Form appears
    await expect(page.getByText(/Unlock Full Compliance Report & Audit PDF/i)).toBeVisible();
    const emailInput = page.locator('#receipt-email');
    await expect(emailInput).toBeVisible();

    // 7. Submit payment with receipt email
    await emailInput.fill('founder@european-ai.eu');
    const payBtn = page.getByRole('button', { name: /Pay \$29 & Unlock Full Report/i });
    await payBtn.click();

    // 8. Verify Fulfillment Success State & Download Button
    await expect(page.getByText(/Your Complete Compliance Report is Ready!/i)).toBeVisible({ timeout: 15000 });
    const downloadLink = page.getByRole('link', { name: /Download Official PDF Report/i });
    await expect(downloadLink).toBeVisible();
    const href = await downloadLink.getAttribute('href');
    expect(href).toMatch(/\/api\/reports\/.*\/download/);

    // 9. Verify Micro-SaaS Account Upgrade Upsell appears
    await expect(page.getByText(/Save This Report to Your Permanent Account/i)).toBeVisible();
    const upgradeEmailInput = page.locator('#upgrade-email');
    const upgradePasswordInput = page.locator('#upgrade-password');
    await expect(upgradeEmailInput).toHaveValue('founder@european-ai.eu');

    // 10. Complete account upgrade
    await upgradePasswordInput.fill('SecureSecret123!');
    const upgradeBtn = page.getByRole('button', { name: /Save & Upgrade to Permanent Account/i });
    await upgradeBtn.click();

    // 11. Verify permanent account upgrade success banner
    await expect(page.getByText(/Account Successfully Upgraded!/i)).toBeVisible({ timeout: 10000 });
  });
});
