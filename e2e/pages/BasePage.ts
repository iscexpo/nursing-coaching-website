import { Page, expect } from '@playwright/test'

export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async navigate(url: string) {
    await this.page.goto(url)
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `playwright-report/screenshots/${name}.png`,
    })
  }

  async waitForLoading() {
    await this.page.waitForLoadState('networkidle')
  }

  async clickButton(text: string) {
    await this.page.click(`button:has-text("${text}")`)
  }

  async fillInput(label: string, value: string) {
    await this.page.fill(`input:has-text("${label}")`, value)
  }

  async fillInputById(id: string, value: string) {
    await this.page.fill(`#${id}`, value)
  }

  async selectOption(selectId: string, value: string) {
    await this.page.selectOption(`#${selectId}`, value)
  }

  async verifyTextVisible(text: string) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible()
  }

  async verifyUrlContains(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path))
  }
}
