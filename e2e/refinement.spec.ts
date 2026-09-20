import { expect, test, type Locator, type Page } from '@playwright/test';

declare global {
  interface Window {
    __mediaCalls: { play: number; pause: number };
  }
}

async function enterInvitation(page: Page, reducedMotion: 'reduce' | 'no-preference' = 'reduce') {
  await page.emulateMedia({ reducedMotion });
  await page.goto('/');
  await page.getByRole('button', { name: /Mở thiệp cưới/ }).click();
  await expect(page.locator('.opening')).toHaveCount(0);
}

async function activeHeartAnimations(page: Page) {
  return page.locator('.heart-particle').evaluateAll((particles) => particles.filter((particle) => (
    particle.getAnimations().some((animation) => animation.playState === 'running')
  )).length);
}

async function expectSvgNavigation(controls: Locator) {
  const count = await controls.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const control = controls.nth(index);
    await expect(control.locator('svg')).toHaveCount(1);
    await expect(control).not.toContainText(/[←→]/);
    const shape = await control.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
      return { width: box.width, height: box.height, radius };
    });
    expect(shape.width).toBeGreaterThan(shape.height + 4);
    expect(shape.radius).toBeLessThan(shape.height / 2 - 1);
  }
}

test('starts configured music from the opening gesture and supports pause/resume', async ({ page }) => {
  await page.addInitScript(() => {
    const calls = { play: 0, pause: 0 };
    Object.defineProperty(window, '__mediaCalls', { configurable: true, value: calls });
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value() {
        calls.play += 1;
        return Promise.resolve();
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value() {
        calls.pause += 1;
      },
    });
  });

  await enterInvitation(page, 'no-preference');
  const audio = page.locator('audio');
  await expect(audio).toHaveAttribute('preload', 'none');
  await expect(audio).toHaveAttribute('loop', '');
  await expect(audio).toHaveAttribute('src', /\/audio\/wedding-ambient\.(m4a|mp3)$/);
  const audioAsset = await page.evaluate(async () => {
    const source = document.querySelector<HTMLAudioElement>('audio')?.src ?? '';
    const response = await fetch(source);
    return { ok: response.ok, size: (await response.blob()).size };
  });
  expect(audioAsset.ok).toBe(true);
  expect(audioAsset.size).toBeGreaterThan(10_000);
  await expect.poll(() => page.evaluate(() => window.__mediaCalls.play)).toBe(1);

  const control = page.locator('.music-control');
  await expect(page.getByRole('button', { name: 'Tạm dừng nhạc' })).toBeVisible();
  await expect(control).toBeEnabled();
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  expect(await control.locator('.music-control__ring').evaluate((element) => getComputedStyle(element).animationName)).not.toBe('none');
  const controlShape = await control.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
    return { width: box.width, height: box.height, radius };
  });
  expect(Math.abs(controlShape.width - controlShape.height) > 4 || controlShape.radius < Math.min(controlShape.width, controlShape.height) / 2 - 1).toBe(true);

  await control.click();
  await expect(page.getByRole('button', { name: 'Bật nhạc' })).toHaveAttribute('aria-pressed', 'false');
  expect(await control.locator('.music-control__ring').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await expect.poll(() => page.evaluate(() => window.__mediaCalls.pause)).toBe(1);

  await page.getByRole('button', { name: 'Bật nhạc' }).click();
  await expect(page.getByRole('button', { name: 'Tạm dừng nhạc' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.__mediaCalls.play)).toBe(2);
});

test('uses a bounded SVG heart pool for pointer trail and click burst', async ({ page }) => {
  await enterInvitation(page, 'no-preference');
  const layer = page.locator('.romantic-hearts');
  const particles = layer.locator('.heart-particle');
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await expect(particles).toHaveCount(18);
  await expect(particles.locator('svg')).toHaveCount(18);
  expect(await layer.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe('none');
  expect((await particles.allTextContents()).join('')).toBe('');

  await page.waitForTimeout(800);
  await page.mouse.move(100, 120);
  await expect.poll(() => activeHeartAnimations(page)).toBeGreaterThanOrEqual(1);

  await page.waitForTimeout(800);
  await page.mouse.move(110, 120);
  await page.waitForTimeout(80);
  expect(await activeHeartAnimations(page)).toBe(0);
  await page.mouse.move(126, 120);
  await expect.poll(() => activeHeartAnimations(page)).toBeGreaterThanOrEqual(1);
  const trailSizes = await particles.evaluateAll((items) => items
    .filter((item) => item.getAnimations().some((animation) => animation.playState === 'running'))
    .map((item) => Number.parseFloat((item as HTMLElement).style.width)));
  expect(trailSizes.every((size) => size >= 5 && size <= 12)).toBe(true);

  await page.waitForTimeout(800);
  await page.mouse.move(210, 210);
  await page.waitForTimeout(800);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(() => activeHeartAnimations(page)).toBeGreaterThanOrEqual(6);
  expect(await activeHeartAnimations(page)).toBeLessThanOrEqual(10);

  await page.waitForTimeout(900);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.hero-scene').dispatchEvent('pointerup', {
    bubbles: true,
    clientX: 180,
    clientY: 180,
    isPrimary: true,
    pointerType: 'touch',
  });
  await expect.poll(() => activeHeartAnimations(page)).toBe(6);

  await page.waitForTimeout(900);
  const response = page.locator('.response-scene');
  await response.scrollIntoViewIfNeeded();
  const input = response.getByLabel('Họ và tên');
  const box = await input.boundingBox();
  if (!box) throw new Error('RSVP name input has no box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(800);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(80);
  expect(await activeHeartAnimations(page)).toBe(0);
});

test('disables all romantic heart motion when reduced motion is requested', async ({ page }) => {
  await enterInvitation(page, 'reduce');
  await page.mouse.move(120, 140);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(100);
  expect(await activeHeartAnimations(page)).toBe(0);
});

test('keeps all gift information and the QR on the opened paper insert', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?side=bride');
  await page.getByRole('button', { name: /Mở thiệp cưới/ }).click();
  await expect(page.locator('.opening')).toHaveCount(0);

  const gift = page.locator('.gift-scene');
  await gift.scrollIntoViewIfNeeded();
  const envelopes = gift.locator('.red-envelope');
  await expect(envelopes).toHaveCount(2);
  await envelopes.nth(1).click();

  const openObject = gift.locator('.gift-open-object');
  const insert = openObject.locator('.gift-insert');
  await expect(openObject).toBeVisible();
  await expect(insert).toBeVisible();
  await expect(gift.locator('.gift-details')).toHaveCount(0);
  await expect(insert).toContainText('NHÀ GÁI');
  await expect(insert).toContainText('NGÂN HÀNG');
  await expect(insert).toContainText('SỐ TÀI KHOẢN');
  await expect(insert.getByRole('button', { name: /Sao chép/ })).toBeVisible();

  const qr = insert.locator('img[alt*="QR"], [role="img"][aria-label*="QR"]');
  await expect(qr).toBeVisible();
  const qrBox = await qr.boundingBox();
  if (!qrBox) throw new Error('Gift QR has no box');
  expect(qrBox.width).toBeGreaterThanOrEqual(220);
  expect(qrBox.width).toBeLessThanOrEqual(275);
  expect(Math.abs(qrBox.width - qrBox.height)).toBeLessThanOrEqual(2);

  await envelopes.first().click();
  await expect(gift.locator('.gift-open-object .gift-insert')).toContainText('NHÀ TRAI');

  await page.setViewportSize({ width: 390, height: 844 });
  await insert.scrollIntoViewIfNeeded();
  const mobileQrBox = await qr.boundingBox();
  if (!mobileQrBox) throw new Error('Mobile gift QR has no box');
  expect(mobileQrBox.width).toBeGreaterThanOrEqual(190);
  expect(mobileQrBox.width).toBeLessThanOrEqual(220);
});

test('uses an accessible bounded party-size stepper instead of a native select', async ({ page }) => {
  await enterInvitation(page);
  const response = page.locator('.response-scene');
  await response.scrollIntoViewIfNeeded();
  await expect(response.locator('select[name="partySize"]')).toHaveCount(0);

  const stepper = response.locator('.party-stepper');
  const value = stepper.locator('input[name="partySize"]');
  const output = stepper.locator('output');
  const decrement = stepper.getByRole('button', { name: /Giảm số người/ });
  const increment = stepper.getByRole('button', { name: /Tăng số người/ });
  await expect(value).toHaveValue('1');
  await expect(output).toContainText('01');
  await expect(decrement.locator('svg')).toHaveCount(1);
  await expect(increment.locator('svg')).toHaveCount(1);
  await expect(decrement).toBeDisabled();
  await increment.click();
  await increment.click();
  await increment.click();
  await expect(value).toHaveValue('4');
  await expect(output).toContainText('04');
  await expect(increment).toBeDisabled();
  await decrement.click();
  await expect(value).toHaveValue('3');

  for (const button of [decrement, increment]) {
    const box = await button.boundingBox();
    if (!box) throw new Error('Party stepper control has no box');
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test('uses rectangular inline-SVG controls for gallery and viewer navigation', async ({ page }) => {
  await enterInvitation(page);
  const gallery = page.locator('.gallery-scene');
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator('.gallery-slide--active')).toBeVisible();

  const galleryControls = gallery.locator('.gallery-nav button');
  await expectSvgNavigation(galleryControls);
  await galleryControls.nth(1).click();
  await expect(gallery.locator('.gallery-counter strong')).toHaveText('02');

  await gallery.locator('.gallery-slide--active').click();
  const viewer = page.locator('.viewer');
  await expect(viewer).toBeVisible();
  await expectSvgNavigation(viewer.locator('.viewer__nav'));
});
