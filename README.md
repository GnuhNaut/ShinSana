# Thiệp cưới Tuấn Hùng × Sao Mai — V1.1

Thiệp cưới một trang, mobile-first, xây dựng bằng React, TypeScript và Vite. V1.1 dùng art direction cưới Việt đương đại với sơn son, giấy ngà, Song Hỷ, hoa sen và nhịp Đông Sơn; nội dung riêng vẫn được gom tại `src/config/wedding.ts` để thay ảnh thật, địa điểm, QR, nhạc và backend mà không dựng lại giao diện.

> V1.1 hiện vẫn chứa ảnh và nội dung mẫu. Không phát hành bản cuối trước khi hoàn tất checklist trong `docs/PLACEHOLDER_ASSETS.md` và `QA_REPORT.md`.

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

## Kiến trúc chính

```text
src/
  app/                 Error boundary và application shell
  components/ui/       Thành phần giao diện dùng lại
  components/wedding/  Calendar, countdown, lightbox, controls
  config/wedding.ts    Nguồn dữ liệu đám cưới tập trung
  sections/            Các chương của trang thiệp
  services/rsvp/       Contract và adapter RSVP
  services/guestbook/  Contract và adapter lời chúc
  styles/              Tokens, component, section, responsive CSS
  types/               Kiểu dữ liệu config
  utils/               Guest URL, ICS, calendar, countdown, storage
public/
  assets/placeholders/ Ảnh AI tạm thời
docs/                  Hướng dẫn nội dung và tài sản
```

`src/config/wedding.ts` dùng `satisfies WeddingConfig`, vì vậy lỗi thiếu trường hoặc sai kiểu sẽ được phát hiện bởi `npm run typecheck`.

## Thay nội dung nhanh

Chỉnh `weddingConfig` trong `src/config/wedding.ts`:

| Nội dung | Trường cần thay |
| --- | --- |
| Tên chú rể | `couple.groom.firstName`, `couple.groom.fullName` |
| Tên cô dâu | `couple.bride.firstName`, `couple.bride.fullName` |
| Chữ ký / monogram | `couple.signature`, `couple.monogram` |
| Ngày cưới | Toàn bộ nhóm `date`, đặc biệt `iso`, `countdownIso`, `display`, `displayLong`, `weekday` |
| Giờ sự kiện trong lịch | `date.eventStartIso`, `date.eventEndIso` — điền cả hai hoặc để cả hai rỗng |
| Ngày âm lịch | `date.lunar`, `date.lunarLong` — nhập dữ liệu đã được xác nhận, không tự suy diễn |
| Ảnh hero / chân dung | `hero`, `couple.groom.portrait`, `couple.bride.portrait` |
| Địa điểm | `venue.name`, `venue.address` |
| Bản đồ nhúng / nút chỉ đường | `venue.mapEmbedUrl`, `venue.mapNavigationUrl` |
| QR và tài khoản | `gift.groom`, `gift.bride` |
| Nhạc | `music.title`, `music.artist`, `music.src` |
| Câu chuyện | Mảng `story` |
| Gallery | Mảng `gallery` |
| Nội dung chữ | Nhóm `copy` và `sampleWishes` |
| Metadata / social preview | Nhóm `seo`, đặc biệt `title`, `description`, `image`, `robots`, `siteUrl` |

Ảnh, nhạc và QR đặt dưới `public/assets/`, sau đó dùng đường dẫn bắt đầu bằng `/assets/...` trong config. Hướng dẫn từng bước dành cho người không chuyên React nằm tại `docs/CONTENT_GUIDE.md`.

Hai lưu ý hiện tại:

- `venue.mapEmbedUrl` render iframe bản đồ, còn `venue.mapNavigationUrl` điều khiển nút “Chỉ đường”. Chỉ URL HTTPS hợp lệ mới được dùng; giá trị rỗng hoặc không an toàn sẽ rơi về empty/disabled state.
- Plugin `wedding-config-metadata` trong `vite.config.ts` đưa dữ liệu từ `weddingConfig` vào `<head>` và nội dung `noscript` khi dev/build. Không sửa các token trong `index.html`; hãy cập nhật nhóm `seo`. Khi build, `VITE_SITE_URL` (nếu có) được ưu tiên trước `seo.siteUrl` để sinh canonical, `og:url` và URL tuyệt đối cho ảnh social.

## Feature flags

Các section có thể bật/tắt tại `weddingConfig.features`:

```ts
features: {
  music: true,
  rsvp: true,
  guestbook: true,
  gift: true,
  personalizedGuest: true,
  gallery: true,
}
```

- `music` chỉ hiện control nếu `music.src` cũng có giá trị.
- `gift` cần đồng thời `features.gift` và `gift.enabled` là `true`.
- `gallery` không render nếu mảng `gallery` rỗng.
- Tắt flag sẽ bỏ section tương ứng mà không cần xóa component.

Sau mỗi thay đổi flag, chạy `npm run typecheck`, `npm run build` và xem lại nhịp chuyển section trên mobile lẫn desktop.

## Guest URL cá nhân hóa

Thêm query parameter `guest` vào URL:

```text
https://example.com/?guest=Nguyen%20Van%20An
https://example.com/?guest=Nguy%E1%BB%85n%20V%C4%83n%20An
```

Tạo link bằng JavaScript để mã hóa đúng Unicode:

```js
const url = `${location.origin}/?guest=${encodeURIComponent('Nguyễn Văn An')}`
```

Tên khách được đọc bởi `getGuestNameFromUrl()`, chuẩn hóa khoảng trắng, loại control characters và giới hạn 80 ký tự. Nếu URL lỗi hoặc không có tên, thiệp dùng lời mời chung. `personalizedGuest: false` tắt hiển thị cá nhân hóa.

Query parameter không phải cơ chế bảo mật: tên có thể xuất hiện trong lịch sử duyệt web, log hoặc khi chia sẻ link. Không đặt thông tin nhạy cảm trong URL.

## RSVP và Guestbook

V1.1 vẫn dùng adapter local tương thích V1:

- RSVP: `src/services/rsvp/localRSVPService.ts`, key `wedding_v1_rsvp`.
- Guestbook: `src/services/guestbook/localGuestbookService.ts`, key `wedding_v1_wishes`.

Dữ liệu chỉ nằm trong `localStorage` của đúng browser/device, không đồng bộ tới cô dâu/chú rể và có thể mất khi người dùng xóa dữ liệu trình duyệt. Đây là chế độ demo, không phải backend production.

Để nối API mà không đổi UI:

1. Tạo adapter mới triển khai `RSVPService` từ `src/services/rsvp/types.ts` và/hoặc `GuestbookService` từ `src/services/guestbook/types.ts`.
2. Giữ nguyên contract trả về, validation và trạng thái lỗi rõ ràng.
3. Đổi export duy nhất trong `src/services/rsvp/index.ts` và/hoặc `src/services/guestbook/index.ts` sang adapter mới.
4. Thêm unit/component/E2E tests cho success, validation, lỗi mạng và submit lặp.
5. Không đặt API secret trong frontend. Biến `VITE_*` sẽ được đóng gói công khai; secret và xác thực quản trị phải nằm ở server.

Ví dụ điểm chuyển adapter:

```ts
// src/services/rsvp/index.ts
export { rsvpService } from './apiRSVPService'

// src/services/guestbook/index.ts
export { guestbookService } from './apiGuestbookService'
```

## Privacy và search indexing

V1.1 mặc định yêu cầu crawler không lập chỉ mục bằng metadata được sinh từ `weddingConfig.seo.robots`:

```html
<meta name="robots" content="noindex, nofollow" />
```

`public/robots.txt` vẫn dùng `Allow: /` để crawler có thể tải HTML và tài sản phục vụ social preview; chỉ thị `noindex` trong HTML mới yêu cầu công cụ tìm kiếm không đưa trang vào chỉ mục. Muốn public cho công cụ tìm kiếm:

1. Xác nhận đã thay toàn bộ placeholder, địa chỉ, QR và dữ liệu gia đình.
2. Đổi `weddingConfig.seo.robots` thành giá trị phù hợp, ví dụ `index, follow`.
3. Cập nhật `seo.title`, `seo.description`, `seo.image` và điền domain HTTPS tuyệt đối vào `seo.siteUrl`.
4. Build lại, kiểm tra metadata đã sinh trong `dist/index.html` và xác minh host/CDN không gửi header `X-Robots-Tag: noindex`.

`noindex` không chặn người lạ truy cập. Bất kỳ nội dung nào build vào site tĩnh—kể cả số tài khoản—đều có thể được xem bởi người có URL. Nếu cần riêng tư thật, cấu hình password/access control tại nền tảng hosting.

## Static deployment

Ứng dụng không có server runtime và có thể deploy nguyên thư mục `dist/`. Query `?guest=...` hoạt động trên static hosting; V1.1 không dùng client-side router nên không cần rewrite riêng cho route con.

### Vercel

- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Install command: `npm install` hoặc mặc định của Vercel.

### Netlify

- Cấu hình production đã nằm trong `netlify.toml`: chạy `npm run build`, publish `dist` bằng Node.js 22.
- Không có SPA rewrite `/* -> /index.html`: ứng dụng chỉ có trang gốc và query `?guest=...`, không dùng client-side router. Điều này cũng tránh biến URL asset không tồn tại thành HTML với status 200.
- Vite đặt riêng file build có hash trong `/assets/vite/*`; chỉ thư mục này nhận cache một năm với `immutable`. Ảnh tĩnh giữ tên trong `public/assets` không bị áp chính sách đó. `/` và `/index.html` luôn revalidate, không nhận cache immutable.
- Trong **Site configuration → Environment variables**, đặt `VITE_SITE_URL` thành custom domain HTTPS, ví dụ `https://thiep.example.vn/`, rồi deploy lại. Không hardcode URL `*.netlify.app` vào repository.
- Thứ tự chọn domain khi build là `VITE_SITE_URL` không rỗng → `weddingConfig.seo.siteUrl` → để trống. Khi để trống, fallback hiện tại vẫn hoạt động: không sinh canonical/`og:url` và giữ đường dẫn ảnh social tương đối.
- `VITE_*` được đóng gói công khai vào frontend; chỉ dùng biến này cho public site URL, tuyệt đối không lưu secret.

Sau deploy, mở custom domain HTTPS và kiểm tra source HTML có canonical, `og:url`, `og:image` và `twitter:image` tuyệt đối đúng domain. Netlify chỉ áp dụng giá trị environment mới từ lần deploy tiếp theo.

### Cloudflare Pages

- Framework preset: Vite.
- Build command: `npm run build`.
- Build output directory: `dist`.

Project hiện dùng Vite `base` mặc định `/`, phù hợp khi deploy ở root domain. Nếu deploy dưới subpath như `example.com/wedding/`, cần đặt `base: '/wedding/'` trong `vite.config.ts`, build lại và kiểm tra mọi asset/guest URL. Production sourcemap mặc định được tắt.

## Trước khi phát hành bản cuối

- Thay toàn bộ ảnh AI trong `docs/PLACEHOLDER_ASSETS.md` bằng ảnh có quyền sử dụng.
- Điền địa điểm, giờ thật, QR/tài khoản, nhạc và câu chuyện đã được xác nhận.
- Cập nhật nhóm `seo`, favicon và kiểm tra social preview trên domain phát hành.
- Nối backend nếu RSVP/lời chúc cần thu thập tập trung.
- Kiểm tra privacy, quyền truy cập và consent phù hợp.
- Chạy toàn bộ QA và ghi kết quả thật vào `QA_REPORT.md`; không suy đoán trạng thái PASS.
