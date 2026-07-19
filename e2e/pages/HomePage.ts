import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await this.navigate('/');
  }

  async verifyHeroSection() {
    await expect(this.page.locator('text=ISC Expo')).toBeVisible();
  }

  async clickCoursesLink() {
    await this.page.click('a:has-text("কোর্স")');
  }

  async clickAdmissionLink() {
    await this.page.click('a:has-text("ভর্তি")');
  }

  async clickContactLink() {
    await this.page.click('a:has-text("যোগাযোগ")');
  }

  async verifyFooterVisible() {
    await expect(this.page.locator('footer')).toBeVisible();
  }

  async verifyWhatsAppButton() {
    await expect(this.page.locator('a[href*="whatsapp"]')).toBeVisible();
  }
}
