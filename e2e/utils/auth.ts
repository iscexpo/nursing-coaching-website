import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  // Assuming credentials are set via env variables in CI or .env.local
  const email = process.env.TEST_USER_EMAIL || 'admin@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'password123';

  await page.goto('/auth/sign-in');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Verify successful login
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Save storage state for reuse
  await page.context().storageState({ path: 'e2e/auth.json' });
}
