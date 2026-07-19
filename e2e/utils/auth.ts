import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  const email = process.env.TEST_ADMIN_EMAIL || 'admin@cornia.co';
  const password = process.env.TEST_ADMIN_PASSWORD || 'Admin123!';

  await page.goto('/auth/sign-in');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Verify successful login - should redirect to admin or dashboard
  await page.waitForURL(/.*(admin|dashboard)/);
  
  // Save storage state for reuse
  await page.context().storageState({ path: 'e2e/admin-auth.json' });
}

export async function loginAsStudent(page: Page) {
  const email = process.env.TEST_STUDENT_EMAIL || 'student@example.com';
  const password = process.env.TEST_STUDENT_PASSWORD || 'password123';

  await page.goto('/auth/sign-in');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Verify successful login - should redirect to dashboard
  await page.waitForURL(/.*dashboard/);
  
  // Save storage state for reuse
  await page.context().storageState({ path: 'e2e/student-auth.json' });
}

export async function signUp(page: Page, userData: { name: string; email: string; password: string }) {
  await page.goto('/auth/sign-in');
  await page.click('text=Sign Up');
  await page.fill('input[name="name"]', userData.name);
  await page.fill('input[type="email"]', userData.email);
  await page.fill('input[type="password"]', userData.password);
  await page.click('button[type="submit"]');

  // Verify successful signup
  await page.waitForURL(/.*dashboard/);
}
