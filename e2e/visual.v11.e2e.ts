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

test('captures the V1.1 Vietnamese Oriental visual review set', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic Chromium screenshot set is sufficient.')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/?guest=Nguyen%20Van%20An')
  await expect(page.locator('.opening')).toBeVisible()
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v11-390x844-opening.png` })

  await page.getByRole('button', { name: 'MỞ THIỆP' }).click()
  await page.waitForTimeout(180)
  await page.screenshot({ animations: 'allow', path: `${screenshotRoot}/v11-390x844-opening-mid-transition.png` })
  await expect(page.locator('.opening')).toBeHidden()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.hero h1')).toBeFocused()

  await page.locator('.hero').scrollIntoViewIfNeeded()
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v11-390x844-hero.png` })
  await captureSection(page, '#invitation', 'v11-390x844-invitation-personalized.png')
  await captureSection(page, '.couple', 'v11-390x844-couple.png')
  await captureSection(page, '.story', 'v11-390x844-story.png')
  await captureSection(page, '.gallery', 'v11-390x844-gallery.png')
  await captureSection(page, '.date-suite__save-shell', 'v11-390x844-save-date.png')
  await captureSection(page, '.details', 'v11-390x844-wedding-info.png')
  await captureSection(page, '.rsvp', 'v11-390x844-rsvp.png')

  const giftButton = page.getByRole('button', { name: 'Gửi quà mừng' })
  await giftButton.scrollIntoViewIfNeeded()
  await giftButton.click()
  await expect(page.getByRole('dialog', { name: 'quà mừng' })).toBeVisible()
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v11-390x844-gift-modal.png` })
  await page.getByRole('dialog', { name: 'quà mừng' }).getByRole('button', { name: 'Đóng quà mừng' }).click()

  await captureSection(page, '.final', 'v11-390x844-final.png')
  await warmLazyImages(page)
  await page.screenshot({ animations: 'disabled', fullPage: true, path: `${screenshotRoot}/v11-390x844-full.png`, style: screenshotStyle })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v11-1440x900-opening.png` })
  await page.getByRole('button', { name: 'MỞ THIỆP' }).click()
  await expect(page.locator('.opening')).toBeHidden()
  await page.locator('.hero').scrollIntoViewIfNeeded()
  await page.screenshot({ animations: 'disabled', path: `${screenshotRoot}/v11-1440x900-hero.png` })
  await captureSection(page, '.gallery', 'v11-1440x900-gallery.png')
  await captureSection(page, '.details', 'v11-1440x900-wedding-info.png')
  await warmLazyImages(page)
  await page.screenshot({ animations: 'disabled', fullPage: true, path: `${screenshotRoot}/v11-1440x900-full.png`, style: screenshotStyle })
})
