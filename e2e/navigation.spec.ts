import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home redirects to form', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/form/);
  });

  test('form page loads with logo and sport selection', async ({ page }) => {
    await page.goto('/form');
    await expect(page.getByAltText('Spånga TBK Logo')).toBeVisible();
    await expect(page.getByText('Bindande Anmälan')).toBeVisible();
    await expect(page.locator('input[name="sportType"][value="tennis"]')).toBeVisible();
    await expect(page.locator('input[name="sportType"][value="table_tennis"]')).toBeVisible();
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /Logga in/i })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('unauthenticated admin redirects to login', async ({ page }) => {
    await page.goto('/admin/applications');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  });
});
