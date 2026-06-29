import { Page, expect } from '@playwright/test';

export interface AdultTennisApplication {
  firstName: string;
  lastName: string;
  personalNumber: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  tennisLevel?: string;
}

// Born 1990-05-15 — always 18+ regardless of test run date.
export const ADULT_PERSONAL_NUMBER = '19900515-1234';

// Born 2015-05-15 — always under 18.
export const MINOR_PERSONAL_NUMBER = '20150515-1234';

export function uniqueTestEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@playwright-test.local`;
}

export function defaultAdultApplication(overrides: Partial<AdultTennisApplication> = {}): AdultTennisApplication {
  const id = Date.now();
  return {
    firstName: 'Test',
    lastName: `Användare${id}`,
    personalNumber: ADULT_PERSONAL_NUMBER,
    phone: '0701234567',
    address: 'Testgatan 1',
    postalCode: '163 70',
    city: 'Spånga',
    email: uniqueTestEmail('adult'),
    tennisLevel: 'vuxentennis',
    ...overrides,
  };
}

export async function selectSport(page: Page, sport: 'tennis' | 'table_tennis') {
  await page.locator(`input[name="sportType"][value="${sport}"]`).check();
}

// Click level checkbox via accessible name prefix.
export async function selectLevelCheckbox(page: Page, levelLabel: string) {
  const checkbox = page.getByRole('checkbox', { name: new RegExp(`^${levelLabel}`) });
  await checkbox.scrollIntoViewIfNeeded();
  await checkbox.click();
  await expect(checkbox).toBeChecked({ timeout: 5_000 });
}

// Click a level that may be rejected by age validation (checkbox stays unchecked).
export async function attemptSelectLevel(page: Page, levelLabel: string) {
  const checkbox = page.getByRole('checkbox', { name: new RegExp(`^${levelLabel}`) });
  await checkbox.scrollIntoViewIfNeeded();
  await checkbox.click();
}

export async function selectTennisLevel(page: Page, levelLabel: string) {
  await selectLevelCheckbox(page, levelLabel);
}

export async function fillStudentInfo(page: Page, data: AdultTennisApplication) {
  await page.getByPlaceholder('Förnamn').fill(data.firstName);
  await page.getByPlaceholder('Efternamn').fill(data.lastName);
  await page.getByPlaceholder('YYYYMMDD-XXXX').fill(data.personalNumber);
  await page.getByPlaceholder('+46 70 123 45 67').fill(data.phone);
  await page.getByPlaceholder('Gatunamn 123').fill(data.address);
  const postalInput = page.getByPlaceholder('163 70');
  await postalInput.click();
  await postalInput.fill('');
  await postalInput.pressSequentially('16370', { delay: 50 });
  await postalInput.blur();
  await expect(postalInput).toHaveValue('163 70');
  await page.getByPlaceholder('Stad').fill(data.city);

  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill(data.email);
}

export async function fillPreferredTime(page: Page, from = '10', to = '12') {
  const fromSelect = page.locator('#preferred-times-section select').nth(1);
  const toSelect = page.locator('#preferred-times-section select').nth(2);
  await fromSelect.selectOption(from);
  await toSelect.selectOption(to);
}

export async function acceptTerms(page: Page) {
  await page.locator('input[name="termsConfirmed"]').check({ force: true });
}

export async function setGroupPhotoConsent(page: Page, consent: boolean) {
  const labelText = consent ? 'Ja' : 'Nej';
  // Use exact radio name — hasText 'Ja' wrongly matches 'Juniortennis'.
  await page.getByRole('radio', { name: labelText, exact: true }).click();
}

export async function fillAdultTennisForm(page: Page, data?: Partial<AdultTennisApplication>) {
  const application = defaultAdultApplication(data);

  await selectSport(page, 'tennis');

  const levelLabels: Record<string, string> = {
    'vuxentennis': 'Vuxentennis',
    'juniortennis': 'Juniortennis',
    'minitennis': 'Minitennis',
    'boll-lekis': 'Boll-lekis',
    'veterantennis_med_tranare': 'Veterantennis med tränare',
  };
  const level = application.tennisLevel || 'vuxentennis';

  // Fill student info first so age-based level validation works reliably.
  await fillStudentInfo(page, application);
  await waitForAgeCalculation(page);
  await selectTennisLevel(page, levelLabels[level] || 'Vuxentennis');
  await setGroupPhotoConsent(page, true);
  await fillPreferredTime(page);
  await acceptTerms(page);

  return application;
}

export async function fillGuardian(page: Page, guardian: { name: string; email: string; phone: string }) {
  const addButton = page.getByRole('button', { name: /Lägg till målsman/i });
  if (await addButton.isVisible()) {
    await addButton.click();
  }

  const guardianSection = page.locator('.bg-gray-50.border').filter({ hasText: 'Målsmans namn 1' }).first();
  await guardianSection.locator('input[type="text"]').fill(guardian.name);
  await guardianSection.locator('input[type="email"]').fill(guardian.email);
  await guardianSection.locator('input[type="tel"]').fill(guardian.phone);
}

export async function goToPreview(page: Page) {
  // Form validation is debounced by 300ms.
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Förhandsvisning' }).click();
  await expect(page.getByRole('heading', { name: 'Förhandsvisning' })).toBeVisible({ timeout: 15_000 });
}

export async function submitFromPreview(page: Page) {
  await page.getByRole('button', { name: 'Skicka ansökan' }).click();
}

export async function expectSubmissionSuccess(page: Page) {
  await expect(page.getByRole('heading', { name: 'Tack för din ansökan!' })).toBeVisible({
    timeout: 30_000,
  });
}

export async function loginAsAdmin(page: Page, email: string, password: string) {
  await page.goto('/admin/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /Logga in/i }).click();
  await expect(page).toHaveURL(/\/admin\/applications/, { timeout: 15_000 });
}

// Wait for debounced form validation after personal number changes.
export async function waitForAgeCalculation(page: Page) {
  await page.waitForTimeout(400);
}
