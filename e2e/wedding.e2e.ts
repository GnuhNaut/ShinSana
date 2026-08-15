import { expect, test, type Page } from '@playwright/test'

const runtimeErrors = new WeakMap<Page, string[]>()

function monitorRuntimeErrors(page: Page) {
  const errors: string[] = []
  runtimeErrors.set(page, errors)
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
}

async function openInvitation(page: Page) {
  await page.getByRole('button', { name: 'MỞ THIỆP' }).click()
  await expect(page.locator('.opening')).toBeHidden()
  await expect(page.locator('.site')).toHaveAttribute('aria-hidden', 'false')
  await expect(page.locator('.hero h1')).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  monitorRuntimeErrors(page)
})

test.afterEach(async ({ page }) => {
  const errors = runtimeErrors.get(page) ?? []
  expect(errors, errors.join('\n')).toEqual([])
})

test('loads, personalizes the invitation, and exposes the correct date details', async ({ page }) => {
  const criticalFailures: string[] = []
  page.on('response', (response) => {
    if (response.status() >= 400 && ['document', 'stylesheet', 'script', 'image', 'font'].includes(response.request().resourceType())) {
      criticalFailures.push(`${response.status()} ${response.url()}`)
    }
  })

  await page.goto('/?guest=Nguyen%20Van%20An')
  await expect(page.locator('.opening')).toBeVisible()
  await expect(page.locator('.opening__names')).toContainText('Tuấn Hùng')
  await expect(page.locator('.opening__names')).toContainText('Sao Mai')
  await openInvitation(page)

  await expect(page.locator('#invitation')).toContainText('Nguyen Van An')
  await page.locator('#wedding-details').scrollIntoViewIfNeeded()
  await expect(page.locator('#wedding-details')).toContainText('19 tháng 10 năm 2026')
  await expect(page.locator('#wedding-details')).toContainText('10/09 âm lịch')
  await expect(page.locator('.calendar__day--wedding')).toContainText('19')
  expect(criticalFailures, criticalFailures.join('\n')).toEqual([])
})

test('validates and submits an RSVP through the local V1 adapter', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page)
  const form = page.locator('#rsvp form')
  await form.scrollIntoViewIfNeeded()

  await form.getByRole('button', { name: 'Gửi xác nhận' }).click()
  await expect(form.locator('#rsvp-name')).toHaveAttribute('aria-invalid', 'true')
  await expect(form.locator('#rsvp-attendance-error')).toBeVisible()

  await form.locator('#rsvp-name').fill('Nguyễn Văn An')
  await form.getByRole('radio', { name: /Có, tôi sẽ tham dự/ }).check()
  await form.locator('#rsvp-party-size').selectOption('2')
  await form.locator('#rsvp-message').fill('Hẹn gặp hai bạn!')
  await form.getByRole('button', { name: 'Gửi xác nhận' }).click()

  await expect(page.locator('#rsvp [role="status"]')).toContainText('Cảm ơn, Nguyễn Văn An.')
  const storedRSVP = await page.evaluate(() => JSON.parse(localStorage.getItem('wedding_v1_rsvp') ?? '{}'))
  expect(storedRSVP.version).toBe(1)
  expect(storedRSVP.data).toEqual([
    expect.objectContaining({ name: 'Nguyễn Văn An', attendance: 'yes', partySize: 2, message: 'Hẹn gặp hai bạn!' }),
  ])
})

test('validates and stores a guestbook wish through the local V1 adapter', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page)
  const form = page.locator('#wishes form')
  await form.scrollIntoViewIfNeeded()

  await form.getByRole('button', { name: 'Gửi lời chúc' }).click()
  await expect(form.getByRole('alert')).toContainText('Vui lòng kiểm tra')
  await expect(form.locator('#wish-name')).toBeFocused()

  await form.locator('#wish-name').fill('Nguyễn Văn An')
  await form.locator('#wish-message').fill('Chúc hai bạn luôn hạnh phúc!')
  await form.getByRole('button', { name: 'Gửi lời chúc' }).click()

  await expect(form.getByRole('status')).toContainText('Lời chúc của bạn đã được lưu')
  await expect(page.locator('.wish-card').first()).toContainText('Chúc hai bạn luôn hạnh phúc!')
  const storedWishes = await page.evaluate(() => JSON.parse(localStorage.getItem('wedding_v1_wishes') ?? '{}'))
  expect(storedWishes.version).toBe(1)
  expect(storedWishes.data).toEqual([
    expect.objectContaining({ name: 'Nguyễn Văn An', message: 'Chúc hai bạn luôn hạnh phúc!' }),
  ])
})

test('operates the gift modal and gallery lightbox by keyboard', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page)

  const giftButton = page.getByRole('button', { name: 'Gửi quà mừng' })
  await giftButton.scrollIntoViewIfNeeded()
  await giftButton.click()
  const giftDialog = page.getByRole('dialog', { name: 'quà mừng' })
  await expect(giftDialog).toBeVisible()

  const closeGiftButton = giftDialog.getByRole('button', { name: 'Đóng quà mừng' })
  await expect(closeGiftButton).toBeFocused()
  await page.keyboard.press('Tab')
  const groomTab = giftDialog.getByRole('tab', { name: 'Chú rể' })
  const brideTab = giftDialog.getByRole('tab', { name: 'Cô dâu' })
  await expect(groomTab).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(brideTab).toBeFocused()
  await expect(brideTab).toHaveAttribute('aria-selected', 'true')

  await closeGiftButton.click()
  await expect(giftDialog).toBeHidden()

  // Use keyboard activation for the focus-restoration assertion. Safari/WebKit
  // intentionally does not focus a button activated by a pointer click.
  await giftButton.focus()
  await page.keyboard.press('Enter')
  await expect(giftDialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(giftDialog).toBeHidden()
  await expect(giftButton).toBeFocused()

  const firstGalleryImage = page.getByRole('button', { name: /Mở ảnh:/ }).first()
  await firstGalleryImage.scrollIntoViewIfNeeded()
  await firstGalleryImage.click()
  const lightbox = page.getByRole('dialog', { name: 'thư viện ảnh' })
  await expect(lightbox).toBeVisible()
  await expect(lightbox).toContainText('Ảnh 1 trên 6')
  await page.keyboard.press('ArrowRight')
  await expect(lightbox).toContainText('Ảnh 2 trên 6')
  await page.keyboard.press('Escape')
  await expect(lightbox).toBeHidden()
})

test('has no horizontal overflow at the required responsive viewports', async ({ page }, testInfo) => {
  await page.goto('/')
  await openInvitation(page)

  const requiredViewports = [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 393, height: 852 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of requiredViewports) {
    await page.setViewportSize(viewport)
    await page.locator('footer').scrollIntoViewIfNeeded()
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))

    const overflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      horizontalScroll: (() => {
        window.scrollTo(10_000, window.scrollY)
        const result = window.scrollX
        window.scrollTo(0, window.scrollY)
        return result
      })(),
    }))
    const context = `${testInfo.project.name} at ${viewport.width}x${viewport.height}: ${JSON.stringify(overflow)}`

    expect(overflow.viewport, context).toBe(viewport.width)
    expect(overflow.document, context).toBeLessThanOrEqual(overflow.viewport)
    expect(overflow.body, context).toBeLessThanOrEqual(overflow.viewport)
    expect(overflow.horizontalScroll, context).toBe(0)
  }
})
