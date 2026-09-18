import { expect, test, type Page } from '@playwright/test'

const screenshotStyle = '.skip-link,.floating-controls,.scroll-progress{display:none!important}'

const fullPageViewports = [
  { width: 360, height: 800, fileName: 'final-polish-360.png' },
  { width: 375, height: 812, fileName: 'final-polish-375.png' },
  { width: 390, height: 844, fileName: 'demo-mobile-390.png' },
  { width: 412, height: 915, fileName: 'final-polish-412.png' },
  { width: 430, height: 932, fileName: 'demo-mobile-430.png' },
  { width: 768, height: 1024, fileName: 'demo-tablet-768.png' },
  { width: 1440, height: 900, fileName: 'demo-desktop-1440.png' },
]

async function openDemoInvitation(page: Page) {
  await page.goto('/?demo=1')
  await expect(page.getByText('DEMO PREVIEW', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Mở lời mời', exact: true }).click()
  await expect(page.locator('.cover')).toBeHidden()
  await expect(page.locator('.event-card')).toHaveCount(3)
}

async function settleFullPage(page: Page) {
  for (const section of await page.locator('main > section').all()) {
    await section.scrollIntoViewIfNeeded()
  }

  for (const image of await page.locator('main img').all()) {
    if (!await image.evaluate((node) => getComputedStyle(node).display !== 'none')) continue
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((node) => {
      const element = node as HTMLImageElement
      return element.complete && element.naturalWidth > 0
    })).toBe(true)
  }

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
}

test('captures the populated demo preview at the requested viewports', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic Chromium capture set is sufficient.')

  for (const viewport of fullPageViewports) {
    await page.setViewportSize(viewport)
    await openDemoInvitation(page)
    await settleFullPage(page)

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)

    await page.screenshot({
      animations: 'disabled',
      fullPage: true,
      path: `artifacts/screenshots/${viewport.fileName}`,
      style: screenshotStyle,
    })
  }
})

test('captures the demo Gift experience on mobile and desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic Chromium capture set is sufficient.')

  const captures = [
    { width: 430, height: 932, fileName: 'demo-gift-modal-mobile.png' },
    { width: 1440, height: 900, fileName: 'demo-gift-modal-desktop.png' },
  ]

  for (const viewport of captures) {
    await page.setViewportSize(viewport)
    await openDemoInvitation(page)

    const giftSection = page.locator('.gift-section')
    await giftSection.scrollIntoViewIfNeeded()
    await page.screenshot({ animations: 'disabled', path: `artifacts/screenshots/demo-gift-section-${viewport.width}.png`, style: screenshotStyle })

    await page.getByRole('button', { name: 'Gửi mừng cưới', exact: true }).click()

    const dialog = page.getByRole('dialog', { name: /mừng cưới/i })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('tab', { name: 'Nhà Trai', exact: true })).toBeVisible()
    await expect(dialog.getByRole('tab', { name: 'Nhà Gái', exact: true })).toBeVisible()
    const qr = dialog.getByRole('img', { name: /Mã QR mừng cưới Nhà Trai/i })
    await expect.poll(() => qr.evaluate((node) => {
      const image = node as HTMLImageElement
      return image.complete && image.naturalWidth > 0
    })).toBe(true)

    await page.screenshot({
      animations: 'disabled',
      path: `artifacts/screenshots/${viewport.fileName}`,
      style: screenshotStyle,
    })
  }
})

test('captures the lazy map modal on mobile and desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic Chromium capture set is sufficient.')
  for (const viewport of [
    { width: 430, height: 932, fileName: 'demo-map-modal-mobile.png' },
    { width: 1440, height: 900, fileName: 'demo-map-modal-desktop.png' },
  ]) {
    await page.setViewportSize(viewport)
    await openDemoInvitation(page)
    await page.getByRole('button', { name: 'Chỉ đường', exact: true }).first().click()
    const dialog = page.getByRole('dialog', { name: /bản đồ/i })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('iframe')).toHaveAttribute('loading', 'lazy')
    await page.screenshot({ animations: 'disabled', path: `artifacts/screenshots/${viewport.fileName}`, style: screenshotStyle })
  }
})
