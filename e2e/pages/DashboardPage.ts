import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await this.navigate('/admin');
  }

  async selectTab(tabName: string) {
    await this.page.click(`[data-tab="${tabName}"]`); // Need to check actual selector
  }
}
