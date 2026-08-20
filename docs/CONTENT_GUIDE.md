# Hướng dẫn thay nội dung thiệp cưới

Toàn bộ nội dung thay được nằm trong `src/config/wedding.ts`. Không cần sửa JSX. Sau mỗi lần cập nhật, chạy:

```bash
npm run typecheck
npm run test
npm run build
```

## Dữ liệu đang để trống có chủ đích

Website hiện **không có** tên bố mẹ, giờ đón khách/cử hành/vào tiệc, địa điểm, địa chỉ, map, phone, QR, nhạc và ảnh thật. UI tự ẩn các phần này; không điền chuỗi “chưa cập nhật” để hiển thị ra production.

## 1. Tên, ngày và bố mẹ

- Tên/chữ ký/monogram: `couple.groom`, `couple.bride`, `couple.signature`, `couple.monogram`.
- Ngày chính: `date.iso`, `date.countdownIso`, `date.display*`, `date.lunar*`, `date.timezone`.
- Bố mẹ: `families.groomParents.{father,mother}` và `families.brideParents.{father,mother}`. Trường rỗng không render.
- `countdownIso` và mọi giờ ISO phải kèm offset Việt Nam `+07:00`. Ngày âm lịch phải do gia đình xác nhận.

## 2. Thêm một hoặc hai buổi lễ

`events` là mảng linh hoạt. Hai object rỗng đang có chỉ là template. Điền dữ liệu đã xác nhận rồi đổi `enabled: true`:

```ts
{
  id: 'groom-ceremony',
  side: 'groom', // 'groom' | 'bride' | bỏ trống
  enabled: true,
  label: 'Nhà Trai',
  eventTitle: 'Lễ Thành Hôn', // hoặc Lễ Vu Quy / Tiệc Cưới theo xác nhận
  date: '2026-10-19',
  lunarDate: '10/09 âm lịch',
  guestArrivalTime: '17:30',
  ceremonyTime: '18:00',
  banquetTime: '18:30',
  venueName: 'Tên địa điểm thật',
  address: 'Địa chỉ thật',
  phone: 'Số điện thoại thật',
  mapNavigationUrl: 'https://...',
  mapEmbedUrl: 'https://...',
  calendar: {
    eventStartIso: '2026-10-19T18:00:00+07:00',
    eventEndIso: '2026-10-19T21:00:00+07:00',
  },
}
```

- Không có fallback tự đoán loại lễ/ngày/giờ/địa điểm.
- Map chỉ nhận HTTPS; iframe chỉ render khi có `mapEmbedUrl` thật.
- Calendar cần cả start và end, end phải sau start.
- Một event bật thì render một card; hai event bật thì render hai card. `?side=groom|bride` chỉ đổi thứ tự ưu tiên.

## 3. Ảnh thật và crop

Xem provenance/checklist tại `docs/PLACEHOLDER_ASSETS.md`. Cách nhanh nhất là thay đúng tên file và tạo đủ biến thể responsive; cách sạch hơn là đặt ảnh thật trong `public/assets/images/` rồi đổi `src`, `srcSet`, `sizes`, `alt`, `aspectRatio`, `objectPosition` trong config.

Các nhóm chính: `hero`, `couple.*.portrait`, `story[]`, `gallery[]`. Gallery giới hạn 4 ảnh để thiệp không quá dài. Ảnh dưới fold lazy-load; hero eager/high-priority.

Social preview dùng `public/assets/social-preview.jpg` (1200×630) qua `seo.image`. Phải thay bằng ảnh được cặp đôi duyệt trước khi phát hành.

## 4. Câu chuyện

`story` hiện rỗng vì chưa có dữ liệu thật. Có thể thêm tối đa 3 `StoryChapter`; không bịa ngày gặp/cầu hôn. Khi rỗng, website chỉ hiện `copy.storyIntro` trung tính và gallery.

## 5. RSVP

Form hiện lưu qua `RSVPService` ở `src/services/rsvp/`. Adapter mặc định là `local-demo`: dữ liệu chỉ nằm trong `localStorage` của đúng browser, **không tới gia đình**. Muốn dùng production, tạo adapter `mode: 'remote'` triển khai cùng interface; backend phải có validation, rate-limit, chống spam và chính sách dữ liệu.

## 6. Quà mừng

Để bật, cần `features.gift: true`, `gift.enabled: true` và ít nhất một bên có QR hoặc đủ ba trường ngân hàng:

```ts
bankName: '...'
accountName: '...'
accountNumber: '...'
qrImage: '/assets/images/qr-groom.webp'
```

Không có dữ liệu thật thì CTA/modal không render. QR và số tài khoản là dữ liệu công khai trong JavaScript; kiểm tra bằng ít nhất hai thiết bị.

## 7. Nhạc

Điền `music.{title,artist,src}` và bật `features.music`. Website không hack autoplay; khách chủ động bật/tắt bằng nút nổi.

## 8. Link cá nhân hóa

```text
/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A
/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A&side=groom
```

Tên được loại control characters, chuẩn hóa khoảng trắng, giới hạn 80 ký tự và React render như text. Query không phải cơ chế bảo mật.

## 9. SEO / Zalo / Facebook

Cập nhật `seo.title`, `seo.description`, `seo.image`, `seo.imageWidth`, `seo.imageHeight`. Khi có domain HTTPS thật, đặt `VITE_SITE_URL` trong môi trường deploy hoặc `seo.siteUrl`; build sẽ tạo canonical, `og:url` và URL ảnh social tuyệt đối. Không bịa domain trong source.

## Checklist trước phát hành

- [ ] Ảnh thật + consent/quyền sử dụng + crop mobile/desktop.
- [ ] Tên bố mẹ (nếu muốn hiển thị).
- [ ] Loại lễ, ngày, 3 mốc giờ, địa điểm, địa chỉ, map, phone.
- [ ] QR/tài khoản đã đối chiếu, hoặc tiếp tục tắt Gift.
- [ ] Nhạc có quyền sử dụng, hoặc tiếp tục để trống.
- [ ] Câu chuyện thật đã được cặp đôi duyệt, hoặc giữ story rỗng.
- [ ] RSVP đã nối backend nếu cần thu thập tập trung.
- [ ] Domain, social preview, privacy/indexing được xác nhận.
- [ ] Chạy full QA và visual QA lại ở mọi viewport bắt buộc.
