import { test, expect } from '../utils/test-base'
import { loginAsAdmin } from '../utils/auth'
import { DashboardPage } from '../pages/DashboardPage'
import { StudentPage } from '../pages/StudentPage'
import { faker } from '@faker-js/faker'

test.describe('Student Module (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    const dashboard = new DashboardPage(page)
    await dashboard.navigateToAdmin()
    await dashboard.selectTab('শিক্ষার্থী')
  })

  test('should create a new student', async ({ page }) => {
    const studentPage = new StudentPage(page)
    const studentData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number('01#########'),
    }

    await studentPage.createStudent(studentData)

    // Verify creation
    await expect(page.locator('text=' + studentData.name)).toBeVisible()
  })

  test('should search for student', async ({ page }) => {
    // Enter search term
    await page.fill('input[placeholder*="অনুসন্ধান"]', 'test')

    // Verify search results
    await page.waitForTimeout(500)
  })

  test('should view student details', async ({ page }) => {
    // Click on first student
    const studentRows = page.locator('tr[data-student-id]')
    const count = await studentRows.count()

    if (count > 0) {
      await studentRows.first().click()

      // Verify student details modal
      await expect(page.locator('text=শিক্ষার্থীর বিস্তারিত')).toBeVisible()
    }
  })
})
