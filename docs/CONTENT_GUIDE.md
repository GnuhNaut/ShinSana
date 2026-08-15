# Hướng dẫn thay nội dung thiệp cưới — V2

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

## 1. Thay tên cô dâu / chú rể

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

## 2. Thay ngày cưới (trang thiệp chính)

Nhóm `date` chỉ dùng cho **TRANG THIỆP CHÍNH** (cover, lời mời, calendar mini, countdown, kết thiệp). Ngày buổi lễ riêng nằm ở `events.brideSide` / `events.groomSide`.

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

- `iso` dùng định dạng `YYYY-MM-DD`. Khi `eventStartIso` và `eventEndIso` cùng để rỗng, file `.ics` tạo sự kiện cả ngày.
- `countdownIso` cần cả giờ và UTC offset. Khi có giờ cưới thật, nhập chính xác; không tự đổi timezone.
- Muốn file `.ics` có giờ bắt đầu/kết thúc, điền **cả hai** `eventStartIso` và `eventEndIso` theo ISO 8601 kèm UTC offset, ví dụ `2026-10-19T18:00:00+07:00` và `2026-10-19T21:00:00+07:00`. Không chỉ điền một trường.
- Ngày âm lịch phải do gia đình xác nhận. Website không tự tính.

## 3. Thay ngày, giờ, địa điểm cho Nhà Trai và Nhà Gái

V2 tách hẳn hai sự kiện độc lập. Mỗi bên có đầy đủ ngày, giờ, địa điểm, địa chỉ, map, calendar riêng:

```ts
events: {
  brideSide: {
    enabled: true,
    label: 'Nhà Gái',
    eventTitle: 'Lễ vu quy',
    date: '2026-10-19',
    lunarDate: '10/09 âm lịch',
    time: '09:00',
    venueName: 'Tư gia Nhà Gái',
    address: 'Số 12, Ngõ 3, ..., Hà Nội',
    mapNavigationUrl: 'https://maps.google.com/...',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=...',
    calendar: {
      eventStartIso: '2026-10-19T09:00:00+07:00',
      eventEndIso:   '2026-10-19T11:00:00+07:00',
    },
  },
  groomSide: {
    enabled: true,
    label: 'Nhà Trai',
    eventTitle: 'Lễ thành hôn',
    date: '2026-10-19',
    lunarDate: '10/09 âm lịch',
    time: '15:00',
    venueName: 'Tư gia Nhà Trai',
    address: 'Số 8, ..., Hà Nội',
    mapNavigationUrl: 'https://maps.google.com/...',
    mapEmbedUrl: '',
    calendar: {
      eventStartIso: '2026-10-19T15:00:00+07:00',
      eventEndIso:   '2026-10-19T17:00:00+07:00',
    },
  },
},
```

Quy tắc:

- `enabled` bật/tắt tấm thiệp con; vẫn giữ dữ liệu trong config.
- `eventTitle` có thể để rỗng; hệ thống sẽ dùng `Lễ vu quy · Sao Mai` (Nhà Gái) hoặc `Lễ thành hôn · Tuấn Hùng` (Nhà Trai).
- `date` ở dạng `YYYY-MM-DD`. Nếu rỗng, hệ thống dùng `date.iso` làm fallback; **không tự suy diễn**.
- `lunarDate` nên do gia đình xác nhận. Nếu rỗng, hệ thống dùng `date.lunar` làm fallback.
- `time` hiển thị tự do, ví dụ `09:00`, `09:00 - 11:00`, `Sáng`. Nếu rỗng, hiển thị `—`.
- `mapNavigationUrl` mở nút "Chỉ đường" sang ứng dụng bản đồ. **HTTPS** bắt buộc.
- `mapEmbedUrl` render iframe bản đồ lazy-load. **HTTPS** bắt buộc; nếu rỗng, hiển thị placeholder.
- `calendar.eventStartIso` / `eventEndIso` tuỳ chọn. Nếu cả hai rỗng, file `.ics` là sự kiện cả ngày. Nếu có, **điền cả hai** và `eventEndIso` phải sau `eventStartIso`.
- Hai bên hoàn toàn độc lập: có thể trùng ngày hoặc khác ngày đều được.

## 4. Thay ảnh cưới ở đâu?

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

Cách này không cần sửa đường dẫn, nhưng vẫn cần cập nhật `alt`, `aspectRatio` và `objectPosition` trong config cho đúng ảnh thật.

### Cách khuyến nghị: tách ảnh thật khỏi placeholder

1. Tạo thư mục `public/assets/images/`.
2. Chép ảnh đã tối ưu vào đó, ví dụ `public/assets/images/hero.webp`.
3. Trong config, đổi `src` thành `/assets/images/hero.webp`.
4. Viết `alt` mô tả nội dung ảnh; không dùng tên file làm alt.
5. Chỉnh `aspectRatio` (ví dụ `'4 / 5'`, `'3 / 2'`, `'16 / 10'`) và `objectPosition` (ví dụ `'50% 40%'`) để crop đúng chủ thể.

Các điểm ảnh chính:

| Vị trí | Trường config |
| --- | --- |
| Trang thiệp chính (hero) | `hero` |
| Chân dung chú rể | `couple.groom.portrait` |
| Chân dung cô dâu | `couple.bride.portrait` |
| Ảnh câu chuyện | `story[n].image` |
| Gallery nhỏ | `gallery[n]` |
| Ảnh social | `seo.image` — Vite dùng trường này cho `og:image` và `twitter:image` |

## 5. Thay QR và thông tin quà mừng ở đâu?

Gift giờ là modal nhỏ mở từ khu vực RSVP. Hai bên có thông tin riêng:

```ts
gift: {
  enabled: true,
  groom: {
    label: 'Nhà Trai',
    bankName: 'Tên ngân hàng',
    accountName: 'TÊN CHỦ TÀI KHOẢN',
    accountNumber: 'Số tài khoản',
    qrImage: '/assets/images/qr-groom.webp',
  },
  bride: {
    label: 'Nhà Gái',
    bankName: 'Tên ngân hàng',
    accountName: 'TÊN CHỦ TÀI KHOẢN',
    accountNumber: 'Số tài khoản',
    qrImage: '/assets/images/qr-bride.webp',
  },
},
```

`features.gift: true` + `gift.enabled: true` mới hiện nút mở modal. Khi cả ba trường ngân hàng rỗng, modal hiển thị empty state chờ cập nhật.

Đối chiếu từng ký tự với gia đình và quét thử QR bằng ít nhất hai thiết bị. Dữ liệu này được đóng gói công khai trong static JavaScript; modal không phải lớp bảo mật.

## 6. Thay câu chuyện ở đâu?

Tìm mảng `story`. Mỗi phần tử có cấu trúc:

```ts
{
  chapter: 'Mốc 01',
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

Tối đa 3 mốc theo mặc định. Có thể thêm/bớt nhưng **không bịa** ngày gặp nhau / cầu hôn. Đặt `placeholder: false` sau khi nội dung thật đã được hai bạn duyệt để bỏ nhãn nội dung mẫu.

`copy.storyIntro` là lời dẫn đầu section.

## 7. Thay gallery ở đâu?

```ts
{
  id: 'unique-photo-id',
  src: '/assets/images/gallery-07.webp',
  alt: 'Mô tả ngắn, cụ thể về ảnh',
  aspectRatio: '4 / 5',
  objectPosition: '50% 45%',
  layout: 'portrait',
  caption: 'Caption ngắn',
}
```

- `id` phải duy nhất.
- `layout` chỉ nhận `portrait`, `landscape`, `feature` hoặc `detail`.
- V2 hiển thị tối đa 6 ảnh gallery. Xen kẽ tỷ lệ để giữ bố cục trên 390px và 1440px.
- `features.gallery: false` để ẩn cụm gallery trong section câu chuyện.

## 8. Thêm nhạc

```ts
music: {
  title: 'Tên bài',
  artist: 'Nghệ sĩ',
  src: '/assets/audio/wedding-theme.mp3',
},
```

`features.music: true` và `music.src` có giá trị. Trình duyệt không phát âm thanh trước tương tác người dùng; khách chủ động bật / tắt bằng floating control.

## 9. Sửa lời dẫn và copy

Các câu dùng xuyên trang nằm trong `copy`:

- `coverEyebrow`, `coverHint` — viền trên cover và gợi ý chạm.
- `invitationTitle`, `invitationGeneric`, `invitationPersonalized`, `invitationBody` — lời mời trong trang thiệp chính.
- `ceremonyTitle`, `ceremonyIntro` — heading section hôn lễ.
- `detailsNote` — copy khi địa điểm chưa có.
- `storyIntro` — lời dẫn chuyện chúng mình.
- `rsvpTitle`, `rsvpIntro`, `rsvpThanks` — heading + intro + cảm ơn.
- `giftLabel`, `giftIntro` — heading + intro modal quà.
- `finalTitle`, `finalMessage` — kết thiệp.

Giữ tiếng Việt là chính. Có thể giữ một vài subtitle tiếng Anh ngắn ở eyebrow, nhưng trải nghiệm chính phải Việt Nam.

## 10. Bật / tắt tính năng

```ts
features: {
  music: true,
  rsvp: true,
  wish: true,           // legacy — không render section
  gift: true,
  personalizedGuest: true,
  gallery: true,
}
```

Sau khi đổi flag, xem lại section transition trên cả mobile / desktop.

## 11. Nối RSVP backend

UI chỉ phụ thuộc interface `src/services/rsvp/types.ts`. Adapter local và điểm export hiện tại:

```text
src/services/rsvp/localRSVPService.ts
src/services/rsvp/index.ts
```

Tạo `apiRSVPService.ts` triển khai `RSVPService`, rồi đổi export trong `index.ts`. Không cần sửa form nếu contract được giữ nguyên.

Backend production cần:

- validation phía server, rate limiting và chống spam;
- TLS, xử lý lỗi mạng, timeout và duplicate submissions;
- chính sách lưu giữ / xoá dữ liệu khách;
- không đặt secret trong code hoặc biến `VITE_*`.

## 12. Guest URL

Mẫu generic:

```text
https://domain-cua-ban.vn/
```

Mẫu cá nhân hoá + phía:

```text
https://domain-cua-ban.vn/?guest=Nguyen%20Van%20An
https://domain-cua-ban.vn/?guest=Nguy%E1%BB%85n%20V%C4%83n%20An
https://domain-cua-ban.vn/?guest=Nguyen%20Van%20An&side=groom
https://domain-cua-ban.vn/?guest=Nguyen%20Van%20An&side=bride
https://domain-cua-ban.vn/?guest=Nguyen%20Van%20An&side=both
```

Tên bị giới hạn 80 ký tự, khoảng trắng được chuẩn hoá. Side chỉ nhận `groom`, `bride`, `both` (mặc định `both`); alias tiếng Việt `nhà trai`, `nhà gái`, `cả hai` cũng được chấp nhận. Không dùng query parameter làm quyền truy cập.

## 13. Checklist nội dung trước khi phát hành

### Nhà Gái cần cung cấp

- [ ] `events.brideSide.date` (YYYY-MM-DD)
- [ ] `events.brideSide.lunarDate`
- [ ] `events.brideSide.time`
- [ ] `events.brideSide.venueName` + `address`
- [ ] `events.brideSide.mapNavigationUrl` (HTTPS)
- [ ] `events.brideSide.mapEmbedUrl` (HTTPS, tuỳ chọn)
- [ ] `events.brideSide.calendar.eventStartIso` / `eventEndIso`
- [ ] Ảnh QR Nhà Gái nếu dùng tính năng Gift

### Nhà Trai cần cung cấp

- [ ] `events.groomSide.*` (tương tự Nhà Gái)
- [ ] Ảnh QR Nhà Trai nếu dùng tính năng Gift

### Hai bạn cần cung cấp

- [ ] Ảnh hero, ảnh chân dung, ảnh story, ảnh gallery
- [ ] Câu chuyện 3 mốc đã được duyệt
- [ ] Bài nhạc (file + tên + nghệ sĩ)
- [ ] Lời chúc mẫu (`sampleWishes`) — nếu muốn hiển thị khi chưa có backend
- [ ] `seo.title`, `seo.description`, `seo.image`, `seo.siteUrl`
