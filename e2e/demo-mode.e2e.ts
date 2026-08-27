import { expect, test, type Page } from '@playwright/test'

const runtimeErrors = new WeakMap<Page, string[]>()
const productionForbiddenStrings = [
  'Nguyễn Văn Minh',
  'Ngân hàng Demo',
  '0123456789',
  '123 Đường Hoa Hồng, Quận Cầu Giấy, Hà Nội',
]

function monitorRuntimeErrors(page: Page) {
  const errors: string[] = []
  runtimeErrors.set(page, errors)
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
}

async function openInvitation(page: Page) {
  await page.getByRole('button', { name: 'Mở lời mời', exact: true }).click()
  await expect(page.locator('.cover')).toBeHidden()
  await expect(page.locator('#invitation-content')).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Ngày mình chung đôi' })).toBeVisible()
}

async function canonicalHref(page: Page): Promise<string | null> {
  const canonical = page.locator('link[rel="canonical"]')
  return await canonical.count() > 0 ? canonical.first().getAttribute('href') : null
}

test.describe('query-controlled wedding demo mode', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'One deterministic Chromium project covers demo routing and interactions.')
    monitorRuntimeErrors(page)
  })

  test.afterEach(async ({ page }) => {
    const errors = runtimeErrors.get(page) ?? []
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('keeps production data clean for normal, disabled, invalid, and duplicate demo queries', async ({ page }) => {
    const requestedDemoChunks: string[] = []
    page.on('request', (request) => {
      if (/wedding\.demo-[^/]+\.js(?:\?|$)/.test(request.url())) requestedDemoChunks.push(request.url())
    })

    for (const path of ['/', '/?demo=0', '/?demo=other', '/?demo=1&demo=0']) {
      await page.goto(path)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
      await expect(page.locator('html')).not.toHaveAttribute('data-wedding-demo')
      await expect(page.getByText('DEMO PREVIEW', { exact: true })).toHaveCount(0)
      await openInvitation(page)

      await expect(page.locator('.event-card')).toHaveCount(0)
      await expect(page.getByRole('button', { name: /(?:Mừng cưới online|Gửi mừng cưới)/ })).toHaveCount(0)
      await expect(page.locator('img[src^="/images/demo/demo-qr-"]')).toHaveCount(0)
      const pageText = await page.locator('body').innerText()
      for (const sample of productionForbiddenStrings) expect(pageText, `${path}: ${sample}`).not.toContain(sample)
    }

    expect(requestedDemoChunks).toEqual([])
  })

  test('loads the full demo for one demo=1 parameter and supports calendar and gift flows', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    const productionCanonical = await canonicalHref(page)

    await page.goto('/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A&demo=1')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    await expect(page.locator('html')).toHaveAttribute('data-wedding-demo', 'true')
    await expect(page.getByRole('status')).toHaveText('DEMO PREVIEW')
    expect(await canonicalHref(page)).toBe(productionCanonical)
    await expect(page.locator('.cover__guest')).toContainText('Nguyễn Văn A')

    await openInvitation(page)
    const families = page.locator('.invite__families')
    await expect(families).toContainText('Nguyễn Văn Minh')
    await expect(families).toContainText('Trần Thu Hà')
    await expect(families).toContainText('Lê Văn Thành')
    await expect(families).toContainText('Phạm Ngọc Mai')

    const cards = page.locator('article.event-card')
    await expect(cards).toHaveCount(3)
    await expect(cards.locator('h4')).toHaveText(['Lễ Vu Quy', 'Lễ Thành Hôn', 'Tiệc Chung Vui'])
    await expect(page.getByRole('button', { name: 'Chỉ đường' })).toHaveCount(3)
    await expect(page.getByRole('button', { name: 'Sao chép địa chỉ' })).toHaveCount(3)
    await expect(page.getByRole('link', { name: '0900000001' })).toHaveAttribute('href', 'tel:0900000001')
    await expect(cards.first()).toContainText('123 Đường Hoa Hồng, Quận Cầu Giấy, Hà Nội')
    await expect(cards.first()).toContainText('Có khu vực gửi xe máy và ô tô gần địa điểm tổ chức.')
    await page.getByRole('button', { name: 'Chỉ đường' }).first().click()
    const mapDialog = page.getByRole('dialog', { name: /bản đồ Tư gia Nhà Gái/i })
    await expect(mapDialog).toBeVisible()
    await expect(mapDialog.locator('iframe')).toHaveAttribute('loading', 'lazy')
    await mapDialog.getByRole('button', { name: /Đóng bản đồ/i }).click()
    await page.getByRole('button', { name: 'Sao chép địa chỉ' }).first().click()
    await expect(cards.first().getByRole('button', { name: 'Đã sao chép' })).toBeVisible()
    await expect(page.getByText('Lần đầu gặp nhau', { exact: true })).toBeVisible()
    await expect(page.getByText('Về chung một nhà', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Xác nhận tham dự' })).toBeVisible()

    const calendarLinks = page.getByRole('link', { name: 'Lưu ngày cưới' })
    await expect(calendarLinks).toHaveCount(3)
    await expect(calendarLinks.nth(0)).toHaveAttribute('download', 'wedding-demo-vu-quy.ics')
    await expect(calendarLinks.nth(1)).toHaveAttribute('download', 'wedding-demo-thanh-hon.ics')
    await expect(calendarLinks.nth(2)).toHaveAttribute('download', 'wedding-demo-wedding-party.ics')
    const firstCalendarHref = await calendarLinks.first().getAttribute('href')
    expect(firstCalendarHref).toMatch(/^data:text\/calendar;charset=utf-8,/)
    const firstCalendarText = decodeURIComponent(firstCalendarHref!.slice(firstCalendarHref!.indexOf(',') + 1))
    expect(firstCalendarText).toContain('SUMMARY:Lễ Vu Quy')
    expect(firstCalendarText).toContain('DTSTART:20261018T100000Z')
    expect(firstCalendarText).toContain('DTEND:20261018T133000Z')
    expect(firstCalendarText).toContain('LOCATION:123 Đường Hoa Hồng\\, Quận Cầu Giấy\\, Hà Nội')

    const giftTrigger = page.getByRole('button', { name: 'Gửi mừng cưới', exact: true })
    await giftTrigger.scrollIntoViewIfNeeded()
    await giftTrigger.click()
    const dialog = page.getByRole('dialog', { name: 'Gửi mừng cưới' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Đóng Gửi mừng cưới' })).toBeFocused()

    const groomTab = dialog.getByRole('tab', { name: 'Nhà Trai' })
    const brideTab = dialog.getByRole('tab', { name: 'Nhà Gái' })
    await expect(groomTab).toHaveAttribute('aria-selected', 'true')
    await expect(dialog.getByText('0123456789', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('img', { name: 'Mã QR mừng cưới Nhà Trai' })).toHaveAttribute(
      'src',
      '/images/demo/demo-qr-groom.png',
    )

    await groomTab.focus()
    await page.keyboard.press('ArrowRight')
    await expect(brideTab).toBeFocused()
    await expect(brideTab).toHaveAttribute('aria-selected', 'true')
    await expect(dialog.getByText('9876543210', { exact: true })).toBeVisible()
    const brideQr = dialog.getByRole('img', { name: 'Mã QR mừng cưới Nhà Gái' })
    await expect(brideQr).toHaveAttribute(
      'src',
      '/images/demo/demo-qr-bride.png',
    )
    await expect.poll(() => brideQr.evaluate((node) => {
      const image = node as HTMLImageElement
      return image.complete && image.naturalWidth === 720 && image.naturalHeight === 720
    })).toBe(true)

    await dialog.getByRole('button', { name: 'Sao chép STK' }).click()
    await expect(dialog.getByRole('button', { name: 'Đã sao chép' })).toBeVisible()
    await expect(dialog.getByRole('status')).toHaveText('Đã sao chép số tài khoản')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(giftTrigger).toBeFocused()
  })
})
