# Thiệp cưới Tuấn Hùng & Sao Mai

Thiệp cưới online mobile-first bằng React, TypeScript và Vite. Art direction: **Romantic Vietnamese Blush / Rose** — giấy ngà, blush/rose có tầng, burgundy làm focal point, champagne dùng tiết chế, hình ảnh và ornament Việt Nam đương đại.

> Đây là bản prototype hoàn chỉnh về UI/UX nhưng vẫn dùng ảnh AI placeholder và dữ liệu RSVP local-demo. Không phát hành như bản cuối trước khi hoàn thành checklist trong `docs/CONTENT_GUIDE.md` và `docs/PLACEHOLDER_ASSETS.md`.

## Chạy project

Yêu cầu Node.js 20.19+ hoặc 22.12+ và npm 10+.

```bash
npm install
npm run dev
```

Production-like:

```bash
npm run build
npm run preview
```

## Demo preview đầy đủ dữ liệu

Mở `http://localhost:5173/?demo=1` khi chạy dev, hoặc `http://localhost:4173/?demo=1` khi chạy preview. Chế độ này tải riêng `src/config/wedding.demo.ts`, hiển thị badge `DEMO PREVIEW` và đặt robots runtime thành `noindex, nofollow`.

URL `/`, `?demo=0` và mọi URL không có đúng tham số `demo=1` luôn dùng `src/config/wedding.ts`. Demo được tách thành lazy chunk; dữ liệu mẫu không nằm trong HTML hay entry JavaScript mặc định và không thay metadata/canonical production.

QA:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Stack

- React 19 + TypeScript strict + Vite 8; SPA không router/global state.
- CSS custom properties, mobile-first; Cormorant Garamond + Manrope tự host, Vietnamese subset.
- Vitest + Testing Library + Playwright.
- RSVP qua `RSVPService`; adapter mặc định lưu `localStorage` trên đúng thiết bị.
- Metadata được Vite chèn vào HTML lúc build, không phụ thuộc React runtime.

## Sáu nhịp trải nghiệm

1. Cover ảnh điện ảnh + paper invitation.
2. Lời kính mời/gia đình conditional + tên cặp đôi.
3. Ngày cưới, calendar, countdown và “Thông tin hôn lễ” conditional: giờ, địa chỉ, chỉ đường, liên hệ và gửi xe.
4. Lời chuyện ngắn + gallery editorial 4 ảnh/lightbox.
5. RSVP Có/Không, party size conditional, lời nhắn; Gift chỉ hiện khi có dữ liệu thật.
6. Closing full-bleed.

## Nội dung tập trung

Chỉ sửa `src/config/wedding.ts` để thay tên, bố mẹ, ngày, sự kiện, giờ, địa điểm, phone, Maps, gửi xe, ảnh, story, QR, nhạc và SEO. Schema nằm ở `src/types/wedding.ts`.

`events` là mảng linh hoạt 0–3+ phần tử, không có `enabled` hoặc template rỗng. Hiện `events: []`, thông tin gia đình chưa có và `gift: { enabled: false, accounts: [] }`, nên toàn bộ UI tương ứng được ẩn. Không render “chưa cập nhật”, map giả, CTA disabled hoặc QR giả. Xem schema và ví dụ placeholder rõ ràng tại [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md). Không sao chép dữ liệu từ `wedding.demo.ts` sang production.

## Cá nhân hóa

```text
/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A
/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A&side=groom
```

`guest` được normalize/sanitize như text, giới hạn 80 ký tự. `side=bride|groom|both` ưu tiên thứ tự event phù hợp khi có nhiều lễ; nội dung từng event vẫn đến hoàn toàn từ config.

## RSVP

`src/services/rsvp/types.ts` là contract. `localRSVPService.ts` có `mode: 'local-demo'`, không đồng bộ dữ liệu tới gia đình. Để dùng production, thay export trong `src/services/rsvp/index.ts` bằng adapter remote cùng interface; không đặt secret trong frontend.

## Ảnh và social preview

- Ảnh placeholder local có responsive WebP, dimensions/aspect ratio và lazy-load dưới fold.
- Cover hero eager + `fetchpriority=high` + preload responsive.
- `public/assets/social-preview.jpg`: 1200×630, 153 KB; dùng cho OG/Zalo/Facebook/Twitter.
- Provenance và checklist thay ảnh: [docs/PLACEHOLDER_ASSETS.md](docs/PLACEHOLDER_ASSETS.md).

## Deploy

Build output là `dist/`; Netlify config có sẵn. Khi có domain thật, đặt `VITE_SITE_URL=https://domain-that.vn/` để Vite sinh canonical, `og:url` và URL social image tuyệt đối. Không có domain thì source cố ý không bịa URL.

## Tài liệu

- [Design audit BEFORE](docs/design-audit.md)
- [Hướng dẫn nội dung](docs/CONTENT_GUIDE.md)
- [Placeholder assets](docs/PLACEHOLDER_ASSETS.md)
- `QA_REPORT.md`: kết quả kiểm thử cuối cùng của lần polish gần nhất.
