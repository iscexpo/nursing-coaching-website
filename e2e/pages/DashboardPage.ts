import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToAdmin() {
    await this.navigate('/admin');
  }

  async navigateToStudent() {
    await this.navigate('/dashboard');
  }

  async selectTab(tabLabel: string) {
    await this.page.click(`button:has-text("${tabLabel}")`);
  }

  async verifyTabActive(tabLabel: string) {
    await expect(this.page.locator(`button:has-text("${tabLabel}")`)).toHaveClass(/active/);
  }

  async verifyDashboardLoaded() {
    await this.waitForLoading();
    await expect(this.page.locator('text=ওভারভিউ')).toBeVisible();
  }

  async signOut() {
    await this.page.click('button:has-text("Sign Out")');
  }
}
