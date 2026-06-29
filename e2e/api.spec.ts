import { test, expect } from '@playwright/test';

test.describe('API', () => {
  test('rejects empty POST body with validation error', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Validation failed');
  });

  test('successful POST returns structured response', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        sportType: 'tennis',
        tennisLevels: ['vuxentennis'],
        studentFirstName: 'API',
        studentLastName: 'Structure',
        studentPersonalNumber: '19900515-1234',
        studentPhone: '0701234567',
        studentAddress: 'Testgatan 1',
        studentPostalCode: '163 70',
        studentCity: 'Spånga',
        studentEmail: `api-structure-${Date.now()}@playwright-test.local`,
        hasGuardian: false,
        groupPhotoConsent: true,
        termsConfirmed: true,
        preferredTimes: [{ day: 'monday', from: '10', to: '12' }],
      },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(typeof body.dbSaved).toBe('boolean');
    expect(body.emailsSent).toMatchObject({
      student: expect.any(Boolean),
      club: expect.any(Boolean),
      guardians: expect.any(Boolean),
    });
    expect(Array.isArray(body.warnings)).toBe(true);
  });

  test('rejects invalid personal number via API', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        sportType: 'tennis',
        tennisLevels: ['vuxentennis'],
        studentFirstName: 'Test',
        studentLastName: 'API',
        studentPersonalNumber: 'invalid',
        studentPhone: '0701234567',
        studentAddress: 'Testgatan 1',
        studentPostalCode: '163 70',
        studentCity: 'Spånga',
        studentEmail: 'api-test@example.com',
        hasGuardian: false,
        groupPhotoConsent: true,
        termsConfirmed: true,
        preferredTimes: [{ day: 'monday', from: '10', to: '12' }],
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);
  });

  test('DELETE without auth returns 401', async ({ request }) => {
    const response = await request.delete('/api/applications?id=fake-id');
    expect(response.status()).toBe(401);
  });
});
