import { test, expect } from '@playwright/test';
import {
  fillAdultTennisForm,
  goToPreview,
  submitFromPreview,
  expectSubmissionSuccess,
} from './helpers/form';

test.describe('Resilient submission', () => {
  test('shows success when API succeeds even if database save failed', async ({ page }) => {
    await page.route('**/api/applications', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          dbSaved: false,
          emailsSent: { student: true, club: true, guardians: false },
          warnings: ['Ansökan kunde inte sparas i databasen'],
        }),
      });
    });

    await page.goto('/form');
    await fillAdultTennisForm(page);
    await goToPreview(page);
    await submitFromPreview(page);

    await expectSubmissionSuccess(page);
    await expect(
      page.getByText(/Din ansökan har tagits emot, men en del av hanteringen kan ha blivit fördröjd/i)
    ).toBeVisible();
  });

  test('shows in-page error when API reports total failure', async ({ page }) => {
    await page.route('**/api/applications', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          dbSaved: false,
          emailsSent: { student: false, club: false, guardians: false },
          warnings: [],
          error: 'Failed to process application',
        }),
      });
    });

    await page.goto('/form');
    await fillAdultTennisForm(page);
    await goToPreview(page);
    await submitFromPreview(page);

    await expect(page.getByText(/Ett fel uppstod när ansökan skulle skickas/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tack för din ansökan!' })).not.toBeVisible();
  });
});
