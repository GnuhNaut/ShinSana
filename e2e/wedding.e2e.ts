import { expect, test, type Page } from '@playwright/test'

async function openInvitation(pageUrl: string, page: Page) {
  await page.goto(pageUrl)
  await page.getByRole('button', { name: 'Mở lời mời' }).click()
  await expect(page.getByRole('main', { name: 'Nội dung thiệp cưới' })).toBeVisible()
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
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openInvitation('/', page)
    await expect(page.locator('.album-grid__item')).toHaveCount(24)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.getByText('Chức năng xác nhận trực tuyến sẽ sớm được mở.')).toBeVisible()
  }
})
