import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CrudPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillForm(data: Record<string, any>) {
    for (const [key, value] of Object.entries(data)) {
      await this.page.fill(`[name="${key}"]`, String(value));
    }
  }

  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  async deleteRecord(id: string) {
    await this.page.click(`[data-id="${id}"] .delete-btn`);
    await this.page.click('.confirm-delete-btn');
  }

  async clickAddButton() {
    await this.page.click('button:has-text("Add")');
  }

  async clickEditButton(id: string) {
    await this.page.click(`[data-id="${id}"] .edit-btn`);
  }

  async verifyRecordExists(text: string) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible();
  }

  async verifyRecordNotExists(text: string) {
    await expect(this.page.locator(`text=${text}`)).not.toBeVisible();
  }
}
