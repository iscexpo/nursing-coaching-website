import { Page } from '@playwright/test';
import { CrudPage } from './CrudPage';

export class StudentPage extends CrudPage {
  constructor(page: Page) {
    super(page);
  }

  async createStudent(data: { name: string; email: string; phone: string }) {
    await this.page.click('#add-student-btn');
    await this.fillForm(data);
    await this.submitForm();
  }
}
