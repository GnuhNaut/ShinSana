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

async function openInvitation(page: Page, withKeyboard = false) {
  const openButton = page.getByRole('button', { name: 'Mở lời mời', exact: true })
  await expect(openButton).toBeVisible()

  if (withKeyboard) {
    await openButton.focus()
    await expect(openButton).toBeFocused()
    await page.keyboard.press('Enter')
  } else {
    await openButton.click()
  }

  await expect(page.locator('.cover')).toBeHidden()
  await expect(page.locator('.site')).toHaveAttribute('aria-hidden', 'false')
  await expect(page.locator('#invitation-content')).toBeFocused()
}

test.beforeEach(async ({ page }) => {
  monitorRuntimeErrors(page)
})

test.afterEach(async ({ page }) => {
  const errors = runtimeErrors.get(page) ?? []
  expect(errors, errors.join('\n')).toEqual([])
})

test('loads and personalizes the invitation with the confirmed names and date', async ({ page }) => {
  const criticalFailures: string[] = []
  page.on('response', (response) => {
    const resourceType = response.request().resourceType()
    if (response.status() >= 400 && ['document', 'stylesheet', 'script', 'image', 'font'].includes(resourceType)) {
      criticalFailures.push(`${response.status()} ${response.url()}`)
    }
  })

  await page.goto('/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A')

  const cover = page.locator('.cover')
  await expect(cover).toBeVisible()
  await expect(cover.locator('#cover-title')).toContainText('Tuấn Hùng')
  await expect(cover.locator('#cover-title')).toContainText('Sao Mai')
  await expect(cover.locator('time[datetime="2026-10-19"]')).toHaveText('19 · 10 · 2026')
  await expect(cover).toContainText('10/09 âm lịch')
  await expect(cover.locator('.cover__guest')).toContainText('Nguyễn Văn A')

  await openInvitation(page, true)

  await expect(page.locator('.invite__salutation')).toContainText('Trân trọng kính mời Nguyễn Văn A')
  await expect(page.locator('#invite-title')).toContainText('Tuấn Hùng')
  await expect(page.locator('#invite-title')).toContainText('Sao Mai')

  const weddingDay = page.locator('#wedding-day')
  await weddingDay.scrollIntoViewIfNeeded()
  await expect(weddingDay.locator('.wedding-day__day')).toHaveText('19')
  await expect(weddingDay.locator('.wedding-day__month')).toContainText('Tháng 10')
  await expect(weddingDay.locator('.wedding-day__month')).toContainText('2026')
  await expect(weddingDay).toContainText('Tức ngày 10/09 âm lịch')

  expect(criticalFailures, criticalFailures.join('\n')).toEqual([])
})

test('validates and stores attending and declined RSVP responses in the local adapter', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page)

  const form = page.locator('#rsvp form')
  await form.scrollIntoViewIfNeeded()
  await form.getByRole('button', { name: 'Gửi lời xác nhận', exact: true }).click()

  await expect(form.getByRole('alert')).toContainText('Vui lòng kiểm tra')
  await expect(form.locator('#rsvp-name')).toHaveAttribute('aria-invalid', 'true')
  await expect(form.locator('#rsvp-name-error')).toBeVisible()
  await expect(form.locator('#rsvp-attendance-error')).toBeVisible()
  await expect(form.locator('#rsvp-name')).toBeFocused()

  await form.locator('#rsvp-name').fill('Nguyễn Văn An')
  await form.getByRole('radio', { name: /Có, tôi sẽ tham dự/ }).check()
  await expect(form.locator('#rsvp-party-size')).toBeVisible()
  await form.locator('#rsvp-party-size').selectOption('2')
  await form.locator('#rsvp-message').fill('Hẹn gặp hai bạn!')
  await form.getByRole('button', { name: 'Gửi lời xác nhận', exact: true }).click()

  await expect(page.locator('#rsvp [role="status"]')).toContainText('Cảm ơn bạn đã xác nhận')
  const attendingEnvelope = await page.evaluate(() => JSON.parse(localStorage.getItem('wedding_v1_rsvp') ?? '{}'))
  expect(attendingEnvelope.version).toBe(1)
  expect(attendingEnvelope.data).toEqual([
    expect.objectContaining({
      name: 'Nguyễn Văn An',
      attendance: 'yes',
      partySize: 2,
      message: 'Hẹn gặp hai bạn!',
    }),
  ])

  await page.getByRole('button', { name: 'Gửi một hồi âm khác', exact: true }).click()
  const declinedForm = page.locator('#rsvp form')
  await declinedForm.locator('#rsvp-name').fill('Trần Minh')
  await declinedForm.getByRole('radio', { name: /Rất tiếc, tôi không thể tham dự/ }).check()
  await expect(declinedForm.locator('#rsvp-party-size')).toHaveCount(0)
  await declinedForm.getByRole('button', { name: 'Gửi lời xác nhận', exact: true }).click()

  await expect(page.locator('#rsvp [role="status"]')).toContainText('Cảm ơn bạn đã hồi âm')
  const finalEnvelope = await page.evaluate(() => JSON.parse(localStorage.getItem('wedding_v1_rsvp') ?? '{}'))
  expect(finalEnvelope.version).toBe(1)
  expect(finalEnvelope.data).toHaveLength(2)
  expect(finalEnvelope.data[1]).toEqual(expect.objectContaining({
    name: 'Trần Minh',
    attendance: 'no',
  }))
  expect(finalEnvelope.data[1]).not.toHaveProperty('partySize')
  expect(finalEnvelope.data[1]).not.toHaveProperty('message')
})

test('omits unconfigured event, map, gift, and music controls', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page)

  await expect(page.locator('.wedding-day__events')).toHaveCount(0)
  await expect(page.locator('.event-card')).toHaveCount(0)
  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Chỉ đường/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Mừng cưới online/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /(?:Bật|Tắt) nhạc/i })).toHaveCount(0)
  await expect(page.locator('audio')).toHaveCount(0)
  await expect(page.getByText(/Chưa cập nhật|Đang cập nhật|\bTBD\b/i)).toHaveCount(0)
})

test('opens the gallery by keyboard and closes the lightbox with Escape', async ({ page }) => {
  await page.goto('/')
  await openInvitation(page, true)

  const firstGalleryImage = page.getByRole('button', { name: /Mở ảnh:/i }).first()
  await firstGalleryImage.scrollIntoViewIfNeeded()
  await firstGalleryImage.focus()
  await expect(firstGalleryImage).toBeFocused()
  await page.keyboard.press('Enter')

  const lightbox = page.getByRole('dialog', { name: 'thư viện ảnh' })
  await expect(lightbox).toBeVisible()
  await expect(lightbox).toContainText('Ảnh 1 trên 4')
  await expect(lightbox.getByRole('button', { name: 'Đóng thư viện ảnh' })).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(lightbox).toContainText('Ảnh 2 trên 4')
  await page.keyboard.press('Escape')
  await expect(lightbox).toBeHidden()
  await expect(firstGalleryImage).toBeFocused()
})

test('has no horizontal overflow at every required responsive width', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'The exact viewport matrix only needs one deterministic browser run.')

  const requiredViewports = [
    { width: 360, height: 800 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]

  await page.goto('/')
  await openInvitation(page)

  for (const viewport of requiredViewports) {
    await page.setViewportSize(viewport)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.evaluate(() => new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    }))

    const overflow = await page.evaluate(() => {
      const root = document.documentElement
      const body = document.body
      window.scrollTo(10_000, window.scrollY)
      const horizontalScroll = window.scrollX
      window.scrollTo(0, window.scrollY)
      return {
        viewport: root.clientWidth,
        document: root.scrollWidth,
        body: body.scrollWidth,
        horizontalScroll,
      }
    })
    const context = `${viewport.width}x${viewport.height}: ${JSON.stringify(overflow)}`

    expect(overflow.viewport, context).toBe(viewport.width)
    expect(overflow.document, context).toBeLessThanOrEqual(overflow.viewport)
    expect(overflow.body, context).toBeLessThanOrEqual(overflow.viewport)
    expect(overflow.horizontalScroll, context).toBe(0)
  }
})
