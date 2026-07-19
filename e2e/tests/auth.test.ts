import { test, expect } from '../utils/test-base';
import { loginAsAdmin, loginAsStudent, signUp } from '../utils/auth';
import { DashboardPage } from '../pages/DashboardPage';
import { faker } from '@faker-js/faker';

test.describe('Authentication', () => {
  test.describe('Sign In', () => {
    test('should sign in as admin successfully', async ({ page }) => {
      await loginAsAdmin(page);
      
      // Should redirect to admin dashboard
      await expect(page).toHaveURL(/.*admin/);
    });

    test('should sign in as student successfully', async ({ page }) => {
      await loginAsStudent(page);
      
      // Should redirect to student dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/sign-in');
      
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should redirect to sign-in when accessing protected routes', async ({ page }) => {
      // Try to access admin without authentication
      await page.goto('/admin');
      
      // Should redirect to sign-in
      await expect(page).toHaveURL(/.*sign-in/);
    });
  });

  test.describe('Sign Up', () => {
    test('should allow new user registration', async ({ page }) => {
      const userData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'Test123!@#',
      };
      
      await signUp(page, userData);
      
      // Should redirect to dashboard after successful signup
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/auth/sign-in');
      await page.click('text=Sign Up');
      
      // Try to submit without filling fields
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.locator('text=required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/sign-in');
      await page.click('text=Sign Up');
      
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'Test123!@#');
      await page.click('button[type="submit"]');
      
      // Should show email validation error
      await expect(page.locator('text=Invalid email')).toBeVisible();
    });
  });

  test.describe('Sign Out', () => {
    test('should sign out successfully', async ({ page }) => {
      // First sign in
      await loginAsStudent(page);
      
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.signOut();
      
      // Should redirect to sign-in page
      await expect(page).toHaveURL(/.*sign-in/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      await loginAsStudent(page);
      
      // Reload the page
      await page.reload();
      
      // Should still be logged in
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should clear session after sign out', async ({ page }) => {
      await loginAsStudent(page);
      
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.signOut();
      
      // Try to access dashboard
      await page.goto('/dashboard');
      
      // Should redirect to sign-in
      await expect(page).toHaveURL(/.*sign-in/);
    });
  });
});
