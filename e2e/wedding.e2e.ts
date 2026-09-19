import { expect, test, type Page } from '@playwright/test'

async function openInvitation(pageUrl: string, page: Page) {
  await page.goto(pageUrl)
  await page.getByRole('button', { name: 'Mở lời mời' }).click()
  await expect(page.getByRole('main', { name: 'Nội dung thiệp cưới' })).toBeVisible()
  await expect(page.locator('.cover')).toHaveCount(0)
}

test('guest personalization filters locations but keeps both envelopes', async ({ page }) => {
  await openInvitation('/?guest=Nguyen%20Van%20A&side=groom', page)

  await expect(page.getByText('Nguyen Van A').first()).toBeVisible()
  const locations = page.locator('#locations')
  await expect(locations.getByRole('heading', { name: 'Nhà Trai' })).toBeVisible()
  await expect(locations.getByRole('heading', { name: 'Nhà Gái' })).toHaveCount(0)
  await expect(page.locator('#gifts').getByRole('button', { name: /Nhà Trai/ })).toBeVisible()
  await expect(page.locator('#gifts').getByRole('button', { name: /Nhà Gái/ })).toBeVisible()
})

test('bride and invalid-side routes have a graceful result', async ({ page }) => {
  await openInvitation('/?guest=Tran%20Thi%20B&side=bride', page)
  await expect(page.locator('#locations').getByRole('heading', { name: 'Nhà Gái' })).toBeVisible()
  await expect(page.locator('#locations').getByRole('heading', { name: 'Nhà Trai' })).toHaveCount(0)

  await openInvitation('/?guest=Gia%20dinh%20Anh%20Chi&side=not-a-side', page)
  await expect(page.locator('#locations').getByRole('heading', { name: 'Nhà Trai' })).toBeVisible()
  await expect(page.locator('#locations').getByRole('heading', { name: 'Nhà Gái' })).toBeVisible()
})

test('specified mobile and desktop viewports keep the full gallery inside the viewport', async ({ page }) => {
  const viewports = [
    { width: 320, height: 568 },
    { width: 360, height: 640 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openInvitation('/', page)
    await expect(page.locator('.coverflow__slide')).toHaveCount(7)
    await expect(page.getByText('Ảnh 1 trên 24')).toBeVisible()
    await page.locator('.coverflow__stage').scrollIntoViewIfNeeded()
    await expect(page.locator('.coverflow__slide img')).toHaveCount(5)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.getByText('Chức năng xác nhận trực tuyến sẽ sớm được mở.')).toBeVisible()
  }
})

test('coverflow supports keyboard and horizontal pointer navigation without stealing vertical movement', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openInvitation('/', page)
  const gallery = page.getByRole('region', { name: /Bộ ảnh cưới/i })
  await gallery.scrollIntoViewIfNeeded()
  const scrollStart = await page.evaluate(() => window.scrollY)
  const initialBox = await gallery.boundingBox()
  expect(initialBox).not.toBeNull()
  if (!initialBox) return

  if (testInfo.project.name !== 'webkit-mobile') {
    await page.mouse.move(initialBox.x + initialBox.width * .5, initialBox.y + initialBox.height * .5)
    await page.mouse.wheel(0, 360)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollStart)
    await gallery.scrollIntoViewIfNeeded()
  }
  await gallery.focus()
  const galleryCounter = page.locator('.coverflow__caption [aria-live="polite"]')
  await page.keyboard.press('ArrowRight')
  await expect(galleryCounter).toHaveText('Ảnh 2 trên 24')

  const box = await gallery.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .5)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * .28, box.y + box.height * .52, { steps: 3 })
  await page.mouse.up()
  await expect(galleryCounter).toHaveText('Ảnh 3 trên 24')

  const activeBox = await gallery.boundingBox()
  expect(activeBox).not.toBeNull()
  if (!activeBox) return

  await page.mouse.move(activeBox.x + activeBox.width * .5, activeBox.y + activeBox.height * .38)
  await page.mouse.down()
  await page.mouse.move(activeBox.x + activeBox.width * .53, activeBox.y + activeBox.height * .78, { steps: 3 })
  await page.mouse.up()
  await expect(galleryCounter).toHaveText('Ảnh 3 trên 24')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  const currentBox = await gallery.boundingBox()
  expect(currentBox).not.toBeNull()
  if (!currentBox) return

  await page.mouse.move(currentBox.x + currentBox.width * .68, currentBox.y + currentBox.height * .48)
  await page.mouse.down()
  await page.mouse.move(currentBox.x + currentBox.width * .26, currentBox.y + currentBox.height * .49, { steps: 3 })
  const viewportHeight = page.viewportSize()?.height ?? 0
  const releaseY = currentBox.y + currentBox.height + 12 < viewportHeight - 2
    ? currentBox.y + currentBox.height + 12
    : Math.max(2, currentBox.y - 12)
  await page.mouse.move(currentBox.x + currentBox.width * .26, releaseY)
  await page.mouse.up()
  await expect(galleryCounter).toHaveText('Ảnh 4 trên 24')
  await page.waitForTimeout(320)
  await page.getByRole('button', { name: /Mở ảnh 4:/ }).click()
  await expect(page.getByRole('dialog', { name: 'thư viện ảnh' })).toBeVisible()
  await page.waitForTimeout(450)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('gift QR stays square and its active envelope yields fixed controls on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openInvitation('/', page)
  const gifts = page.locator('#gifts')
  await gifts.scrollIntoViewIfNeeded()
  await page.locator('.gift-envelope__activate').first().click()
  await expect(page.locator('.gift-envelope.is-active')).toHaveCount(1)
  await expect(page.locator('.floating-controls')).toHaveClass(/is-yielding/)

  const metrics = await page.evaluate(() => {
    const qr = document.querySelector('.gift-envelope.is-active .gift-envelope__qr')?.getBoundingClientRect()
    const active = document.querySelector<HTMLElement>('.gift-envelope.is-active')
    return {
      qrWidth: qr?.width ?? 0,
      qrHeight: qr?.height ?? 0,
      activeTransform: active ? getComputedStyle(active).transform : '',
    }
  })

  expect(Math.abs(metrics.qrWidth - metrics.qrHeight)).toBeLessThanOrEqual(1)
  expect(metrics.activeTransform).not.toContain('matrix3d')
})
