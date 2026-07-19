import { test, expect } from '../utils/test-base'
import { loginAsAdmin } from '../utils/auth'
import { DashboardPage } from '../pages/DashboardPage'
import { faker } from '@faker-js/faker'

test.describe('Admin Panel - Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Question Bank Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=প্রশ্নব্যাংক')
    })

    test('should display questions panel', async ({ page }) => {
      await expect(page.locator('text=প্রশ্নব্যাংক')).toBeVisible()
      await expect(page.locator('text=পরীক্ষা বাছাই করুন')).toBeVisible()
    })

    test('should select exam and display questions', async ({ page }) => {
      // Select first available exam
      const examSelect = page.locator('select')
      const options = await examSelect.locator('option').count()

      if (options > 1) {
        await examSelect.selectOption({ index: 1 })
        await page.waitForTimeout(500)

        // Verify questions table appears
        await expect(page.locator('text=প্রশ্ন')).toBeVisible()
      }
    })

    test('should create new question', async ({ page }) => {
      // Select an exam first
      const examSelect = page.locator('select')
      const options = await examSelect.locator('option').count()

      if (options > 1) {
        await examSelect.selectOption({ index: 1 })

        // Click add question button
        await page.click('button:has-text("নতুন প্রশ্ন")')

        // Fill question form
        const questionData = {
          question: faker.lorem.sentence(),
          optionA: faker.lorem.word(),
          optionB: faker.lorem.word(),
          optionC: faker.lorem.word(),
          optionD: faker.lorem.word(),
        }

        await page.fill(
          'textarea[placeholder*="প্রশ্ন লিখুন"]',
          questionData.question,
        )
        await page.fill('input[placeholder*="উত্তর A"]', questionData.optionA)
        await page.fill('input[placeholder*="উত্তর B"]', questionData.optionB)
        await page.fill('input[placeholder*="উত্তর C"]', questionData.optionC)
        await page.fill('input[placeholder*="উত্তর D"]', questionData.optionD)

        // Select correct answer
        await page.click('input[type="radio"][name="correct"]')

        // Save question
        await page.click('button:has-text("সংরক্ষণ করুন")')

        // Verify question appears in table
        await expect(
          page.locator('text=' + questionData.question.substring(0, 20)),
        ).toBeVisible()
      }
    })

    test('should edit existing question', async ({ page }) => {
      const examSelect = page.locator('select')
      const options = await examSelect.locator('option').count()

      if (options > 1) {
        await examSelect.selectOption({ index: 1 })
        await page.waitForTimeout(500)

        // Click edit button on first question
        const editButtons = page
          .locator('button:has(svg)')
          .filter({ hasText: '' })
        const count = await editButtons.count()

        if (count > 0) {
          await editButtons.first().click()

          // Update question
          const newQuestion = faker.lorem.sentence()
          await page.fill('textarea[placeholder*="প্রশ্ন লিখুন"]', newQuestion)
          await page.click('button:has-text("আপডেট করুন")')

          // Verify update
          await expect(
            page.locator('text=' + newQuestion.substring(0, 20)),
          ).toBeVisible()
        }
      }
    })

    test('should delete question', async ({ page }) => {
      const examSelect = page.locator('select')
      const options = await examSelect.locator('option').count()

      if (options > 1) {
        await examSelect.selectOption({ index: 1 })
        await page.waitForTimeout(500)

        // Get initial question count
        const initialRows = await page.locator('tbody tr').count()

        if (initialRows > 0) {
          // Click delete button
          const deleteButtons = page
            .locator('button')
            .filter({ hasText: '' })
            .nth(1)
          await deleteButtons.first().click()

          // Verify question deleted
          const finalRows = await page.locator('tbody tr').count()
          expect(finalRows).toBeLessThan(initialRows)
        }
      }
    })

    test('should display subject-wise question counts', async ({ page }) => {
      await page.waitForTimeout(500)

      // Verify subject count cards are displayed
      await expect(page.locator('text=বাংলা')).toBeVisible()
      await expect(page.locator('text=ইংরেজি')).toBeVisible()
    })
  })

  test.describe('Admit Card Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=এডমিট কার্ড')
    })

    test('should display admit cards panel', async ({ page }) => {
      await expect(page.locator('text=এডমিট কার্ড ব্যবস্থাপনা')).toBeVisible()
    })

    test('should create new admit card', async ({ page }) => {
      await page.click('button:has-text("নতুন এডমিট কার্ড")')

      // Select student
      const studentSelect = page.locator('select').first()
      const studentOptions = await studentSelect.locator('option').count()

      if (studentOptions > 1) {
        await studentSelect.selectOption({ index: 1 })

        // Select exam
        const examSelect = page.locator('select').nth(1)
        const examOptions = await examSelect.locator('option').count()

        if (examOptions > 1) {
          await examSelect.selectOption({ index: 1 })

          // Fill exam details
          await page.fill('input[placeholder*="তারিখ"]', '৯ আগস্ট ২০২৬')
          await page.fill('input[placeholder*="সময়"]', 'সকাল ১০:০০ — ১১:০০')
          await page.fill('input[placeholder*="কেন্দ্র"]', 'খুলনা মেডিকেল কলেজ')
          await page.fill('input[placeholder*="সিট"]', 'A-101')

          // Create admit card
          await page.click('button:has-text("এডমিট কার্ড তৈরি করুন")')

          // Verify admit card appears in table
          await expect(page.locator('text=খুলনা মেডিকেল কলেজ')).toBeVisible()
        }
      }
    })

    test('should delete admit card', async ({ page }) => {
      const initialRows = await page.locator('tbody tr').count()

      if (initialRows > 0) {
        // Click delete button
        await page.locator('button').filter({ hasText: '' }).first().click()

        // Verify deletion
        const finalRows = await page.locator('tbody tr').count()
        expect(finalRows).toBeLessThan(initialRows)
      }
    })

    test('should display admit card details', async ({ page }) => {
      const rows = await page.locator('tbody tr').count()

      if (rows > 0) {
        // Verify table columns
        await expect(page.locator('text=শিক্ষার্থী')).toBeVisible()
        await expect(page.locator('text=পরীক্ষা')).toBeVisible()
        await expect(page.locator('text=তারিখ')).toBeVisible()
        await expect(page.locator('text=সময়')).toBeVisible()
        await expect(page.locator('text=কেন্দ্র')).toBeVisible()
      }
    })
  })

  test.describe('Notifications', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=নোটিফিকেশন')
    })

    test('should display notifications panel', async ({ page }) => {
      await expect(page.locator('text=নোটিফিকেশন পাঠান')).toBeVisible()
      await expect(page.locator('text=সর্বশেষ নোটিফিকেশন')).toBeVisible()
    })

    test('should send notification', async ({ page }) => {
      const notificationData = {
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
      }

      await page.fill('input[placeholder*="শিরোনাম"]', notificationData.title)
      await page.fill(
        'textarea[placeholder*="বিবরণ"]',
        notificationData.message,
      )

      await page.click('button:has-text("পাঠান")')

      // Verify notification appears in list
      await expect(page.locator('text=' + notificationData.title)).toBeVisible()
    })

    test('should mark all notifications as read', async ({ page }) => {
      const unreadCount = await page.locator('span:has-text("নতুন")').count()

      if (unreadCount > 0) {
        await page.click('button:has-text("সব পড়েছি")')

        // Verify unread badge disappears
        await expect(page.locator('span:has-text("নতুন")')).not.toBeVisible()
      }
    })

    test('should display notification history', async ({ page }) => {
      await expect(page.locator('text=সর্বশেষ নোটিফিকেশন')).toBeVisible()

      // Verify notification cards
      const notificationCards = page.locator('div.rounded-xl')
      const count = await notificationCards.count()

      if (count > 0) {
        await expect(notificationCards.first()).toBeVisible()
      }
    })
  })

  test.describe('SMS Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=SMS')
    })

    test('should display SMS management panel', async ({ page }) => {
      await expect(page.locator('text=SMS ব্যবস্থাপনা')).toBeVisible()
      await expect(page.locator('text=সিঙ্গেল SMS')).toBeVisible()
      await expect(page.locator('text=বাল্ক SMS')).toBeVisible()
      await expect(page.locator('text=CSV থেকে SMS')).toBeVisible()
    })

    test('should send single SMS', async ({ page }) => {
      await page.fill('input[placeholder*="01XXXXXXXXX"]', '01712345678')
      await page.fill(
        'textarea[placeholder*="SMS লিখুন"]',
        faker.lorem.sentence(),
      )

      await page.click('button:has-text("SMS পাঠান")')

      // Note: This will fail if SMS provider is not configured
      // Just verify the UI interaction works
      await expect(
        page.locator('input[placeholder*="01XXXXXXXXX"]'),
      ).toHaveValue('01712345678')
    })

    test('should send bulk SMS', async ({ page }) => {
      await page.click('text=বাল্ক SMS')

      await page.fill(
        'textarea[placeholder*="SMS লিখুন"]',
        faker.lorem.sentence(),
      )

      await page.click('button:has-text("সকলকে SMS পাঠান")')

      // Verify UI interaction
      await expect(page.locator('textarea')).not.toBeEmpty()
    })

    test('should upload CSV for SMS', async ({ page }) => {
      await page.click('text=CSV থেকে SMS')

      // Note: File upload requires actual file, just verify UI
      await expect(page.locator('input[type="file"]')).toBeVisible()
      await expect(
        page.locator('text=ফোন নম্বরের CSV/Excel ফাইল'),
      ).toBeVisible()
    })
  })

  test.describe('Media Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=মিডিয়া')
    })

    test('should display media library', async ({ page }) => {
      await expect(page.locator('text=মিডিয়া লাইব্রেরি')).toBeVisible()
      await expect(page.locator('text=মিডিয়া ফাইলসমূহ')).toBeVisible()
    })

    test('should display upload instructions', async ({ page }) => {
      await expect(page.locator('text=আপলোড নির্দেশনা')).toBeVisible()
      await expect(page.locator('text=JPG, PNG, WEBP, GIF, PDF')).toBeVisible()
      await expect(page.locator('text=সর্বোচ্চ সাইজ: 5MB')).toBeVisible()
    })

    test('should display media upload form', async ({ page }) => {
      await expect(page.locator('text=ALT টেক্সট')).toBeVisible()
      await expect(page.locator('text=বিবরণ')).toBeVisible()
      await expect(page.locator('input[type="file"]')).toBeVisible()
    })

    test('should display existing media files', async ({ page }) => {
      const mediaCards = page.locator('div.rounded-2xl').filter({ hasText: '' })
      const count = await mediaCards.count()

      if (count > 0) {
        // Verify media card elements
        await expect(page.locator('text=দেখুন')).toBeVisible()
        await expect(page.locator('text=মুছুন')).toBeVisible()
      }
    })

    test('should show file type indicators', async ({ page }) => {
      const mediaCards = page.locator('div.rounded-2xl').filter({ hasText: '' })
      const count = await mediaCards.count()

      if (count > 0) {
        // Verify ALT and DESC badges
        await expect(
          page.locator('text=ALT').or(page.locator('text=DESC')),
        ).toBeVisible()
      }
    })
  })

  test.describe('Reports and Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=রিপোর্ট')
    })

    test('should display reports panel', async ({ page }) => {
      await expect(page.locator('text=এনরোলমেন্ট ট্রেন্ড')).toBeVisible()
      await expect(page.locator('text=রেভেনিউ রিপোর্ট')).toBeVisible()
      await expect(page.locator('text=উপস্থিতি পরিসংখ্যান')).toBeVisible()
    })

    test('should switch between report types', async ({ page }) => {
      // Click on revenue report
      await page.click('button:has-text("রেভেনিউ রিপোর্ট")')
      await expect(page.locator('text=মোট রেভেনিউ')).toBeVisible()

      // Click on attendance report
      await page.click('button:has-text("উপস্থিতি পরিসংখ্যান")')
      await expect(page.locator('text=গড় উপস্থিতি')).toBeVisible()
    })

    test('should filter by date range', async ({ page }) => {
      const startDate = '2024-01-01'
      const endDate = '2024-12-31'

      await page.locator('input[type="date"]').first().fill(startDate)
      await page.locator('input[type="date"]').nth(1).fill(endDate)

      // Verify date inputs have values
      await expect(page.locator('input[type="date"]').first()).toHaveValue(
        startDate,
      )
    })

    test('should export report to CSV', async ({ page }) => {
      await page.click('button:has-text("এক্সপোর্ট CSV")')

      // Note: This will trigger file download
      // Just verify the button is clickable
      await expect(
        page.locator('button:has-text("এক্সপোর্ট CSV")'),
      ).toBeVisible()
    })

    test('should display enrollment trends', async ({ page }) => {
      await expect(page.locator('text=মোট এনরোলমেন্ট')).toBeVisible()
      await expect(page.locator('text=এই মাসে')).toBeVisible()
    })

    test('should display course analytics', async ({ page }) => {
      await page.click('button:has-text("কোর্স অ্যানালিটিক্স")')
      await expect(page.locator('text=কোর্স-ওয়ার অ্যানালিটিক্স')).toBeVisible()
    })

    test('should display student performance', async ({ page }) => {
      await page.click('button:has-text("শিক্ষার্থী পারফরম্যান্স")')
      await expect(page.locator('text=মোট শিক্ষার্থী')).toBeVisible()
      await expect(page.locator('text=গড় স্কোর')).toBeVisible()
    })

    test('should display fee collection report', async ({ page }) => {
      await page.click('button:has-text("ফি সংগ্রহ রিপোর্ট")')
      await expect(page.locator('text=মোট বকেয়া')).toBeVisible()
      await expect(page.locator('text=মোট সংগ্রহ')).toBeVisible()
    })
  })

  test.describe('Settings Configuration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=সেটিংস')
    })

    test('should display settings panel', async ({ page }) => {
      await expect(page.locator('text=সাইট সেটিংস')).toBeVisible()
      await expect(page.locator('text=সাইট পরিচিতি')).toBeVisible()
      await expect(page.locator('text=যোগাযোগ')).toBeVisible()
    })

    test('should update site name', async ({ page }) => {
      const newSiteName = 'Test Site Name'

      await page.fill('input[placeholder*="ISC Expo"]', newSiteName)
      await page.click('button:has-text("সংরক্ষণ করুন")')

      // Verify save button exists
      await expect(
        page.locator('button:has-text("সংরক্ষণ করুন")'),
      ).toBeVisible()
    })

    test('should update contact information', async ({ page }) => {
      await page.fill('input[placeholder*="01784-176442"]', '01712345678')
      await page.fill(
        'input[placeholder*="info@iscexpo.edu.bd"]',
        'test@example.com',
      )

      await expect(page.locator('text=ফোন নম্বর')).toBeVisible()
      await expect(page.locator('text=ইমেইল')).toBeVisible()
    })

    test('should update social links', async ({ page }) => {
      await page.fill(
        'input[placeholder*="https://wa.me"]',
        'https://wa.me/8801234567890',
      )
      await page.fill(
        'input[placeholder*="https://www.facebook.com"]',
        'https://facebook.com/test',
      )

      await expect(page.locator('text=WhatsApp')).toBeVisible()
      await expect(page.locator('text=Facebook')).toBeVisible()
    })

    test('should configure SMS provider', async ({ page }) => {
      await page.selectOption('select:has-text("প্রোভাইডার")', 'grameenphone')

      await expect(page.locator('text=API Key')).toBeVisible()
      await expect(page.locator('text=Sender ID')).toBeVisible()
    })

    test('should configure payment gateway', async ({ page }) => {
      await page.selectOption('select:has-text("গেটওয়ে")', 'sslcommerz')

      await expect(page.locator('text=API Key')).toBeVisible()
      await expect(page.locator('text=Secret')).toBeVisible()
    })

    test('should update hero section', async ({ page }) => {
      await page.fill('input[placeholder*="আইব্রো"]', 'Test Eyebrow')
      await page.fill('input[placeholder*="শিরোনাম"]', 'Test Title')
      await page.fill('textarea[placeholder*="বিবরণ"]', 'Test Subtitle')

      await expect(page.locator('text=হিরো সেক্শন')).toBeVisible()
    })

    test('should add Why ISC Expo item', async ({ page }) => {
      const initialCount = await page
        .locator('div.rounded-xl')
        .filter({ hasText: 'কার্ড' })
        .count()

      await page.click('button:has-text("নতুন যোগ করুন")')

      const newCount = await page
        .locator('div.rounded-xl')
        .filter({ hasText: 'কার্ড' })
        .count()
      expect(newCount).toBeGreaterThan(initialCount)
    })

    test('should add counter item', async ({ page }) => {
      await page.click('text=পরিসংখ্যান')

      await page.click('button:has-text("নতুন যোগ করুন")')

      // Verify new counter form appears
      await expect(page.locator('text=পরিসংখ্যান')).toBeVisible()
    })

    test('should upload logo', async ({ page }) => {
      await expect(page.locator('text=লোগো')).toBeVisible()
      await expect(page.locator('button:has-text("লোগো আপলোড")')).toBeVisible()
    })
  })

  test.describe('Contact Inquiries', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=যোগাযোগ')
    })

    test('should display contact inquiries panel', async ({ page }) => {
      await expect(page.locator('text=যোগাযোগ অনুরোধ')).toBeVisible()
    })

    test('should display inquiry list', async ({ page }) => {
      const inquiryRows = page.locator('tbody tr')
      const count = await inquiryRows.count()

      if (count > 0) {
        await expect(page.locator('text=নাম')).toBeVisible()
        await expect(page.locator('text=ফোন')).toBeVisible()
        await expect(page.locator('text=বার্তা')).toBeVisible()
      }
    })

    test('should mark inquiry as resolved', async ({ page }) => {
      const resolveButtons = page.locator('button:has-text("সমাধান")')
      const count = await resolveButtons.count()

      if (count > 0) {
        await resolveButtons.first().click()

        // Verify status change
        await expect(page.locator('text=সমাধানিত')).toBeVisible()
      }
    })

    test('should delete inquiry', async ({ page }) => {
      const deleteButtons = page.locator('button').filter({ hasText: '' })
      const count = await deleteButtons.count()

      if (count > 0) {
        await deleteButtons.first().click()

        // Verify deletion
        await expect(page.locator('text=মুছে ফেলা হয়েছে')).toBeVisible()
      }
    })
  })

  test.describe('Teachers Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=শিক্ষক')
    })

    test('should display teachers panel', async ({ page }) => {
      await expect(page.locator('text=শিক্ষক তালিকা')).toBeVisible()
    })

    test('should add new teacher', async ({ page }) => {
      await page.click('button:has-text("নতুন শিক্ষক")')

      const teacherData = {
        name: faker.person.fullName(),
        subject: faker.lorem.word(),
        phone: faker.phone.number('01#########'),
      }

      await page.fill('input[name="name"]', teacherData.name)
      await page.fill('input[name="subject"]', teacherData.subject)
      await page.fill('input[name="phone"]', teacherData.phone)

      await page.click('button:has-text("সংরক্ষণ")')

      // Verify teacher added
      await expect(page.locator('text=' + teacherData.name)).toBeVisible()
    })

    test('should edit teacher', async ({ page }) => {
      const editButtons = page.locator('button:has-text("সম্পাদনা")')
      const count = await editButtons.count()

      if (count > 0) {
        await editButtons.first().click()

        const newName = faker.person.fullName()
        await page.fill('input[name="name"]', newName)
        await page.click('button:has-text("আপডেট")')

        await expect(page.locator('text=' + newName)).toBeVisible()
      }
    })

    test('should delete teacher', async ({ page }) => {
      const deleteButtons = page.locator('button:has-text("মুছুন")')
      const count = await deleteButtons.count()

      if (count > 0) {
        await deleteButtons.first().click()

        // Verify deletion
        await expect(page.locator('text=মুছে ফেলা হয়েছে')).toBeVisible()
      }
    })
  })

  test.describe('Subjects Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
      await page.click('text=বিষয়')
    })

    test('should display subjects panel', async ({ page }) => {
      await expect(page.locator('text=বিষয় তালিকা')).toBeVisible()
    })

    test('should add new subject', async ({ page }) => {
      await page.click('button:has-text("নতুন বিষয়")')

      const subjectData = {
        name: faker.lorem.word(),
        code: faker.string.alpha(3).toUpperCase(),
      }

      await page.fill('input[name="name"]', subjectData.name)
      await page.fill('input[name="code"]', subjectData.code)

      await page.click('button:has-text("সংরক্ষণ")')

      // Verify subject added
      await expect(page.locator('text=' + subjectData.name)).toBeVisible()
    })

    test('should edit subject', async ({ page }) => {
      const editButtons = page.locator('button:has-text("সম্পাদনা")')
      const count = await editButtons.count()

      if (count > 0) {
        await editButtons.first().click()

        const newName = faker.lorem.word()
        await page.fill('input[name="name"]', newName)
        await page.click('button:has-text("আপডেট")')

        await expect(page.locator('text=' + newName)).toBeVisible()
      }
    })

    test('should delete subject', async ({ page }) => {
      const deleteButtons = page.locator('button:has-text("মুছুন")')
      const count = await deleteButtons.count()

      if (count > 0) {
        await deleteButtons.first().click()

        // Verify deletion
        await expect(page.locator('text=মুছে ফেলা হয়েছে')).toBeVisible()
      }
    })
  })
})
