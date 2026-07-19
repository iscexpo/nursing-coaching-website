import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ContactPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigateTo() {
    await this.navigate('/contact')
  }

  async verifyPageTitle() {
    await expect(this.page.locator('text=যোগাযোগ')).toBeVisible()
  }

  async fillName(name: string) {
    await this.fillInputById('c-name', name)
  }

  async fillPhone(phone: string) {
    await this.fillInputById('c-phone', phone)
  }

  async fillMessage(message: string) {
    await this.fillInputById('c-msg', message)
  }

  async submitForm() {
    await this.clickButton('বার্তা পাঠান')
  }

  async verifySuccessMessage() {
    await expect(this.page.locator('text=বার্তা পাঠানো হয়েছে')).toBeVisible()
  }

  async verifyContactInfo() {
    await expect(this.page.locator('text=অফিস সময়')).toBeVisible()
  }
}
