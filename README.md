# Thiệp cưới Tuấn Hùng × Sao Mai — V2

Thiệp cưới online một trang, mobile-first, xây bằng React, TypeScript và Vite. V2 giữ art direction cưới Việt đương đại (sơn son, giấy ngà, Song Hỷ, hoa sen, nhịp Đông Sơn) nhưng gộp 12 section cũ thành **6 composition** để thiệp đọc như một tấm thiệp được mở ra, không phải landing page. Nội dung vẫn cập nhật tại `src/config/wedding.ts` để thay ảnh, địa điểm, QR, nhạc và backend mà không dựng lại giao diện.

> V2 vẫn dùng ảnh và nội dung mẫu. Không phát hành bản cuối trước khi hoàn tất checklist trong `docs/CONTENT_GUIDE.md` và `QA_REPORT.md`.

## Yêu cầu môi trường

- Node.js 20.19+ hoặc 22.12+ (khuyến nghị dùng Node.js 22 LTS).
- npm 10+.

Repository dùng `package-lock.json`; hãy dùng npm để giữ dependency nhất quán.

## Development

```bash
npm install
npm run dev
```

Vite development server mặc định chạy tại `http://127.0.0.1:5173`.

## Production

```bash
npm run build
npm run preview
```

- `npm run build` chạy TypeScript check trước khi tạo production bundle.
- Kết quả build nằm trong `dist/`.
- Production preview mặc định chạy tại `http://127.0.0.1:4173`.

## Tests và kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Các lệnh bổ sung:

```bash
npm run test:watch
npx playwright install
```

`npx playwright install` chỉ cần khi máy chưa có browser binaries của Playwright. Xem trạng thái thực thi mới nhất trong `QA_REPORT.md`; README này không ngầm xác nhận rằng các kiểm tra đã pass.

## Cấu trúc 6 composition

V2 chỉ còn **6 composition chính**, mỗi composition đứng riêng nhưng khi xem liền mạch như một tấm thiệp:

1. **BÌA THIỆP** (`CoverSection`) — mặt ngoài của tấm thiệp; phi-lacquer đôi cánh mở.
2. **TRANG THIỆP CHÍNH** (`InvitationPageSection`) — hợp nhất lời mời, tên, ngày, calendar mini, countdown; một composition duy nhất.
3. **THÔNG TIN HÔN LỄ** (`CeremonySection`) — hai tấm thiệp con: Nhà Trai và Nhà Gái, side query sắp thứ tự.
4. **CHUYỆN CHÚNG MÌNH** (`StorySection`) — hợp nhất story + gallery thành một photo-story.
5. **XÁC NHẬN THAM DỰ** (`RSVPSection`) — form RSVP 4 lựa chọn (Nhà Gái, Nhà Trai, Cả Hai, Không thể tham dự) + modal Gửi quà mừng nhỏ.
6. **KẾT THIỆP** (`FinaleSection`) — mặt sau cảm xúc, không còn footer riêng.

## Cấu trúc thư mục

```text
src/
  app/                 Error boundary
  components/motion/   Reveal, MaskReveal, GoldReveal, ParallaxLayer
  components/ornaments/ Song Hỷ, hoa sen, Đông Sơn, mây, cánh hoa
  components/ui/       Modal, SectionHeading, WeddingImage
  components/wedding/  Countdown, WeddingCalendar, FloatingControls, GalleryLightbox
  config/wedding.ts    Nguồn dữ liệu đám cưới tập trung (events.brideSide / events.groomSide)
  sections/            6 composition trên
  services/rsvp/       Contract + adapter local
  services/guestbook/  (legacy — đã gộp vào RSVP)
  styles/              tokens, base, components, sections, ornaments, motion, fonts
  types/               WeddingConfig, EventSide, GuestSide
  utils/               guest (name + side), ceremony, calendar, ics, countdown, dateFormat, rsvpValidation, storage
public/
  assets/placeholders/ Ảnh AI tạm thời
docs/                  Hướng dẫn nội dung và tài sản
```

## Thay nội dung nhanh

Chỉnh `weddingConfig` trong `src/config/wedding.ts`:

| Nội dung | Trường cần thay |
| --- | --- |
| Tên chú rể | `couple.groom.firstName`, `couple.groom.fullName` |
| Tên cô dâu | `couple.bride.firstName`, `couple.bride.fullName` |
| Chữ ký / monogram | `couple.signature`, `couple.monogram` |
| Ngày cưới (cover) | `date.iso`, `date.display`, `date.displayLong`, `date.weekday`, `date.lunar*` |
| **Buổi lễ Nhà Gái** | `events.brideSide.*` (date, lunarDate, time, venueName, address, map*, calendar) |
| **Buổi lễ Nhà Trai** | `events.groomSide.*` (date, lunarDate, time, venueName, address, map*, calendar) |
| Calendar ICS từng bên | `events.{side}.calendar.eventStartIso` / `eventEndIso` (rỗng = all-day) |
| Ảnh hero / chân dung | `hero`, `couple.groom.portrait`, `couple.bride.portrait` |
| Ảnh câu chuyện | `story[n].image` |
| Gallery | `gallery[n]` |
| QR Nhà Trai / Nhà Gái | `gift.groom`, `gift.bride` (label, ngân hàng, tài khoản, QR) |
| Nhạc | `music.title`, `music.artist`, `music.src` |
| Câu chuyện | Mảng `story` |
| Lời dẫn / headings | Nhóm `copy` |
| Metadata / social preview | `seo` |

`src/config/wedding.ts` dùng `satisfies WeddingConfig`, vì vậy lỗi thiếu trường hoặc sai kiểu sẽ được phát hiện bởi `npm run typecheck`.

## Cá nhân hoá khách mời

### Theo tên

```text
https://domain-cua-ban.vn/?guest=Nguyen%20Van%20An
https://domain-cua-ban.vn/?guest=Nguy%E1%BB%85n%20V%C4%83n%20An
```

Tạo link bằng JavaScript để mã hoá đúng Unicode:

```js
const url = `${location.origin}/?guest=${encodeURIComponent('Nguyễn Văn An')}`
```

### Theo phía lễ

```text
/?guest=Nguyen%20Van%20An&side=groom     → Nhà Trai lên trước
/?guest=Nguyen%20Van%20An&side=bride     → Nhà Gái lên trước
/?guest=Nguyen%20Van%20An&side=both      → ngang nhau (mặc định)
```

Allowed values: `groom`, `bride`, `both`. Bất kỳ giá trị nào khác fallback `both`. Tên phía tiếng Việt (`nhà trai`, `nhà gái`, `cả hai`) cũng được chấp nhận.

Side query kết hợp:
- **Ceremony cards**: sắp xếp Nhà Trai trước khi `side=groom`, Nhà Gái trước khi `side=bride`, ngang hàng khi `side=both`. Card khớp được nhấn nhẹ bằng đổ bóng.
- **RSVP form**: prefill lựa chọn "Nhà Trai" / "Nhà Gái" / không chọn (với `both`). Khách vẫn có thể đổi.
- **Tên khách**: prefill ô Họ tên.

Tên khách đọc bởi `getGuestNameFromUrl()`, chuẩn hoá khoảng trắng, loại control characters và giới hạn 80 ký tự. Side đọc bởi `getGuestSideFromUrl()`. Query parameter không phải cơ chế bảo mật.

## RSVP và Gift

V2 gộp RSVP + Guestbook vào một form. Từng khách có thể vừa xác nhận tham dự, vừa gửi lời chúc. Gift không còn là section — chỉ là một nút nhỏ trong khu vực RSVP mở modal quà mừng.

Adapter local vẫn ở `src/services/rsvp/localRSVPService.ts`, key `wedding_v1_rsvp`. Dữ liệu chỉ nằm trong `localStorage` của đúng browser/device, không đồng bộ tới cô dâu/chú rể. Đây là chế độ demo, không phải backend production.

Để nối API mà không đổi UI:

1. Tạo adapter mới triển khai `RSVPService` từ `src/services/rsvp/types.ts`.
2. Giữ nguyên contract trả về, validation và trạng thái lỗi rõ ràng.
3. Đổi export duy nhất trong `src/services/rsvp/index.ts` sang adapter mới.
4. Thêm unit/component/E2E tests cho success, validation, lỗi mạng và submit lặp.
5. Không đặt API secret trong frontend. Biến `VITE_*` sẽ được đóng gói công khai; secret và xác thực quản trị phải nằm ở server.

## Feature flags

```ts
features: {
  music: true,
  rsvp: true,
  wish: true,        // legacy — không còn render section riêng
  gift: true,
  personalizedGuest: true,
  gallery: true,
}
```

- `music` chỉ hiện control nếu `music.src` cũng có giá trị.
- `gift` cần đồng thời `features.gift` và `gift.enabled` là `true`.
- `gallery` không render nếu mảng `gallery` rỗng.

## Privacy và search indexing

V2 mặc định yêu cầu crawler không lập chỉ mục bằng `weddingConfig.seo.robots`:

```html
<meta name="robots" content="noindex, nofollow" />
```

`public/robots.txt` vẫn dùng `Allow: /` để crawler có thể tải HTML và tài sản phục vụ social preview. Muốn public cho công cụ tìm kiếm:

1. Xác nhận đã thay toàn bộ placeholder, địa chỉ, QR và dữ liệu gia đình.
2. Đổi `weddingConfig.seo.robots` thành `index, follow`.
3. Cập nhật `seo.title`, `seo.description`, `seo.image` và điền domain HTTPS tuyệt đối vào `seo.siteUrl`.
4. Build lại, kiểm tra metadata đã sinh trong `dist/index.html`.

`noindex` không chặn người lạ truy cập. Nếu cần riêng tư thật, cấu hình password/access control tại nền tảng hosting.

## Static deployment

Vite đặt riêng file build có hash trong `/assets/vite/*`; chỉ thư mục này nhận cache một năm với `immutable` qua `netlify.toml`. Ảnh tĩnh giữ tên trong `public/assets` không bị áp chính sách đó. `/` và `/index.html` luôn revalidate.

### Netlify

- Cấu hình production đã nằm trong `netlify.toml`: chạy `npm run build`, publish `dist` bằng Node.js 22.
- Không có SPA rewrite `/* -> /index.html`: ứng dụng chỉ có trang gốc và query `?guest=...&side=...`, không dùng client-side router.
- Trong **Site configuration → Environment variables**, đặt `VITE_SITE_URL` thành custom domain HTTPS, ví dụ `https://thiep.example.vn/`, rồi deploy lại. Không hardcode URL `*.netlify.app` vào repository.

### Vercel

- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.

### Cloudflare Pages

- Framework preset: Vite.
- Build command: `npm run build`.
- Build output directory: `dist`.

Project hiện dùng Vite `base` mặc định `/`, phù hợp khi deploy ở root domain.

## Trước khi phát hành bản cuối

- Thay toàn bộ ảnh AI trong `docs/PLACEHOLDER_ASSETS.md` bằng ảnh có quyền sử dụng.
- Điền địa điểm, giờ thật, QR/tài khoản, nhạc và câu chuyện đã được xác nhận cho cả Nhà Trai và Nhà Gái.
- Cập nhật nhóm `seo`, favicon và kiểm tra social preview trên domain phát hành.
- Nối backend nếu RSVP cần thu thập tập trung.
- Kiểm tra privacy, quyền truy cập và consent phù hợp.
- Chạy toàn bộ QA và ghi kết quả thật vào `QA_REPORT.md`.
