import { test, expect } from '../utils/test-base';
import { login } from '../utils/auth';
import { DashboardPage } from '../pages/DashboardPage';
import { StudentPage } from '../pages/StudentPage';
import { faker } from '@faker-js/faker';

test.describe('Student Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    const dashboard = new DashboardPage(page);
    await dashboard.navigateTo();
    // Assuming the tab switcher uses this pattern based on common UI libraries
    await page.click('text=শিক্ষার্থী'); 
  });

  test('should create a new student', async ({ page }) => {
    const studentPage = new StudentPage(page);
    const studentData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };
    
    await studentPage.createStudent(studentData);
    
    // Verify creation
    await expect(page.locator('text=' + studentData.name)).toBeVisible();
  });
});
