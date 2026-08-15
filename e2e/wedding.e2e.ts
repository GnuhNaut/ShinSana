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
  await page.getByRole('button', { name: /Mở thiệp/i }).click()
  await expect(page.locator('.cover')).toBeHidden()
  await expect(page.locator('.site')).toHaveAttribute('aria-hidden', 'false')
  await expect(page.locator('.invite__eyebrow').first()).toContainText('Lễ thành hôn')
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
  await expect(page.locator('.cover')).toBeVisible()
  await expect(page.locator('.cover__names')).toContainText('Tuấn Hùng')
  await expect(page.locator('.cover__names')).toContainText('Sao Mai')
  await openInvitation(page)

  await expect(page.locator('.invite__eyebrow').first()).toContainText('Lễ thành hôn')
  await expect(page.locator('.invite__kicker--guest')).toContainText('Nguyen Van An')
  await page.locator('#ceremony').scrollIntoViewIfNeeded()
  await expect(page.locator('#ceremony')).toContainText('19 tháng 10 năm 2026')
  await expect(page.locator('#ceremony')).toContainText('10/09 âm lịch')
  expect(criticalFailures, criticalFailures.join('\n')).toEqual([])
})

test('orders ceremony cards so the matching guest side appears first', async ({ page }) => {
  await page.goto('/?guest=Nguyen%20Van%20An&side=groom')
  await openInvitation(page)
  const cards = page.locator('.event-card article')
  await expect(cards).toHaveCount(2)
  await expect(cards.first().locator('h3')).toContainText(/Nhà Trai|thành hôn/i)
  await expect(cards.nth(1).locator('h3')).toContainText(/Nhà Gái|vu quy/i)

  await page.goto('/?guest=Nguyen%20Van%20An&side=bride')
  await openInvitation(page)
  const orderedCards = page.locator('.event-card article')
  await expect(orderedCards.first().locator('h3')).toContainText(/Nhà Gái|vu quy/i)

  await page.goto('/?guest=Nguyen%20Van%20An&side=both')
  await openInvitation(page)
  const equalCards = page.locator('.event-card article')
  await expect(equalCards.first().locator('h3')).toContainText(/Nhà Trai|thành hôn/i)
})

test('prefills the RSVP attendance from the side query', async ({ page }) => {
  await page.goto('/?guest=Nguyen%20Van%20An&side=groom')
  await openInvitation(page)
  const form = page.locator('#rsvp form')
  await form.scrollIntoViewIfNeeded()
  await expect(form.getByRole('radio', { name: /Nhà Trai/ })).toBeChecked()
  await expect(form.locator('#rsvp-name')).toHaveValue('Nguyen Van An')
})

test('validates and submits an RSVP through the local V2 adapter', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page)
  const form = page.locator('#rsvp form')
  await form.scrollIntoViewIfNeeded()

  await form.getByRole('button', { name: 'Gửi xác nhận' }).click()
  await expect(form.locator('#rsvp-name')).toHaveAttribute('aria-invalid', 'true')
  await expect(form.locator('#rsvp-attendance-error')).toBeVisible()

  await form.locator('#rsvp-name').fill('Nguyễn Văn An')
  await form.getByRole('radio', { name: /Cả Hai/ }).check()
  await form.locator('#rsvp-party-size').selectOption('2')
  await form.locator('#rsvp-message').fill('Hẹn gặp hai bạn!')
  await form.getByRole('button', { name: 'Gửi xác nhận' }).click()

  await expect(page.locator('#rsvp [role="status"]')).toContainText('Cảm ơn bạn đã xác nhận')
  const storedRSVP = await page.evaluate(() => JSON.parse(localStorage.getItem('wedding_v1_rsvp') ?? '{}'))
  expect(storedRSVP.version).toBe(1)
  expect(storedRSVP.data).toEqual([
    expect.objectContaining({ name: 'Nguyễn Văn An', attendance: 'both', partySize: 2, message: 'Hẹn gặp hai bạn!' }),
  ])
})

test('operates the gift modal and gallery lightbox by keyboard', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page)

  const giftButton = page.getByRole('button', { name: /Gửi quà mừng/i })
  await giftButton.scrollIntoViewIfNeeded()
  await giftButton.click()
  const giftDialog = page.getByRole('dialog', { name: 'gửi quà mừng' })
  await expect(giftDialog).toBeVisible()

  const closeGiftButton = giftDialog.getByRole('button', { name: 'Đóng gửi quà mừng' })
  await expect(closeGiftButton).toBeFocused()
  await page.keyboard.press('Tab')
  const groomTab = giftDialog.getByRole('tab', { name: 'Nhà Trai' })
  const brideTab = giftDialog.getByRole('tab', { name: 'Nhà Gái' })
  await expect(groomTab).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(brideTab).toBeFocused()
  await expect(brideTab).toHaveAttribute('aria-selected', 'true')

  await closeGiftButton.click()
  await expect(giftDialog).toBeHidden()

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
  await expect(lightbox).toContainText(`Ảnh 1 trên ${6}`)
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
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
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
