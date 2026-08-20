# QA Report — Premium Wedding Invitation

Ngày kiểm tra: 20/08/2026 · `Asia/Ho_Chi_Minh`

## Automated gates

| Gate | Kết quả |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS — TypeScript strict |
| `npm run test` | PASS — 62/62, 9 files |
| `npm run build` | PASS |
| `npm run test:e2e` | PASS — 18/18 executed, 6 intentional cross-project skips |

E2E chạy trên Chromium desktop, Pixel 5 Chromium, WebKit desktop và iPhone 13 WebKit. Luồng kiểm tra gồm cover, tên/ngày, guest URL, RSVP invalid/valid + local persistence, gallery keyboard/lightbox, nội dung optional bị ẩn khi chưa có dữ liệu, console/resource errors và horizontal overflow ở 360/375/390/412/430/768/1024/1440px.

## Lighthouse mobile

Ba lần đo trên production preview, median:

| Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 98 | 100 | 100 | 100 | 2.26s | 0ms | 0.000 |

Raw reports: `artifacts/lighthouse/mobile-1.json` đến `mobile-3.json`.

## Visual QA

- BEFORE và AFTER đều có cover + full-page tại đúng 360×800, 390×844, 430×932, 768×1024, 1024×768 và 1440×900.
- Không có horizontal scroll; tên, ngày và CTA rõ ở mọi viewport.
- Crop ảnh giữ được khuôn mặt trên mobile; desktop không kéo nội dung quá rộng.
- Hồng được tăng theo lớp: ivory/blush nền, rose cho điểm nhấn, burgundy cho hierarchy; không tăng saturation toàn màn hình.
- Luồng sau khi mở gồm lời mời, ngày cưới, gallery, RSVP và lời cảm ơn; event/map/gift/music chưa có dữ liệu đều không xuất hiện.

Screenshots: `artifacts/screenshots/before/` và `artifacts/screenshots/after/`.

## Runtime contract

- RSVP hiện dùng `local-demo`; dữ liệu chỉ ở `localStorage`, không được mô tả như đã gửi cho gia đình.
- Event, phụ huynh, map, gift/QR và music được render có điều kiện từ typed config.
- Canonical và `og:url` chỉ được tạo khi có `VITE_SITE_URL`; không tự bịa domain.
- Ảnh hiện tại là placeholder AI/local, không đại diện cho Tuấn Hùng và Sao Mai.
