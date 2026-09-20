import { expect, test, type Page } from '@playwright/test';

async function openInvitation(page: Page, url = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await page.getByRole('button', { name: /Mở thiệp cưới/ }).click();
  await expect(page.locator('.opening')).toHaveCount(0);
}

test('personalizes the invitation and filters ceremonies for every side', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?guest=Nguyen%20Van%20A&side=groom');
  await expect(page.getByText('Trân trọng kính mời', { exact: true })).toBeVisible();
  await expect(page.getByText('Nguyen Van A', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Mở thiệp cưới/ }).click();
  await expect(page.locator('.opening')).toHaveCount(0);

  const groomCeremony = page.getByTestId('ceremony');
  await expect(groomCeremony.getByText('NHÀ TRAI', { exact: true })).toBeVisible();
  await expect(groomCeremony.getByText('NHÀ GÁI', { exact: true })).toHaveCount(0);
  await expect(page.locator('.gift-envelope-caption')).toHaveText(['NHÀ TRAI', 'NHÀ GÁI']);

  await openInvitation(page, '/?side=bride');
  await expect(page.getByTestId('ceremony').getByText('NHÀ GÁI', { exact: true })).toBeVisible();
  await expect(page.getByTestId('ceremony').getByText('NHÀ TRAI', { exact: true })).toHaveCount(0);
  await expect(page.locator('.red-envelope').nth(1)).toHaveClass(/is-preferred/);

  await openInvitation(page, '/?side=invalid');
  await expect(page.locator('.venue-panel')).toHaveCount(2);
});

test('opens an accessible venue map, traps focus, copies, and restores focus', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as Window & { __copiedAddress?: string }).__copiedAddress = value;
        },
      },
    });
  });
  await openInvitation(page, '/?side=both');
  const panel = page.locator('.venue-panel').first();
  await panel.click();

  const dialog = page.getByRole('dialog', { name: /Lễ Thành Hôn/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('iframe')).toHaveAttribute('src', /maps\.google\.com/);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

  const close = dialog.getByRole('button', { name: 'Đóng bản đồ' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Sao chép địa chỉ' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await dialog.getByRole('button', { name: 'Sao chép địa chỉ' }).click();
  await expect(dialog.getByRole('button', { name: 'Đã sao chép' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Chỉ đường/ })).toHaveAttribute('target', '_blank');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(panel).toBeFocused();
});

test('supports gallery keyboard, continuous drag, viewer controls, and focus return', async ({ page }) => {
  await openInvitation(page);
  const galleryScene = page.locator('.gallery-scene');
  await galleryScene.scrollIntoViewIfNeeded();
  const active = galleryScene.locator('.gallery-slide--active');
  await expect(active).toBeVisible();
  await active.focus();
  await page.keyboard.press('ArrowRight');
  await expect(galleryScene.locator('.gallery-counter strong')).toHaveText('02');

  const box = await galleryScene.locator('.gallery-stage').boundingBox();
  if (!box) throw new Error('Gallery stage has no box');
  await page.mouse.move(box.x + box.width * .62, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .28, box.y + box.height * .5, { steps: 6 });
  await page.mouse.up();
  await expect(galleryScene.locator('.gallery-counter strong')).toHaveText('03');
  await expect(page.getByRole('dialog', { name: /Ảnh 3 trên/ })).toHaveCount(0);

  await page.waitForTimeout(500);
  await galleryScene.locator('.gallery-slide--active').click();
  const viewer = page.locator('.viewer');
  await expect(viewer).toBeVisible();
  await expect(viewer).toHaveAttribute('aria-label', /Ảnh 3 trên/);
  await expect(viewer.locator('figure img')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(viewer).toHaveAttribute('aria-label', /Ảnh 4 trên/);
  await page.keyboard.press('ArrowLeft');
  await expect(viewer).toHaveAttribute('aria-label', /Ảnh 3 trên/);
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(galleryScene.locator('.gallery-slide--active')).toBeFocused();
});

test('keeps response failures honest and opens both gift packets without a fake QR', async ({ page }) => {
  await openInvitation(page, '/?side=bride');
  const response = page.locator('.response-scene');
  await response.scrollIntoViewIfNeeded();
  await response.getByLabel('Họ và tên').fill('Nguyễn Văn A');
  await response.getByRole('button', { name: /GỬI XÁC NHẬN/ }).click();
  await expect(response.locator('.form-state[role="status"]')).toContainText('Dịch vụ đang được kết nối');

  await response.getByRole('button', { name: /GỬI LỜI CHÚC/ }).click();
  await expect(response.getByLabel('Lời chúc của bạn')).toBeVisible();

  const gift = page.locator('.gift-scene');
  await gift.scrollIntoViewIfNeeded();
  await expect(gift.locator('.red-envelope')).toHaveCount(2);
  await gift.locator('.red-envelope').nth(1).click();
  await expect(gift.locator('.red-envelope').nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(gift.locator('.qr-empty')).toContainText('ĐANG CẬP NHẬT');
  await expect(gift.getByRole('button', { name: /Sao chép/ })).toBeDisabled();
  await expect(page.locator('.music-control')).toBeEnabled();
  await expect(page.locator('audio')).toHaveAttribute('preload', 'none');
});

test('fits the smallest viewport and keeps reduced-motion functionality', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openInvitation(page, '/?guest=%3Cb%3ELong%20Guest%20Name%3C%2Fb%3E&side=other');
  await expect(page.locator('.venue-panel')).toHaveCount(2);
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.locator('.hero-scene__date')).toBeInViewport();
});
