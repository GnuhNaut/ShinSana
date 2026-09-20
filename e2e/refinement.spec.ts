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
  return page.locator('[data-heart-ghost], [data-heart-click]').evaluateAll((particles) => particles.filter((particle) => (
    particle.getAnimations().some((animation) => animation.playState === 'running')
  )).length);
}

async function activeHeartNodes(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((nodes) => nodes.filter((node) => (
    node.getAnimations().some((animation) => animation.playState === 'running')
  )).length);
}

async function dispatchHeroPointerMove(page: Page, clientX: number, clientY: number) {
  await page.evaluate(async ({ x, y }) => {
    const hero = document.querySelector('.hero-scene');
    if (!hero) throw new Error('Hero is required for pointer-effect verification.');
    hero.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: x,
      clientY: y,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }, { x: clientX, y: clientY });
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

test('uses a bounded heart-arrow cursor, ghost pool, and grow-shrink click pulse', async ({ page }) => {
  test.setTimeout(60_000);
  await enterInvitation(page, 'no-preference');
  const layer = page.locator('[data-heart-effects]');
  const cursor = layer.locator('[data-heart-cursor]');
  const ghosts = layer.locator('[data-heart-ghost]');
  const primary = layer.locator('[data-heart-click="primary"]');
  const secondary = layer.locator('[data-heart-click="secondary"]');
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await expect(cursor).toHaveCount(1);
  await expect(cursor.locator('svg')).toHaveCount(1);
  await expect(ghosts).toHaveCount(14);
  await expect(primary).toHaveCount(4);
  await expect(secondary).toHaveCount(24);
  expect(await layer.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe('none');
  await expect(page.locator('html')).toHaveClass(/heart-cursor-enabled/);

  await page.mouse.move(100, 120);
  await expect(cursor).toHaveAttribute('data-visible', 'true');
  const cursorBox = await cursor.boundingBox();
  if (!cursorBox) throw new Error('Heart cursor has no box');
  expect(cursorBox.width).toBeGreaterThanOrEqual(26);
  expect(cursorBox.width).toBeLessThanOrEqual(34);
  expect(Math.abs(cursorBox.x + 1.5 - 100)).toBeLessThanOrEqual(1);
  expect(Math.abs(cursorBox.y + 1.5 - 120)).toBeLessThanOrEqual(1);

  // Start from a settled pool, then use a deterministic in-page PointerEvent
  // to exercise a movement greater than the 7–13px production threshold.
  await page.waitForTimeout(650);
  expect(await activeHeartNodes(page, '[data-heart-ghost]')).toBe(0);
  await dispatchHeroPointerMove(page, 260, 200);
  await expect.poll(() => activeHeartNodes(page, '[data-heart-ghost]')).toBeGreaterThanOrEqual(1);
  const trailSizes = await ghosts.evaluateAll((items) => items
    .filter((item) => item.getAnimations().some((animation) => animation.playState === 'running'))
    .map((item) => Number.parseFloat((item as HTMLElement).style.width)));
  expect(trailSizes.every((size) => size >= 12 && size <= 17)).toBe(true);

  const fixedPoolCount = await layer.locator('[data-heart-ghost], [data-heart-click]').count();
  await page.evaluate(async () => {
    for (let index = 0; index < 80; index += 1) {
      const clientX = 80 + (index % 12) * 20;
      const clientY = 160 + (index % 5) * 18;
      document.elementFromPoint(clientX, clientY)?.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true,
        clientX,
        clientY,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'mouse',
      }));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  });
  expect(await layer.locator('[data-heart-ghost], [data-heart-click]').count()).toBe(fixedPoolCount);

  await page.waitForTimeout(600);
  await page.mouse.move(210, 210);
  await page.waitForTimeout(90);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(() => activeHeartNodes(page, '[data-heart-click="primary"]')).toBe(1);
  const activeSecondaries = await activeHeartNodes(page, '[data-heart-click="secondary"]');
  expect(activeSecondaries).toBeGreaterThanOrEqual(3);
  expect(activeSecondaries).toBeLessThanOrEqual(6);
  const activePrimary = layer.locator('[data-heart-click="primary"][data-active="true"]').first();
  const pulse = await activePrimary.evaluate((node) => {
    const animation = node.getAnimations()[0];
    const frames = (animation.effect as KeyframeEffect).getKeyframes();
    return {
      duration: Number((animation.effect as KeyframeEffect).getTiming().duration),
      transforms: frames.map((frame) => String(frame.transform)),
    };
  });
  expect(pulse.duration).toBeGreaterThanOrEqual(400);
  expect(pulse.duration).toBeLessThanOrEqual(650);
  expect(pulse.transforms.some((transform) => transform.includes('scale(1.32)'))).toBe(true);
  expect(pulse.transforms.some((transform) => transform.includes('scale(0.98)') || transform.includes('scale(.98)'))).toBe(true);

  await page.waitForTimeout(850);
  await page.setViewportSize({ width: 390, height: 844 });
  const hero = page.locator('.hero-scene');
  await hero.dispatchEvent('pointerdown', {
    bubbles: true,
    clientX: 180,
    clientY: 180,
    isPrimary: true,
    pointerId: 7,
    pointerType: 'touch',
  });
  await hero.dispatchEvent('pointerup', {
    bubbles: true,
    clientX: 180,
    clientY: 180,
    isPrimary: true,
    pointerId: 7,
    pointerType: 'touch',
  });
  await expect.poll(() => activeHeartNodes(page, '[data-heart-click="primary"]')).toBe(1);
  const touchSecondaries = await activeHeartNodes(page, '[data-heart-click="secondary"]');
  expect(touchSecondaries).toBeGreaterThanOrEqual(2);
  expect(touchSecondaries).toBeLessThanOrEqual(4);

  await page.waitForTimeout(850);
  const response = page.locator('.response-scene');
  await response.scrollIntoViewIfNeeded();
  const input = response.getByLabel('Họ và tên');
  const box = await input.boundingBox();
  if (!box) throw new Error('RSVP name input has no box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(cursor).toHaveAttribute('data-visible', 'false');
  await expect(page.locator('html')).not.toHaveClass(/heart-cursor-enabled/);
  expect(['auto', 'text']).toContain(await input.evaluate((element) => getComputedStyle(element).cursor));
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(100);
  expect(await activeHeartAnimations(page)).toBe(0);
});

test('keeps heart-pointer work bounded during a 10-second Hero stress pass', async ({ page }) => {
  test.setTimeout(45_000);
  await enterInvitation(page, 'no-preference');
  await expect(page.locator('[data-heart-rain]')).toHaveCount(0, { timeout: 5_000 });

  const metrics = await page.evaluate(async () => {
    const layer = document.querySelector<HTMLElement>('[data-heart-effects]');
    const hero = document.querySelector<HTMLElement>('.hero-scene');
    if (!layer || !hero) throw new Error('Heart effects and Hero must be present for the stress pass.');

    const poolSelector = '[data-heart-ghost], [data-heart-click]';
    const poolBefore = layer.querySelectorAll(poolSelector).length;
    let childListMutations = 0;
    const observer = new MutationObserver((records) => {
      childListMutations += records.filter((record) => record.type === 'childList').length;
    });
    observer.observe(layer, { childList: true, subtree: true });

    const startedAt = performance.now();
    let dispatchedMoves = 0;
    await new Promise<void>((resolve) => {
      const timer = window.setInterval(() => {
        const now = performance.now();
        const progress = Math.min(1, (now - startedAt) / 10_000);
        const clientX = 24 + ((Math.sin(progress * Math.PI * 18) + 1) / 2) * (innerWidth - 48);
        const clientY = 120 + ((Math.cos(progress * Math.PI * 24) + 1) / 2) * Math.min(380, innerHeight - 180);
        hero.dispatchEvent(new PointerEvent('pointermove', {
          bubbles: true,
          clientX,
          clientY,
          isPrimary: true,
          pointerId: 1,
          pointerType: 'mouse',
        }));
        dispatchedMoves += 1;
        if (now - startedAt >= 10_000) {
          window.clearInterval(timer);
          resolve();
        }
      }, 16);
    });

    await new Promise<void>((resolve) => window.setTimeout(resolve, 650));
    observer.disconnect();
    return {
      duration: performance.now() - startedAt,
      dispatchedMoves,
      childListMutations,
      poolBefore,
      poolAfter: layer.querySelectorAll(poolSelector).length,
      activeAnimations: [...layer.querySelectorAll<HTMLElement>(poolSelector)].filter((node) => (
        node.getAnimations().some((animation) => animation.playState === 'running')
      )).length,
    };
  });

  expect(metrics.duration).toBeGreaterThanOrEqual(10_000);
  expect(metrics.dispatchedMoves).toBeGreaterThan(100);
  expect(metrics.poolAfter).toBe(metrics.poolBefore);
  expect(metrics.childListMutations).toBe(0);
  expect(metrics.activeAnimations).toBe(0);
});

test('creates a bounded temporary opening heart rain on desktop and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: /Mở thiệp cưới/ }).click();

  const desktopRain = page.locator('[data-heart-rain]');
  await expect(desktopRain).toHaveCount(1);
  await expect(desktopRain).toHaveAttribute('aria-hidden', 'true');
  await expect(desktopRain.locator('[data-heart-rain-drop]')).toHaveCount(210);
  expect(await desktopRain.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe('none');
  const desktopSizes = await desktopRain.locator('[data-heart-rain-drop]').evaluateAll((drops) => (
    drops.map((drop) => Number.parseFloat(getComputedStyle(drop).width))
  ));
  expect(Math.min(...desktopSizes)).toBeGreaterThanOrEqual(7);
  expect(Math.max(...desktopSizes)).toBeLessThanOrEqual(50);
  await expect(desktopRain).toHaveCount(0, { timeout: 5_000 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?mobile-rain=1');
  await page.getByRole('button', { name: /Mở thiệp cưới/ }).click();
  const mobileRain = page.locator('[data-heart-rain]');
  await expect(mobileRain.locator('[data-heart-rain-drop]')).toHaveCount(120);
  await expect(mobileRain).toHaveCount(0, { timeout: 5_000 });
});

test('disables all romantic heart motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-heart-effects]')).toHaveAttribute('data-reduced-motion', 'true');
  await page.getByRole('button', { name: /Mở thiệp cưới/ }).click();
  await expect(page.locator('.opening')).toHaveCount(0);
  await expect(page.locator('[data-heart-rain]')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/heart-cursor-enabled/);
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
