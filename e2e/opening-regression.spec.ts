import { expect, test, type Page } from '@playwright/test';

const openingControl = (page: Page) => page.locator('.opening__folio');

async function expectAtTop(page: Page) {
  await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY))).toBeLessThanOrEqual(2);
}

async function expectOpenedAtHero(page: Page) {
  await expect(page.locator('.opening')).toHaveCount(0);
  await expect(page.locator('.hero-scene')).toBeVisible();
  await expect(page.locator('#hero-title')).toBeFocused();
  await expectAtTop(page);
  await expect.poll(() => page.locator('.hero-scene').evaluate((element) => (
    Math.abs(element.getBoundingClientRect().top)
  ))).toBeLessThanOrEqual(2);
}

test('keeps a fresh pointer-opened invitation at the Hero top', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  await expectAtTop(page);
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
  await openingControl(page).click();

  await expect(page.locator('.opening')).toHaveClass(/is-opening/);
  await expectAtTop(page);
  await expectOpenedAtHero(page);
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('auto');
  await expect(page.locator('[data-heart-rain]')).toHaveCount(0, { timeout: 5_000 });
  await expectAtTop(page);
});

test('discards a stale browser scroll position across reload and opening', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await openingControl(page).click();
  await expectOpenedAtHero(page);

  await page.evaluate(() => window.scrollTo(0, Math.max(900, document.body.scrollHeight / 2)));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(openingControl(page)).toBeVisible();
  await expectAtTop(page);
  await openingControl(page).click();
  await expectOpenedAtHero(page);
});

for (const key of ['Enter', 'Space'] as const) {
  test(`opens by ${key} without moving focus or scroll below the Hero`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const control = openingControl(page);
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
    await control.press(key);
    await expectOpenedAtHero(page);
  });
}

test('opens at the top on mobile when the music playback promise is rejected', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    (window as Window & { __openingRejectedPlayCalls?: number }).__openingRejectedPlayCalls = 0;
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: () => {
        (window as Window & { __openingRejectedPlayCalls?: number }).__openingRejectedPlayCalls! += 1;
        return Promise.reject(new DOMException('Playback rejected', 'NotAllowedError'));
      },
    });
  });
  await page.goto('/');

  await openingControl(page).click();
  await expectOpenedAtHero(page);
  await expect(page.locator('.music-control')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __openingRejectedPlayCalls?: number }).__openingRejectedPlayCalls
  ))).toBe(1);
  await page.locator('.music-control').click();
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __openingRejectedPlayCalls?: number }).__openingRejectedPlayCalls
  ))).toBe(2);
  await expect(page.locator('.music-control')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.hero-scene__date')).toBeInViewport();
});

test('keeps the reduced-motion opening handoff at the top', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

  await openingControl(page).click();
  await expectOpenedAtHero(page);
});

test('does not jump while the high-priority Hero image finishes loading', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/images/hero-ceremony.png', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.continue();
  });

  const heroResponse = page.waitForResponse((response) => response.url().includes('/images/hero-ceremony.png'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openingControl(page).click();
  await expectOpenedAtHero(page);

  await heroResponse;
  await page.waitForLoadState('load');
  await expectAtTop(page);
  await expect(page.locator('.hero-scene')).toBeVisible();
});

test('normalizes an entry hash without following it below the closed invitation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#invitation-story');

  await expect(openingControl(page)).toBeVisible();
  await expectAtTop(page);
  await openingControl(page).click();
  await expectOpenedAtHero(page);
});
