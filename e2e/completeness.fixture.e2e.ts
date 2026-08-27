import { expect, test } from '@playwright/test'

const environment = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
const fixtureEnabled = environment?.QA_COMPLETENESS_FIXTURE === '1'
const screenshotRoot = 'artifacts/screenshots/completeness-fixture'

const viewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1440, height: 900 },
]

test('visually checks populated event and gift states without shipping fixture data', async ({ page }, testInfo) => {
  test.skip(!fixtureEnabled || testInfo.project.name !== 'chromium-desktop', 'Runs only during the controlled populated-fixture QA pass.')

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.goto('/?side=bride')
    await page.getByRole('button', { name: 'Mở lời mời', exact: true }).click()
    await expect(page.locator('.cover')).toBeHidden()

    const events = page.locator('.wedding-day__events')
    await events.scrollIntoViewIfNeeded()
    await expect(events.locator('.event-card')).toHaveCount(3)
    await expect(events.getByRole('link', { name: 'Chỉ đường' })).toHaveCount(3)
    await expect(events.getByRole('button', { name: 'Sao chép địa chỉ' })).toHaveCount(3)
    await expect(page.getByRole('button', { name: 'Về đầu trang' })).toHaveCount(0)
    const clippedActions = await events.locator('.event-card__actions .button').evaluateAll((buttons) => (
      buttons.filter((button) => button.scrollWidth > button.clientWidth).length
    ))
    expect(clippedActions).toBe(0)
    await events.screenshot({
      animations: 'disabled',
      path: `${screenshotRoot}/fixture-events-${viewport.width}x${viewport.height}.png`,
      style: '.skip-link,.floating-controls,.scroll-progress{display:none!important}',
    })

    const giftTrigger = page.getByRole('button', { name: 'Mừng cưới online', exact: true })
    await giftTrigger.scrollIntoViewIfNeeded()
    await giftTrigger.click()
    const dialog = page.getByRole('dialog', { name: 'mừng cưới online' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('tab')).toHaveCount(2)
    await expect(dialog.getByRole('button', { name: 'Sao chép STK' })).toBeVisible()
    await page.screenshot({
      animations: 'disabled',
      path: `${screenshotRoot}/fixture-gift-${viewport.width}x${viewport.height}.png`,
      style: '.skip-link,.floating-controls,.scroll-progress{display:none!important}',
    })

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      dialogScrollWidth: document.querySelector<HTMLElement>('.gift-modal')?.scrollWidth ?? 0,
      dialogClientWidth: document.querySelector<HTMLElement>('.gift-modal')?.clientWidth ?? 0,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
    expect(overflow.dialogScrollWidth).toBeLessThanOrEqual(overflow.dialogClientWidth)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(giftTrigger).toBeFocused()
  }
})
