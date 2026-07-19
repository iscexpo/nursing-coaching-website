import { test as base, expect, type PlaywrightTestArgs } from '@playwright/test'

type MyFixtures = {
  page: PlaywrightTestArgs['page']
}

export const test = base.extend<MyFixtures>({
  page: async ({ page }, use) => {
    // Monitor console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console Error: "${msg.text()}"`)
      }
    })

    // Monitor failed network requests
    page.on('requestfailed', (request) => {
      console.error(
        `Request Failed: ${request.url()} - ${request.failure()?.errorText}`,
      )
    })

    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.error(
          `Network Error: ${response.url()} - Status: ${response.status()}`,
        )
      }
    })

    await use(page)
  },
})

export { expect }
