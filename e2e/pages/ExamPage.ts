import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ExamPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigateTo() {
    await this.navigate('/exam')
  }

  async navigateToExam(examId: string) {
    await this.navigate(`/exam/${examId}`)
  }

  async verifyExamList() {
    await expect(this.page.locator('text=পরীক্ষা')).toBeVisible()
  }

  async startExam() {
    await this.clickButton('শুরু করুন')
  }

  async selectAnswer(questionIndex: number, answerIndex: number) {
    await this.page.click(
      `[data-question="${questionIndex}"] [data-answer="${answerIndex}"]`,
    )
  }

  async nextQuestion() {
    await this.clickButton('পরবর্তী')
  }

  async previousQuestion() {
    await this.clickButton('আগে')
  }

  async submitExam() {
    await this.clickButton('জমা দিন')
  }

  async verifyTimerVisible() {
    await expect(this.page.locator('[data-timer]')).toBeVisible()
  }

  async verifyResultPage() {
    await expect(this.page.locator('text=ফলাফল')).toBeVisible()
  }

  async verifyScore() {
    await expect(this.page.locator('[data-score]')).toBeVisible()
  }
}
