import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility & Security', () => {
  test('should pass accessibility audit', async ({ page }) => {
    await page.goto('/admin')
    await injectAxe(page)
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  })

  test('should restrict unauthorized access to admin dashboard', async ({
    page,
  }) => {
    // Attempt to access admin without login
    await page.goto('/admin')
    await expect(page).toHaveURL(/.*sign-in/)
  })
})
