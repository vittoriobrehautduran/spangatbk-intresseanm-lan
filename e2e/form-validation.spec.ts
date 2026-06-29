import { test, expect } from '@playwright/test';
import { fillAdultTennisForm, fillPreferredTime, acceptTerms, attemptSelectLevel, selectSport, waitForAgeCalculation, goToPreview } from './helpers/form';

test.describe('Form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form');
  });

  test('preview stays on form when required fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Förhandsvisning' }).click();
    await expect(page.getByRole('heading', { name: 'Förhandsvisning' })).not.toBeVisible();
    await expect(page.getByPlaceholder('Förnamn')).toBeVisible();
  });

  test('shows error for invalid personal number', async ({ page }) => {
    const input = page.getByPlaceholder('YYYYMMDD-XXXX');
    await input.fill('12345');
    await input.blur();
    await page.getByRole('button', { name: 'Förhandsvisning' }).click();
    await expect(page.getByText('Ogiltigt personnummer')).toBeVisible();
  });

  test('formats personal number with dash', async ({ page }) => {
    const input = page.getByPlaceholder('YYYYMMDD-XXXX');
    await input.fill('199005151234');
    await expect(input).toHaveValue('19900515-1234');
  });

  test('formats postal code as XXX XX', async ({ page }) => {
    const input = page.getByPlaceholder('163 70');
    await input.fill('16370');
    await expect(input).toHaveValue('163 70');
  });

  test('switches language to English', async ({ page }) => {
    await page.getByRole('button', { name: 'EN' }).click();
    await expect(page.getByText('Binding registration')).toBeVisible();
    await expect(page.getByPlaceholder('First name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview' })).toBeVisible();
  });

  test('blocks inappropriate tennis level for adult selecting boll-lekis', async ({ page }) => {
    await page.getByPlaceholder('YYYYMMDD-XXXX').fill('19900515-1234');
    await waitForAgeCalculation(page);
    await attemptSelectLevel(page, 'Boll-lekis');
    await expect(page.getByText('Välj ett lämpligt alternativ för elevens ålder.')).toBeVisible();
  });

  test('shows guardian section for minor', async ({ page }) => {
    await page.getByPlaceholder('YYYYMMDD-XXXX').fill('20150515-1234');
    await waitForAgeCalculation(page);
    await expect(page.getByRole('button', { name: /Lägg till målsman/i })).toBeVisible();
    await expect(page.getByText('Minst en målsman krävs för personer under 18 år')).toBeVisible();
  });

  test('table tennis requires at least one level', async ({ page }) => {
    await selectSport(page, 'table_tennis');
    await page.getByPlaceholder('Förnamn').fill('Test');
    await page.getByPlaceholder('Efternamn').fill('Bordtennis');
    await page.getByPlaceholder('YYYYMMDD-XXXX').fill('19900515-1234');
    await page.getByPlaceholder('+46 70 123 45 67').fill('0701234567');
    await page.getByPlaceholder('Gatunamn 123').fill('Testgatan 1');
    const postalInput = page.getByPlaceholder('163 70');
    await postalInput.click();
    await postalInput.fill('');
    await postalInput.pressSequentially('16370');
    await page.getByPlaceholder('Stad').fill('Spånga');
    await page.locator('input[type="email"]').first().fill('test@example.com');
    await fillPreferredTime(page);
    await acceptTerms(page);
    await page.getByRole('button', { name: 'Förhandsvisning' }).click();
    await expect(page.getByRole('heading', { name: 'Förhandsvisning' })).not.toBeVisible();
  });

  test('preview shows entered student data', async ({ page }) => {
    const data = await fillAdultTennisForm(page, {
      firstName: 'Anna',
      lastName: 'Svensson',
    });
    await page.getByRole('button', { name: 'Förhandsvisning' }).click();
    await expect(page.getByRole('heading', { name: 'Förhandsvisning' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(`${data.firstName} ${data.lastName}`)).toBeVisible();
    await expect(page.getByText(data.email)).toBeVisible();
  });

  test('back button returns from preview to form', async ({ page }) => {
    await fillAdultTennisForm(page);
    await goToPreview(page);
    await page.getByRole('button', { name: 'Tillbaka' }).click();
    await expect(page.getByPlaceholder('Förnamn')).toBeVisible();
  });
});
