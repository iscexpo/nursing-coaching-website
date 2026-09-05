import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class CoursesPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigateTo() {
    await this.navigate('/courses')
  }

  async verifyPageTitle() {
    await expect(this.page.locator('text=সকল কোর্স সমূহ')).toBeVisible()
  }

  async verifyCourseCardsVisible() {
    await expect(this.page.locator('a[href*="/courses/"]')).toBeVisible()
  }

  async clickCourseByTitle(title: string) {
    await this.page.click(`a:has-text("${title}")`)
  }

  async verifyCourseDetails() {
    await expect(this.page.locator('text=ভর্তি হোন')).toBeVisible()
  }
}
