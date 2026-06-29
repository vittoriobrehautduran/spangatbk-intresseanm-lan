import { test, expect } from '@playwright/test';
import {
  fillAdultTennisForm,
  goToPreview,
  submitFromPreview,
  expectSubmissionSuccess,
  loginAsAdmin,
  defaultAdultApplication,
  uniqueTestEmail,
} from './helpers/form';

const adminEmail = process.env.ADMIN_TEST_EMAIL;
const adminPassword = process.env.ADMIN_TEST_PASSWORD;

test.describe('Admin panel', () => {
  test.skip(!adminEmail || !adminPassword, 'Set ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD in .env');

  test('admin can log in and see applications list', async ({ page }) => {
    await loginAsAdmin(page, adminEmail!, adminPassword!);
    await expect(page.getByRole('heading', { name: /Ansökningar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Sök/i)).toBeVisible();
  });

  test('admin can find a newly submitted application', async ({ page }) => {
    const application = defaultAdultApplication({
      email: uniqueTestEmail('admin-find'),
      lastName: `AdminFind${Date.now()}`,
    });

    // Submit via public form
    await page.goto('/form');
    await fillAdultTennisForm(page, application);
    await goToPreview(page);
    await submitFromPreview(page);
    await expectSubmissionSuccess(page);

    // Log in and search for it
    await loginAsAdmin(page, adminEmail!, adminPassword!);
    await page.getByPlaceholder(/Sök/i).fill(application.lastName);
    await expect(page.getByText(application.lastName)).toBeVisible({ timeout: 15_000 });
  });

  test('admin login rejects wrong password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#email').fill(adminEmail!);
    await page.locator('#password').fill('wrong-password-xyz');
    await page.getByRole('button', { name: /Logga in/i }).click();
    await expect(page.getByText(/Ogiltig e-post eller lösenord/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
