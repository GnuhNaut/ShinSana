# Hướng dẫn thay nội dung thiệp cưới

Tài liệu này dành cho người cập nhật nội dung, kể cả khi không chuyên React. Phần lớn thay đổi chỉ cần chỉnh một file:

```text
src/config/wedding.ts
```

Giữ nguyên dấu phẩy, dấu nháy và tên trường. Sau khi sửa, luôn chạy:

```bash
npm run typecheck
npm run build
```

Nếu TypeScript báo lỗi, kiểm tra lại dấu nháy, dấu phẩy, trường bị thiếu và kiểu dữ liệu trước khi phát hành.

## 1. Thay tên cô dâu/chú rể

Tìm nhóm `couple`:

```ts
couple: {
  groom: {
    firstName: 'Hùng',
    fullName: 'Tuấn Hùng',
    // ...
  },
  bride: {
    firstName: 'Mai',
    fullName: 'Sao Mai',
    // ...
  },
  signature: 'Hùng & Mai',
  monogram: 'H × M',
},
```

Thay đồng thời `firstName`, `fullName`, `signature` và `monogram`. Nếu title hoặc description đang chứa tên hai bạn, cập nhật thêm nhóm `seo`; Vite sẽ đưa metadata từ config vào `<head>` khi dev/build.

## 2. Thay ngày cưới và ngày âm lịch

Tìm nhóm `date` và cập nhật tất cả cách hiển thị:

```ts
date: {
  iso: '2026-10-19',
  countdownIso: '2026-10-19T00:00:00+07:00',
  eventStartIso: '',
  eventEndIso: '',
  display: '19.10.2026',
  displayLong: '19 tháng 10 năm 2026',
  weekday: 'Thứ Hai',
  lunar: '10/09 âm lịch',
  lunarLong: '10 tháng 09 âm lịch',
  timezone: 'Asia/Ho_Chi_Minh',
},
```

- `iso` dùng định dạng `YYYY-MM-DD`. Khi `eventStartIso` và `eventEndIso` cùng để rỗng, file `.ics` tạo sự kiện cả ngày từ ngày này.
- `countdownIso` cần cả giờ và UTC offset. Khi có giờ cưới thật, nhập chính xác; không tự đổi timezone.
- Muốn file `.ics` có giờ bắt đầu/kết thúc, điền **cả hai** `eventStartIso` và `eventEndIso` theo ISO 8601 kèm UTC offset, ví dụ `2026-10-19T18:00:00+07:00` và `2026-10-19T21:00:00+07:00`. Không chỉ điền một trường.
- Ngày âm lịch phải do gia đình xác nhận. Website không tự tính.
- Calendar, nhãn tháng/năm tiếng Anh và ngày ở đoạn kết được sinh từ `date.iso`; vẫn cần kiểm tra lại calendar và visual QA sau khi đổi ngày.

Tên file tải `.ics` cũng được sinh từ `date.iso`. Nếu `seo.title` hoặc `seo.description` có ghi ngày, cập nhật các trường đó rồi build lại để metadata đồng bộ.

## 3. Muốn thay ảnh cưới ở đâu?

### Cách đơn giản nhất: giữ nguyên tên file

Thay sáu file trong `public/assets/placeholders/` bằng ảnh WebP thật cùng tên:

```text
hero.webp
couple-groom.webp
couple-bride.webp
story-01.webp
story-02.webp
gallery-detail.webp
```

Cách này không cần sửa đường dẫn, nhưng vẫn cần cập nhật `alt`, `aspectRatio` và `objectPosition` trong config cho đúng ảnh thật. Xem đầy đủ nguồn gốc và nơi sử dụng trong `docs/PLACEHOLDER_ASSETS.md`.

### Cách khuyến nghị: tách ảnh thật khỏi placeholder

1. Tạo thư mục `public/assets/images/`.
2. Chép ảnh đã tối ưu vào đó, ví dụ `public/assets/images/hero.webp`.
3. Trong config, đổi `src` thành `/assets/images/hero.webp`.
4. Viết `alt` mô tả nội dung ảnh; không dùng tên file làm alt.
5. Chỉnh `aspectRatio` (ví dụ `'4 / 5'`, `'3 / 2'`, `'16 / 10'`) và `objectPosition` (ví dụ `'50% 40%'`) để crop đúng chủ thể.

Các điểm ảnh chính:

| Vị trí | Trường config |
| --- | --- |
| Hero | `hero` |
| Chân dung chú rể | `couple.groom.portrait` |
| Chân dung cô dâu | `couple.bride.portrait` |
| Ảnh câu chuyện | `story[n].image` |
| Gallery | `gallery[n]` |
| Ảnh social | `seo.image` — Vite dùng trường này cho `og:image` và `twitter:image` |

Ảnh hero được ưu tiên tải; các ảnh phía dưới lazy-load. Nên dùng WebP/AVIF, đúng kích thước hiển thị, tránh ảnh gốc hàng chục MB. Không hotlink Drive/Instagram và chỉ dùng ảnh có quyền phát hành.

## 4. Muốn thay địa điểm ở đâu?

Tìm nhóm `venue`:

```ts
venue: {
  name: 'Tên địa điểm đã xác nhận',
  address: 'Địa chỉ đầy đủ đã xác nhận',
  mapEmbedUrl: '',
  mapNavigationUrl: 'https://maps.google.com/...',
},
```

- `name` và `address` hiện thông tin địa điểm và được đưa vào file lịch.
- `mapNavigationUrl` mở nút “Chỉ đường” trong tab mới. Dùng link HTTPS do Google Maps/Apple Maps cung cấp và kiểm tra trên điện thoại.
- `mapEmbedUrl` render iframe bản đồ lazy-load trong section địa điểm. Dùng URL nhúng HTTPS do nhà cung cấp bản đồ cấp; URL rỗng, sai định dạng hoặc không dùng HTTPS sẽ không được render.
- Khi chưa có dữ liệu thật, để chuỗi rỗng; website sẽ dùng empty state. Không điền địa chỉ giả.

Cập nhật `copy.detailsNote` nếu lời nhắn “sẽ cập nhật” không còn phù hợp.

## 5. Muốn thay QR và thông tin quà mừng ở đâu?

1. Lưu QR thật trong `public/assets/images/`, ví dụ:

```text
public/assets/images/qr-groom.webp
public/assets/images/qr-bride.webp
```

2. Điền nhóm `gift`:

```ts
gift: {
  enabled: true,
  groom: {
    label: 'Chú rể',
    bankName: 'Tên ngân hàng',
    accountName: 'TÊN CHỦ TÀI KHOẢN',
    accountNumber: 'Số tài khoản',
    qrImage: '/assets/images/qr-groom.webp',
  },
  bride: {
    // các trường tương tự
  },
},
```

3. Giữ `features.gift: true` nếu muốn hiện section. Muốn ẩn hoàn toàn, đặt `features.gift: false` hoặc `gift.enabled: false`.

Đối chiếu từng ký tự với gia đình và quét thử QR bằng ít nhất hai thiết bị. Dữ liệu này được đóng gói công khai trong static JavaScript; modal không phải lớp bảo mật.

## 6. Muốn thay câu chuyện ở đâu?

Tìm mảng `story`. Mỗi phần có cấu trúc:

```ts
{
  chapter: 'Chapter 01',
  year: 'Khởi đầu',
  title: 'Tiêu đề thật',
  description: 'Câu chuyện đã được hai bạn duyệt.',
  image: {
    src: '/assets/images/story-01.webp',
    alt: 'Mô tả ảnh',
    aspectRatio: '4 / 5',
    objectPosition: '50% 50%',
  },
  placeholder: false,
},
```

Có thể thêm, xóa hoặc sắp xếp object trong mảng. Không bịa ngày gặp nhau/cầu hôn. Đặt `placeholder: false` sau khi nội dung thật đã được hai bạn duyệt để bỏ nhãn nội dung mẫu trên giao diện.

`copy.storyIntro` là đoạn mở đầu chung của section.

## 7. Muốn thêm ảnh gallery thế nào?

Tìm mảng `gallery` và thêm object:

```ts
{
  id: 'unique-photo-id',
  src: '/assets/images/gallery-07.webp',
  alt: 'Mô tả ngắn, cụ thể về ảnh',
  aspectRatio: '4 / 5',
  objectPosition: '50% 45%',
  layout: 'portrait',
  caption: 'Caption ngắn',
},
```

Quy tắc:

- `id` phải duy nhất.
- `layout` chỉ nhận `portrait`, `landscape`, `feature` hoặc `detail`.
- Xen kẽ tỷ lệ và layout để giữ bố cục editorial; kiểm tra lại 390 px và 1440 px sau khi đổi số lượng ảnh.
- Nếu muốn ẩn gallery, đặt `features.gallery: false`; mảng rỗng cũng tạo empty state bằng cách không render section.

## 8. Muốn thêm nhạc thế nào?

1. Chỉ dùng file có quyền sử dụng và đủ consent.
2. Tạo `public/assets/audio/` và đặt file đã nén, ví dụ `public/assets/audio/wedding-theme.mp3`.
3. Điền config:

```ts
music: {
  title: 'Tên bài',
  artist: 'Nghệ sĩ',
  src: '/assets/audio/wedding-theme.mp3',
},
```

4. Đặt `features.music: true`.

Control chỉ xuất hiện khi cả flag và `music.src` có giá trị. Trình duyệt không phát âm thanh trước tương tác người dùng; khách chủ động bật/tắt bằng floating control. Nén bitrate hợp lý và kiểm tra tải trên mạng di động.

## 9. Sửa lời mời và lời chúc mẫu

- Các câu dùng xuyên trang nằm trong `copy`.
- Lời chúc hiển thị ban đầu nằm trong `sampleWishes`.
- Giữ `id` của mỗi lời chúc mẫu duy nhất.
- Không đưa HTML vào nội dung; React hiển thị dưới dạng text an toàn.

## 10. Bật/tắt tính năng

Tìm nhóm `features`:

| Flag | Tác dụng |
| --- | --- |
| `music` | Cho phép control nhạc; vẫn cần `music.src` |
| `rsvp` | Hiện/ẩn form hồi âm |
| `guestbook` | Hiện/ẩn form và danh sách lời chúc |
| `gift` | Hiện/ẩn section quà; còn phụ thuộc `gift.enabled` |
| `personalizedGuest` | Dùng/bỏ tên từ `?guest=` |
| `gallery` | Hiện/ẩn gallery |

Không xóa component để tắt tạm. Sau khi đổi flag, xem lại section transition và navigation trên cả mobile/desktop.

## 11. Thay local RSVP/Guestbook bằng backend

UI chỉ phụ thuộc vào interface:

```text
src/services/rsvp/types.ts
src/services/guestbook/types.ts
```

Adapter local và điểm export hiện tại:

```text
src/services/rsvp/localRSVPService.ts
src/services/rsvp/index.ts
src/services/guestbook/localGuestbookService.ts
src/services/guestbook/index.ts
```

Developer có thể tạo `apiRSVPService.ts`/`apiGuestbookService.ts`, triển khai đúng interface, rồi đổi export trong hai file `index.ts`. Không cần sửa form/section nếu contract được giữ nguyên.

Backend production cần:

- validation phía server, rate limiting và chống spam;
- TLS, xử lý lỗi mạng, timeout và duplicate submissions;
- chính sách lưu giữ/xóa dữ liệu khách;
- moderation lời chúc trước khi public nếu cần;
- không đặt secret trong code hoặc biến `VITE_*`.

## 12. Guest URL

Mẫu generic:

```text
https://domain-cua-ban.vn/
```

Mẫu cá nhân hóa:

```text
https://domain-cua-ban.vn/?guest=Nguyen%20Van%20An
https://domain-cua-ban.vn/?guest=Nguy%E1%BB%85n%20V%C4%83n%20An
```

Tạo phần query bằng `encodeURIComponent`. Tên bị giới hạn 80 ký tự, khoảng trắng được chuẩn hóa và URL sai sẽ rơi về lời mời chung. Không dùng query parameter làm quyền truy cập và không đưa dữ liệu nhạy cảm vào đó.

## 13. SEO, social preview và privacy

Chỉnh nhóm `weddingConfig.seo` trong `src/config/wedding.ts`:

```ts
seo: {
  title: 'Tên hai bạn | ngày cưới',
  description: 'Mô tả ngắn dùng khi chia sẻ thiệp.',
  image: '/assets/images/hero.webp',
  robots: 'noindex, nofollow',
  siteUrl: 'https://domain-cua-ban.vn/',
},
```

Plugin `wedding-config-metadata` trong `vite.config.ts` tự đưa các giá trị này vào `<title>`, description, robots, Open Graph và Twitter metadata khi dev/build. `index.html` chỉ chứa token template, không cần cập nhật thủ công.

- Site URL được chọn theo thứ tự: biến build `VITE_SITE_URL` không rỗng, rồi đến `seo.siteUrl`. Để cả hai rỗng khi chưa có domain thật; fallback sẽ không sinh canonical/`og:url` và giữ `seo.image` ở dạng đường dẫn tương đối.
- Trên Netlify, đặt `VITE_SITE_URL` trong **Site configuration → Environment variables** thành custom domain HTTPS có dấu `/` cuối, ví dụ `https://thiep.example.vn/`, rồi deploy lại. Không hardcode URL preview `*.netlify.app`; mỗi thay đổi environment chỉ có hiệu lực ở build tiếp theo.
- Khi có site URL hợp lệ, Vite dùng URL đó cho canonical và `og:url`, đồng thời chuyển `seo.image` tương đối thành URL tuyệt đối cho `og:image`/`twitter:image`.
- `seo.image` có thể tiếp tục dùng đường dẫn `/assets/...`; hãy build rồi kiểm tra `dist/index.html` và preview trên nền tảng mục tiêu.
- Biến `VITE_*` là dữ liệu frontend công khai. `VITE_SITE_URL` chỉ chứa URL public, không bao giờ chứa token, mật khẩu hoặc secret.
- V1.1 đang `noindex, nofollow`. `public/robots.txt` dùng `Allow: /` để crawler tải được HTML/ảnh, trong khi meta robots yêu cầu không lập chỉ mục. Chỉ đổi `seo.robots` sang `index, follow` sau khi ảnh và dữ liệu riêng tư đã được duyệt.
- `noindex` không khóa website; muốn hạn chế người xem phải dùng access control của host.

## 14. Checklist sau mỗi lần thay nội dung

- Không còn thông tin giả hoặc placeholder vô tình xuất hiện.
- Tên và ngày nhất quán giữa các trường config, calendar, file `.ics` và metadata sinh trong `dist/index.html`.
- Ảnh không vỡ, alt đúng, crop đẹp, dung lượng hợp lý.
- Link bản đồ mở đúng địa điểm trên mobile.
- QR quét được và tài khoản đã đối chiếu.
- Nhạc có quyền dùng, control hoạt động và không autoplay trái phép.
- Guest URL có dấu tiếng Việt hiển thị đúng.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e` đã được chạy và kết quả thật được ghi vào `QA_REPORT.md`.
