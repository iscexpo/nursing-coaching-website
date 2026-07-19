import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdmissionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await this.navigate('/admission');
  }

  async verifyPageTitle() {
    await expect(this.page.locator('text=ভর্তি ফরম')).toBeVisible();
  }

  async fillName(name: string) {
    await this.fillInputById('name', name);
  }

  async fillPhone(phone: string) {
    await this.fillInputById('phone', phone);
  }

  async selectCourse(courseSlug: string) {
    await this.selectOption('course', courseSlug);
  }

  async clickNext() {
    await this.clickButton('পরবর্তী');
  }

  async clickPrevious() {
    await this.clickButton('আগে');
  }

  async submitForm() {
    await this.clickButton('জমা দিন');
  }

  async verifySuccessMessage() {
    await expect(this.page.locator('text=আবেদন সফল হয়েছে')).toBeVisible();
  }

  async fillSSCData(data: { result: string; institution: string; year: string; roll: string; registrationNo: string; board: string }) {
    await this.fillInputById('ssc-result', data.result);
    await this.fillInputById('ssc-institution', data.institution);
    await this.selectOption('ssc-year', data.year);
    await this.fillInputById('ssc-roll', data.roll);
    await this.fillInputById('ssc-reg', data.registrationNo);
    await this.selectOption('ssc-board', data.board);
  }

  async fillMessage(message: string) {
    await this.fillInputById('message', message);
  }
}
