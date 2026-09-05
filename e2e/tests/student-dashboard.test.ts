import { test, expect } from '../utils/test-base'
import { loginAsStudent } from '../utils/auth'
import { DashboardPage } from '../pages/DashboardPage'
import { faker } from '@faker-js/faker'

test.describe('Student Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
  })

  test.describe('Overview Tab', () => {
    test('should display overview statistics', async ({ page }) => {
      const dashboardPage = new DashboardPage(page)
      await dashboardPage.navigateToStudent()
      await dashboardPage.verifyDashboardLoaded()

      // Verify overview tab is active
      await dashboardPage.verifyTabActive('ওভারভিউ')

      // Verify statistics are displayed
      await expect(page.locator('text=মোট কোর্স')).toBeVisible()
      await expect(page.locator('text=মোট পেমেন্ট')).toBeVisible()
    })

    test('should display recent activity', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Verify recent activity section
      await expect(page.locator('text=সাম্প্রতিক কার্যকলাপ')).toBeVisible()
    })
  })

  test.describe('Courses Tab', () => {
    test('should display available courses', async ({ page }) => {
      const dashboardPage = new DashboardPage(page)
      await dashboardPage.navigateToStudent()
      await dashboardPage.verifyDashboardLoaded()

      await dashboardPage.selectTab('আমার কোর্স')

      // Verify courses are displayed
      await expect(page.locator('text=কোর্স ব্রাউজ করুন')).toBeVisible()
    })

    test('should allow course enrollment', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=আমার কোর্স')

      // Click on enroll button for a course
      const enrollButtons = page.locator('button:has-text("ভর্তি হন")')
      const count = await enrollButtons.count()

      if (count > 0) {
        await enrollButtons.first().click()

        // Verify enrollment initiated
        await expect(page.locator('text=পেমেন্ট')).toBeVisible()
      }
    })

    test('should display enrolled courses', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=আমার কোর্স')

      // Switch to enrolled courses view
      await page.click('text=এনরোলড কোর্স')

      // Verify enrolled courses section
      await expect(page.locator('text=এনরোলড কোর্স')).toBeVisible()
    })
  })

  test.describe('Billing Tab', () => {
    test('should display payment history', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=বিলিং ও পেমেন্ট')

      // Verify payment history section
      await expect(page.locator('text=পেমেন্ট ইতিহাস')).toBeVisible()
    })

    test('should display invoices', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=বিলিং ও পেমেন্ট')

      // Switch to invoices tab
      await page.click('text=ইনভয়েস')

      // Verify invoices section
      await expect(page.locator('text=ইনভয়েস')).toBeVisible()
    })

    test('should allow payment initiation', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=বিলিং ও পেমেন্ট')

      // Click on pay button
      const payButtons = page.locator('button:has-text("পেমেন্ট করুন")')
      const count = await payButtons.count()

      if (count > 0) {
        await payButtons.first().click()

        // Verify payment modal opens
        await expect(page.locator('text=পেমেন্ট পদ্ধতি')).toBeVisible()
      }
    })
  })

  test.describe('Account Tab', () => {
    test('should display profile information', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=অ্যাকাউন্ট')

      // Verify profile form
      await expect(page.locator('text=প্রোফাইল সম্পাদনা')).toBeVisible()
    })

    test('should allow profile update', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=অ্যাকাউন্ট')

      // Update name
      const newName = faker.person.fullName()
      await page.fill('input[name="name"]', newName)
      await page.click('button:has-text("আপডেট করুন")')

      // Verify success message
      await expect(page.locator('text=আপডেট সফল')).toBeVisible()
    })

    test('should allow password change', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=অ্যাকাউন্ট')

      // Switch to password change section
      await page.click('text=পাসওয়ার্ড পরিবর্তন')

      // Fill password form
      await page.fill('input[name="currentPassword"]', 'Test123!@#')
      await page.fill('input[name="newPassword"]', 'NewTest123!@#')
      await page.fill('input[name="confirmPassword"]', 'NewTest123!@#')
      await page.click('button:has-text("পাসওয়ার্ড পরিবর্তন")')

      // Verify success message
      await expect(page.locator('text=পাসওয়ার্ড পরিবর্তন সফল')).toBeVisible()
    })
  })

  test.describe('Admit Card Tab', () => {
    test('should display admit cards', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=এডমিট কার্ড')

      // Verify admit cards section
      await expect(page.locator('text=এডমিট কার্ড')).toBeVisible()
    })

    test('should allow admit card download', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=এডমিট কার্ড')

      // Click download button
      const downloadButtons = page.locator('button:has-text("ডাউনলোড")')
      const count = await downloadButtons.count()

      if (count > 0) {
        // Start download
        const downloadPromise = page.waitForEvent('download')
        await downloadButtons.first().click()
        const download = await downloadPromise

        // Verify download started
        expect(download.suggestedFilename()).toBeTruthy()
      }
    })
  })

  test.describe('Results Tab', () => {
    test('should display exam results', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=ফলাফল')

      // Verify results table
      await expect(page.locator('text=পরীক্ষার ফলাফল')).toBeVisible()
    })

    test('should display performance metrics', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=ফলাফল')

      // Verify score display
      await expect(page.locator('text=স্কোর')).toBeVisible()
    })
  })

  test.describe('Attendance Tab', () => {
    test('should display attendance records', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=উপস্থিতি')

      // Verify attendance section
      await expect(page.locator('text=উপস্থিতি রেকর্ড')).toBeVisible()
    })

    test('should display attendance statistics', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await page.click('text=উপস্থিতি')

      // Verify statistics
      await expect(page.locator('text=উপস্থিত')).toBeVisible()
      await expect(page.locator('text=অনুপস্থিত')).toBeVisible()
    })
  })
})
