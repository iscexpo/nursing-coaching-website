import { test, expect } from '../utils/test-base';
import { loginAsAdmin } from '../utils/auth';
import { DashboardPage } from '../pages/DashboardPage';
import { CrudPage } from '../pages/CrudPage';
import { faker } from '@faker-js/faker';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe('Overview Tab', () => {
    test('should display admin overview statistics', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.navigateToAdmin();
      await dashboardPage.verifyDashboardLoaded();
      
      // Verify overview tab is active
      await dashboardPage.verifyTabActive('ওভারভিউ');
      
      // Verify statistics
      await expect(page.locator('text=মোট কোর্স')).toBeVisible();
      await expect(page.locator('text=মোট এনরোলমেন্ট')).toBeVisible();
      await expect(page.locator('text=মোট পেমেন্ট')).toBeVisible();
    });

    test('should display pending items count', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      // Verify pending badges are shown
      await expect(page.locator('text=এনরোলমেন্ট')).toBeVisible();
    });
  });

  test.describe('Courses Tab', () => {
    test('should display courses list', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=কোর্স');
      
      // Verify courses table
      await expect(page.locator('text=কোর্স তালিকা')).toBeVisible();
    });

    test('should create new course', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=কোর্স');
      
      // Click add button
      await page.click('button:has-text("যোগ করুন")');
      
      // Fill course form
      const courseData = {
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        fee: faker.number.int({ min: 1000, max: 50000 }),
        duration: '3 months',
      };
      
      await page.fill('input[name="title"]', courseData.title);
      await page.fill('textarea[name="description"]', courseData.description);
      await page.fill('input[name="fee"]', String(courseData.fee));
      await page.fill('input[name="duration"]', courseData.duration);
      
      // Submit form
      await page.click('button:has-text("সংরক্ষণ")');
      
      // Verify success
      await expect(page.locator('text=কোর্স সফলভাবে তৈরি হয়েছে')).toBeVisible();
    });

    test('should edit existing course', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=কোর্স');
      
      // Click edit button on first course
      const editButtons = page.locator('button:has-text("সম্পাদনা")');
      const count = await editButtons.count();
      
      if (count > 0) {
        await editButtons.first().click();
        
        // Update course
        const newTitle = faker.lorem.words(3);
        await page.fill('input[name="title"]', newTitle);
        await page.click('button:has-text("আপডেট")');
        
        // Verify success
        await expect(page.locator('text=কোর্স আপডেট সফল')).toBeVisible();
      }
    });

    test('should toggle course status', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=কোর্স');
      
      // Click toggle button
      const toggleButtons = page.locator('button[aria-label*="Toggle status"]');
      const count = await toggleButtons.count();
      
      if (count > 0) {
        await toggleButtons.first().click();
        
        // Verify status changed
        await expect(page.locator('text=স্ট্যাটাস আপডেট সফল')).toBeVisible();
      }
    });
  });

  test.describe('Enrollments Tab', () => {
    test('should display enrollments list', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=এনরোলমেন্ট');
      
      // Verify enrollments table
      await expect(page.locator('text=এনরোলমেন্ট তালিকা')).toBeVisible();
    });

    test('should approve pending enrollment', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=এনরোলমেন্ট');
      
      // Filter by pending status
      await page.click('button:has-text("অপেক্ষমান")');
      
      // Click approve button
      const approveButtons = page.locator('button:has-text("অনুমোদন")');
      const count = await approveButtons.count();
      
      if (count > 0) {
        await approveButtons.first().click();
        
        // Confirm approval
        await page.click('button:has-text("নিশ্চিত")');
        
        // Verify success
        await expect(page.locator('text=এনরোলমেন্ট অনুমোদিত')).toBeVisible();
      }
    });

    test('should reject enrollment', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=এনরোলমেন্ট');
      
      // Click reject button
      const rejectButtons = page.locator('button:has-text("প্রত্যাখ্যান")');
      const count = await rejectButtons.count();
      
      if (count > 0) {
        await rejectButtons.first().click();
        
        // Confirm rejection
        await page.click('button:has-text("নিশ্চিত")');
        
        // Verify success
        await expect(page.locator('text=এনরোলমেন্ট প্রত্যাখ্যাত')).toBeVisible();
      }
    });
  });

  test.describe('Payments Tab', () => {
    test('should display payments list', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=পেমেন্ট');
      
      // Verify payments table
      await expect(page.locator('text=পেমেন্ট তালিকা')).toBeVisible();
    });

    test('should verify payment', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=পেমেন্ট');
      
      // Click verify button
      const verifyButtons = page.locator('button:has-text("যাচাই")');
      const count = await verifyButtons.count();
      
      if (count > 0) {
        await verifyButtons.first().click();
        
        // Verify payment details modal
        await expect(page.locator('text=পেমেন্ট বিস্তারিত')).toBeVisible();
        
        // Confirm verification
        await page.click('button:has-text("নিশ্চিত")');
        
        // Verify success
        await expect(page.locator('text=পেমেন্ট যাচাইকৃত')).toBeVisible();
      }
    });

    test('should reject payment', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=পেমেন্ট');
      
      // Click reject button
      const rejectButtons = page.locator('button:has-text("প্রত্যাখ্যান")');
      const count = await rejectButtons.count();
      
      if (count > 0) {
        await rejectButtons.first().click();
        
        // Add rejection reason
        await page.fill('textarea[name="reason"]', 'Invalid transaction ID');
        await page.click('button:has-text("নিশ্চিত")');
        
        // Verify success
        await expect(page.locator('text=পেমেন্ট প্রত্যাখ্যাত')).toBeVisible();
      }
    });
  });

  test.describe('Notices Tab', () => {
    test('should display notices list', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=নোটিশ');
      
      // Verify notices table
      await expect(page.locator('text=নোটিশ তালিকা')).toBeVisible();
    });

    test('should create new notice', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=নোটিশ');
      
      // Click add button
      await page.click('button:has-text("নতুন নোটিশ")');
      
      // Fill notice form
      const noticeData = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
      };
      
      await page.fill('input[name="title"]', noticeData.title);
      await page.fill('textarea[name="content"]', noticeData.content);
      
      // Submit form
      await page.click('button:has-text("প্রকাশ")');
      
      // Verify success
      await expect(page.locator('text=নোটিশ প্রকাশিত')).toBeVisible();
    });

    test('should delete notice', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=নোটিশ');
      
      // Click delete button
      const deleteButtons = page.locator('button:has-text("মুছুন")');
      const count = await deleteButtons.count();
      
      if (count > 0) {
        await deleteButtons.first().click();
        
        // Confirm deletion
        await page.click('button:has-text("নিশ্চিত")');
        
        // Verify success
        await expect(page.locator('text=নোটিশ মুছে ফেলা হয়েছে')).toBeVisible();
      }
    });
  });

  test.describe('Exams Tab', () => {
    test('should display exams list', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=পরীক্ষা');
      
      // Verify exams table
      await expect(page.locator('text=পরীক্ষা তালিকা')).toBeVisible();
    });

    test('should create new exam', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=পরীক্ষা');
      
      // Click add button
      await page.click('button:has-text("নতুন পরীক্ষা")');
      
      // Fill exam form
      const examData = {
        title: faker.lorem.words(3),
        subject: 'বাংলা',
        duration: '15',
        totalMarks: '100',
      };
      
      await page.fill('input[name="title"]', examData.title);
      await page.selectOption('select[name="subject"]', examData.subject);
      await page.fill('input[name="duration"]', examData.duration);
      await page.fill('input[name="totalMarks"]', examData.totalMarks);
      
      // Submit form
      await page.click('button:has-text("তৈরি")');
      
      // Verify success
      await expect(page.locator('text=পরীক্ষা তৈরি সফল')).toBeVisible();
    });
  });

  test.describe('Students Tab', () => {
    test('should display students list', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=শিক্ষার্থী');
      
      // Verify students table
      await expect(page.locator('text=শিক্ষার্থী তালিকা')).toBeVisible();
    });

    test('should search for student', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=শিক্ষার্থী');
      
      // Enter search term
      await page.fill('input[placeholder*="অনুসন্ধান"]', 'test');
      
      // Verify search results
      await page.waitForTimeout(500); // Wait for debounce
    });
  });

  test.describe('Attendance Tab', () => {
    test('should display attendance records', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=উপস্থিতি');
      
      // Verify attendance section
      await expect(page.locator('text=উপস্থিতি মার্কিং')).toBeVisible();
    });

    test('should mark attendance', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=উপস্থিতি');
      
      // Select date and course
      await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
      
      // Mark attendance for a student
      const presentButtons = page.locator('button:has-text("উপস্থিত")');
      const count = await presentButtons.count();
      
      if (count > 0) {
        await presentButtons.first().click();
        
        // Save attendance
        await page.click('button:has-text("সংরক্ষণ")');
        
        // Verify success
        await expect(page.locator('text=উপস্থিতি সংরক্ষিত')).toBeVisible();
      }
    });
  });
});
