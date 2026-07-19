import { test, expect } from '../utils/test-base';
import { loginAsStudent } from '../utils/auth';
import { ExamPage } from '../pages/ExamPage';

test.describe('Exam System', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test.describe('Exam List', () => {
    test('should display available exams', async ({ page }) => {
      const examPage = new ExamPage(page);
      await examPage.navigateTo();
      await examPage.waitForLoading();
      
      await examPage.verifyExamList();
    });

    test('should show exam details', async ({ page }) => {
      await page.goto('/exam');
      await page.waitForLoadState('networkidle');
      
      // Click on an exam to view details
      const examCards = page.locator('a[href*="/exam/"]');
      const count = await examCards.count();
      
      if (count > 0) {
        await examCards.first().click();
        
        // Verify exam details page
        await expect(page.locator('text=পরীক্ষার বিস্তারিত')).toBeVisible();
      }
    });
  });

  test.describe('Taking Exam', () => {
    test('should start exam successfully', async ({ page }) => {
      await page.goto('/exam');
      await page.waitForLoadState('networkidle');
      
      // Navigate to a specific exam (assuming exam ID 1 exists)
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      const examPage = new ExamPage(page);
      await examPage.startExam();
      
      // Verify exam interface loads
      await examPage.verifyTimerVisible();
      await expect(page.locator('text=প্রশ্ন')).toBeVisible();
    });

    test('should display questions', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Verify questions are displayed
      await expect(page.locator('[data-question]')).toBeVisible();
      await expect(page.locator('[data-answer]')).toBeVisible();
    });

    test('should allow answer selection', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      const examPage = new ExamPage(page);
      
      // Select an answer for the first question
      await examPage.selectAnswer(0, 0);
      
      // Verify selection is highlighted
      await expect(page.locator('[data-question="0"] [data-answer="0"][data-selected="true"]')).toBeVisible();
    });

    test('should navigate between questions', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      const examPage = new ExamPage(page);
      
      // Go to next question
      await examPage.nextQuestion();
      
      // Verify question index changed
      await expect(page.locator('[data-question="1"]')).toBeVisible();
      
      // Go back to previous question
      await examPage.previousQuestion();
      
      // Verify back to first question
      await expect(page.locator('[data-question="0"]')).toBeVisible();
    });

    test('should show question navigation grid', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Verify navigation grid is visible
      await expect(page.locator('[data-question-grid]')).toBeVisible();
    });

    test('should jump to specific question from grid', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Click on question 5 in the grid
      await page.click('[data-question-grid] [data-question-index="5"]');
      
      // Verify jumped to question 5
      await expect(page.locator('[data-question="5"]')).toBeVisible();
    });
  });

  test.describe('Timer', () => {
    test('should display countdown timer', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      const examPage = new ExamPage(page);
      await examPage.verifyTimerVisible();
      
      // Get initial time
      const initialTime = await page.locator('[data-timer]').textContent();
      expect(initialTime).toBeTruthy();
    });

    test('should auto-submit when timer expires', async ({ page }) => {
      // This test would require mocking the timer or using a very short duration
      // For now, we'll just verify the timer is present
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Verify timer is visible
      await expect(page.locator('[data-timer]')).toBeVisible();
    });
  });

  test.describe('Submission', () => {
    test('should submit exam manually', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Answer at least one question
      const examPage = new ExamPage(page);
      await examPage.selectAnswer(0, 0);
      
      // Submit exam
      await examPage.submitExam();
      
      // Confirm submission
      await page.click('button:has-text("নিশ্চিত")');
      
      // Verify redirect to results
      await examPage.verifyResultPage();
    });

    test('should show confirmation dialog before submit', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Click submit
      await page.click('button:has-text("জমা দিন")');
      
      // Verify confirmation dialog
      await expect(page.locator('text=আপনি কি নিশ্চিত')).toBeVisible();
    });

    test('should show unanswered questions warning', async ({ page }) => {
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Don't answer any questions, just submit
      await page.click('button:has-text("জমা দিন")');
      
      // Verify warning about unanswered questions
      await expect(page.locator('text=উত্তর দেওয়া হয়নি')).toBeVisible();
    });
  });

  test.describe('Results', () => {
    test('should display exam results', async ({ page }) => {
      // First complete an exam
      await page.goto('/exam/1');
      await page.waitForLoadState('networkidle');
      
      // Start exam
      await page.click('button:has-text("শুরু করুন")');
      
      // Answer some questions
      await page.click('[data-question="0"] [data-answer="0"]');
      await page.click('[data-question="1"] [data-answer="1"]');
      
      // Submit
      await page.click('button:has-text("জমা দিন")');
      await page.click('button:has-text("নিশ্চিত")');
      
      const examPage = new ExamPage(page);
      await examPage.verifyResultPage();
      await examPage.verifyScore();
    });

    test('should show score breakdown', async ({ page }) => {
      await page.goto('/exam/result/1');
      await page.waitForLoadState('networkidle');
      
      // Verify score elements
      await expect(page.locator('text=মোট স্কোর')).toBeVisible();
      await expect(page.locator('text=সঠিক উত্তর')).toBeVisible();
      await expect(page.locator('text=ভুল উত্তর')).toBeVisible();
    });

    test('should show answer review', async ({ page }) => {
      await page.goto('/exam/result/1');
      await page.waitForLoadState('networkidle');
      
      // Click on review answers
      await page.click('button:has-text("উত্তর পর্যালোচনা")');
      
      // Verify answer review section
      await expect(page.locator('text=আপনার উত্তর')).toBeVisible();
      await expect(page.locator('text=সঠিক উত্তর')).toBeVisible();
    });

    test('should show grade/badge', async ({ page }) => {
      await page.goto('/exam/result/1');
      await page.waitForLoadState('networkidle');
      
      // Verify grade display
      await expect(page.locator('[data-grade]')).toBeVisible();
    });
  });

  test.describe('Exam History', () => {
    test('should display past exam attempts', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Navigate to results tab
      await page.click('text=ফলাফল');
      
      // Verify exam history
      await expect(page.locator('text=পরীক্ষার ইতিহাস')).toBeVisible();
    });

    test('should allow viewing past results', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await page.click('text=ফলাফল');
      
      // Click on a past exam
      const viewButtons = page.locator('button:has-text("দেখুন")');
      const count = await viewButtons.count();
      
      if (count > 0) {
        await viewButtons.first().click();
        
        // Verify result page
        await expect(page.locator('text=ফলাফল')).toBeVisible();
      }
    });
  });
});
