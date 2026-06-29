import { test, expect } from '@playwright/test';
import {
  fillAdultTennisForm,
  fillGuardian,
  fillPreferredTime,
  fillStudentInfo,
  acceptTerms,
  goToPreview,
  submitFromPreview,
  expectSubmissionSuccess,
  defaultAdultApplication,
  uniqueTestEmail,
  MINOR_PERSONAL_NUMBER,
  setGroupPhotoConsent,
  selectTennisLevel,
  selectLevelCheckbox,
  selectSport,
  waitForAgeCalculation,
} from './helpers/form';

test.describe('Form submission', () => {
  test('submits adult tennis application end-to-end', async ({ page }) => {
    await page.goto('/form');

    const application = await fillAdultTennisForm(page);
    await goToPreview(page);

    await expect(page.getByText(application.email)).toBeVisible();
    await expect(page.getByText('Vuxentennis')).toBeVisible();

    await submitFromPreview(page);
    await expectSubmissionSuccess(page);
  });

  test('submits table tennis application end-to-end', async ({ page }) => {
    await page.goto('/form');

    const application = defaultAdultApplication({
      email: uniqueTestEmail('tabletennis'),
      lastName: `Bordtennis${Date.now()}`,
    });

    await selectSport(page, 'table_tennis');
    await fillStudentInfo(page, application);
    await waitForAgeCalculation(page);
    await selectLevelCheckbox(page, 'Seniorbordtennis med tränare');
    await setGroupPhotoConsent(page, false);
    await fillPreferredTime(page, '18', '20');
    await acceptTerms(page);

    await goToPreview(page);
    await expect(page.getByText('Bordtennis', { exact: true })).toBeVisible();
    await expect(page.getByText('Seniorbordtennis med tränare')).toBeVisible();
    await submitFromPreview(page);
    await expectSubmissionSuccess(page);
  });

  test('submits minor application with guardian', async ({ page }) => {
    await page.goto('/form');

    const application = defaultAdultApplication({
      personalNumber: MINOR_PERSONAL_NUMBER,
      email: uniqueTestEmail('minor'),
      lastName: `Ungdom${Date.now()}`,
      tennisLevel: 'juniortennis',
    });

    await selectSport(page, 'tennis');
    await fillStudentInfo(page, application);
    await waitForAgeCalculation(page);
    await selectTennisLevel(page, 'Juniortennis');
    await fillGuardian(page, {
      name: 'Målsman Testsson',
      email: uniqueTestEmail('guardian'),
      phone: '0709876543',
    });
    await setGroupPhotoConsent(page, true);
    await fillPreferredTime(page, '16', '18');
    await acceptTerms(page);

    await goToPreview(page);
    await expect(page.getByText('Målsman Testsson')).toBeVisible();
    await submitFromPreview(page);
    await expectSubmissionSuccess(page);
  });
});
