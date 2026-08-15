import { expect, test, type Page } from '@playwright/test'

const screenshotRoot = 'artifacts/screenshots'
const screenshotStyle = '.skip-link,.floating-controls,.scroll-progress{display:none!important}'

async function captureSection(page: Page, selector: string, fileName: string) {
  const section = page.locator(selector)
  await section.scrollIntoViewIfNeeded()
  await expect(section).toBeVisible()
  for (const image of await section.locator('img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((node) => {
      const element = node as HTMLImageElement
      return element.complete && element.naturalWidth > 0
    })).toBe(true)
  }
  await section.scrollIntoViewIfNeeded()
  await section.screenshot({ animations: 'disabled', path: `${screenshotRoot}/${fileName}`, style: screenshotStyle })
}

async function warmLazyImages(page: Page) {
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((node) => {
      const element = node as HTMLImageElement
      return element.complete && element.naturalWidth > 0
    })).toBe(true)
  }
}

test('captures the V2.1 soft-pink visual review set', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic Chromium screenshot set is sufficient.')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?guest=Nguyen%20Van%20An')
  await expect(page.locator('.cover')).toBeVisible()
  await page.waitForTimeout(1200)
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v2-390x844-cover.png` })

  await page.getByRole('button', { name: /Mở thiệp/i }).click()
  await page.waitForTimeout(900)
  await page.screenshot({ animations: 'allow', path: `${screenshotRoot}/v2-390x844-cover-mid-transition.png` })
  await expect(page.locator('.cover')).toBeHidden()

  await captureSection(page, '.invite', 'v2-390x844-invitation-personalized.png')
  await captureSection(page, '#ceremony', 'v2-390x844-ceremony.png')
  await captureSection(page, '.album', 'v2-390x844-photo-story.png')
  await captureSection(page, '.rsvp', 'v2-390x844-rsvp.png')

  const giftButton = page.getByRole('button', { name: /Gửi quà mừng/i })
  await giftButton.scrollIntoViewIfNeeded()
  await giftButton.click()
  await expect(page.getByRole('dialog', { name: 'gửi quà mừng' })).toBeVisible()
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v2-390x844-gift-modal.png` })
  await page.getByRole('dialog', { name: 'gửi quà mừng' }).getByRole('button', { name: 'Đóng gửi quà mừng' }).click()

  await captureSection(page, '.closing', 'v2-390x844-finale.png')
  await warmLazyImages(page)
  await page.screenshot({ animations: 'disabled', fullPage: true, path: `${screenshotRoot}/v2-390x844-full.png`, style: screenshotStyle })

  await page.setViewportSize({ width: 430, height: 932 })
  await page.goto('/?guest=Nguyen%20Van%20An')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: /Mở thiệp/i }).click()
  await expect(page.locator('.cover')).toBeHidden()
  await captureSection(page, '.invite', 'v2-430x932-invitation.png')
  await warmLazyImages(page)
  await page.screenshot({ animations: 'disabled', fullPage: true, path: `${screenshotRoot}/v2-430x932-full.png`, style: screenshotStyle })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v2-1440x900-cover.png` })
  await page.getByRole('button', { name: /Mở thiệp/i }).click()
  await expect(page.locator('.cover')).toBeHidden()
  await captureSection(page, '.invite', 'v2-1440x900-invitation.png')
  await captureSection(page, '#ceremony', 'v2-1440x900-ceremony.png')
  await captureSection(page, '.album', 'v2-1440x900-photo-story.png')
  await warmLazyImages(page)
  await page.screenshot({ animations: 'disabled', fullPage: true, path: `${screenshotRoot}/v2-1440x900-full.png`, style: screenshotStyle })
})
