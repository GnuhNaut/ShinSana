import { expect, test, type Page } from '@playwright/test'

const screenshotRoot = 'artifacts/screenshots/after'
const screenshotStyle = '.skip-link,.floating-controls,.scroll-progress{display:none!important}'

const requiredViewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]

async function waitForImages(page: Page) {
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((node) => {
      const element = node as HTMLImageElement
      return element.complete && element.naturalWidth > 0
    })).toBe(true)
  }
}

test('captures the final before-and-after viewport matrix', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic Chromium screenshot set is sufficient.')

  for (const viewport of requiredViewports) {
    await page.setViewportSize(viewport)
    await page.goto('/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A')
    await expect(page.locator('.cover')).toBeVisible()
    await expect(page.locator('.cover__media img')).toHaveJSProperty('complete', true)
    await page.screenshot({
      animations: 'disabled',
      path: `${screenshotRoot}/after-${viewport.width}x${viewport.height}-cover.png`,
      style: screenshotStyle,
    })

    await page.getByRole('button', { name: 'Mở lời mời', exact: true }).click()
    await expect(page.locator('.cover')).toBeHidden()
    await expect(page.locator('.invite')).toBeVisible()
    await expect(page.locator('.closing')).toBeVisible()
    await waitForImages(page)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({
      animations: 'disabled',
      fullPage: true,
      path: `${screenshotRoot}/after-${viewport.width}x${viewport.height}-full.png`,
      style: screenshotStyle,
    })
  }
})
