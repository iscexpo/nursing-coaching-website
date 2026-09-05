import { test, expect } from '../utils/test-base'
import { HomePage } from '../pages/HomePage'
import { CoursesPage } from '../pages/CoursesPage'
import { AdmissionPage } from '../pages/AdmissionPage'
import { ContactPage } from '../pages/ContactPage'
import { faker } from '@faker-js/faker'

test.describe('Public Pages', () => {
  test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.navigateTo()
      await homePage.waitForLoading()

      await homePage.verifyHeroSection()
      await homePage.verifyFooterVisible()
      await homePage.verifyWhatsAppButton()
    })

    test('should navigate to courses from homepage', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.navigateTo()
      await homePage.waitForLoading()

      await homePage.clickCoursesLink()
      await expect(page).toHaveURL(/.*courses/)
    })

    test('should navigate to admission from homepage', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.navigateTo()
      await homePage.waitForLoading()

      await homePage.clickAdmissionLink()
      await expect(page).toHaveURL(/.*admission/)
    })

    test('should navigate to contact from homepage', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.navigateTo()
      await homePage.waitForLoading()

      await homePage.clickContactLink()
      await expect(page).toHaveURL(/.*contact/)
    })
  })

  test.describe('Courses Page', () => {
    test('should display courses list', async ({ page }) => {
      const coursesPage = new CoursesPage(page)
      await coursesPage.navigateTo()
      await coursesPage.waitForLoading()

      await coursesPage.verifyPageTitle()
      await coursesPage.verifyCourseCardsVisible()
    })

    test('should navigate to course details', async ({ page }) => {
      const coursesPage = new CoursesPage(page)
      await coursesPage.navigateTo()
      await coursesPage.waitForLoading()

      // This test assumes there's at least one course
      const courseLinks = page.locator('a[href*="/courses/"]')
      const count = await courseLinks.count()

      if (count > 0) {
        await coursesPage.clickCourseByTitle('') // Click first course
        await coursesPage.verifyCourseDetails()
      }
    })
  })

  test.describe('Admission Page', () => {
    test('should load admission form', async ({ page }) => {
      const admissionPage = new AdmissionPage(page)
      await admissionPage.navigateTo()
      await admissionPage.waitForLoading()

      await admissionPage.verifyPageTitle()
    })

    test('should complete admission form flow', async ({ page }) => {
      const admissionPage = new AdmissionPage(page)
      await admissionPage.navigateTo()
      await admissionPage.waitForLoading()

      // Step 1: Personal Info
      const formData = {
        name: faker.person.fullName(),
        phone: faker.phone.number('01#########'),
      }

      await admissionPage.fillName(formData.name)
      await admissionPage.fillPhone(formData.phone)
      await admissionPage.clickNext()

      // Step 2: Education (skip for now - optional)
      await admissionPage.clickNext()

      // Step 3: Course Selection
      // This assumes there's at least one active course
      const courseSelect = page.locator('#course')
      const options = await courseSelect.locator('option').count()

      if (options > 1) {
        await admissionPage.selectCourse('') // Select first available course
        await admissionPage.clickNext()

        // Step 4: Review & Submit
        await admissionPage.fillMessage(faker.lorem.sentence())
        await admissionPage.submitForm()

        // Verify success
        await admissionPage.verifySuccessMessage()
      }
    })
  })

  test.describe('Contact Page', () => {
    test('should load contact page', async ({ page }) => {
      const contactPage = new ContactPage(page)
      await contactPage.navigateTo()
      await contactPage.waitForLoading()

      await contactPage.verifyPageTitle()
      await contactPage.verifyContactInfo()
    })

    test('should submit contact form', async ({ page }) => {
      const contactPage = new ContactPage(page)
      await contactPage.navigateTo()
      await contactPage.waitForLoading()

      const formData = {
        name: faker.person.fullName(),
        phone: faker.phone.number('01#########'),
        message: faker.lorem.paragraph(),
      }

      await contactPage.fillName(formData.name)
      await contactPage.fillPhone(formData.phone)
      await contactPage.fillMessage(formData.message)
      await contactPage.submitForm()

      await contactPage.verifySuccessMessage()
    })
  })
})
