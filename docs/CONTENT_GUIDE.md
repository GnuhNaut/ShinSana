# Hướng dẫn thay nội dung thiệp cưới

Toàn bộ nội dung thay được nằm trong `src/config/wedding.ts`; không cần sửa JSX. Schema nằm trong `src/types/wedding.ts`. Sau mỗi lần cập nhật, chạy:

```bash
npm run typecheck
npm run test
npm run build
```

Muốn xem trước UI khi đã điền đủ dữ liệu, mở `/?demo=1`. Dữ liệu tại `src/config/wedding.demo.ts` chỉ là fixture minh họa và được tải riêng theo query; không chỉnh file đó để thay dữ liệu production. URL `/` luôn đọc `src/config/wedding.ts`.

## Dữ liệu hiện còn trống

Website chưa có tên bố mẹ, giờ nghi lễ/đón khách/khai tiệc, địa điểm, địa chỉ, Maps, phone liên hệ, thông tin gửi xe, tài khoản ngân hàng, QR, nhạc và ảnh thật.

Hiện `events: []` và `gift: { enabled: false, accounts: [] }`. UI tự ẩn dữ liệu thiếu; không điền “Chưa cập nhật”, “TBD” hoặc thông tin đoán vào config.

## 1. Tên, ngày và gia đình

- Tên/chữ ký/monogram: `couple.groom`, `couple.bride`, `couple.signature`, `couple.monogram`.
- Ngày chính: `date.iso`, `date.countdownIso`, `date.display*`, `date.lunar*`, `date.timezone`.
- Giờ ISO phải kèm offset Việt Nam `+07:00`. Ngày âm lịch phải do gia đình xác nhận.

Thông tin gia đình dùng `families.groom` và `families.bride`:

```ts
families: {
  // NHẬP THÔNG TIN NHÀ TRAI TẠI ĐÂY
  groom: {
    label: 'Nhà Trai',
    // father: '<TÊN BỐ ĐÃ XÁC NHẬN>',
    // mother: '<TÊN MẸ ĐÃ XÁC NHẬN>',
    // location: '<TỈNH/THÀNH PHỐ NẾU MUỐN HIỂN THỊ>',
  },
  // NHẬP THÔNG TIN NHÀ GÁI TẠI ĐÂY
  bride: {
    label: 'Nhà Gái',
    // father: '<TÊN BỐ ĐÃ XÁC NHẬN>',
    // mother: '<TÊN MẸ ĐÃ XÁC NHẬN>',
    // location: '<TỈNH/THÀNH PHỐ NẾU MUỐN HIỂN THỊ>',
  },
}
```

`label` một mình không làm block gia đình xuất hiện. Chỉ khi có `father`, `mother` hoặc `location` thật thì block tương ứng mới render; dữ liệu partial vẫn hợp lệ.

## 2. Thông tin hôn lễ

`events` là mảng linh hoạt: có thể để rỗng, có 1, 2, 3 hoặc nhiều event hơn. Không có `enabled` và không giữ object template rỗng. Chỉ thêm object khi đã có ít nhất tên nghi lễ đã xác nhận.

```ts
events: [
  {
    id: '<ID-KHÔNG-TRÙNG>',
    side: 'bride', // 'groom' | 'bride' | 'both'; bỏ nếu không áp dụng
    type: 'vu-quy', // vu-quy | thanh-hon | wedding-party | ceremony | other
    eyebrow: 'Nhà Gái',
    title: '<TÊN NGHI LỄ ĐÃ XÁC NHẬN>',

    date: '<YYYY-MM-DD>',
    lunarDate: '<NGÀY ÂM LỊCH ĐÃ XÁC NHẬN>',
    guestArrivalTime: '<HH:mm>',
    ceremonyTime: '<HH:mm>',
    receptionTime: '<HH:mm>',

    venueName: '<TÊN ĐỊA ĐIỂM ĐÃ XÁC NHẬN>',
    address: '<ĐỊA CHỈ ĐẦY ĐỦ ĐÃ XÁC NHẬN>',
    mapUrl: 'https://<GOOGLE-MAPS-URL-ĐÃ-KIỂM-TRA>',
    // mapEmbedUrl: 'https://<MAP-EMBED-URL-ĐÃ-KIỂM-TRA>',
    parkingNote: '<THÔNG TIN GỬI XE ĐÃ XÁC NHẬN>',
    contactName: '<TÊN NGƯỜI LIÊN HỆ>',
    contactPhone: '<SỐ ĐIỆN THOẠI ĐÃ XÁC NHẬN>',

    // Chỉ thêm calendar khi đã biết chính xác cả giờ bắt đầu và kết thúc.
    calendar: {
      eventStartIso: '<YYYY-MM-DDTHH:mm:ss+07:00>',
      eventEndIso: '<YYYY-MM-DDTHH:mm:ss+07:00>',
    },
  },
]
```

Xóa mọi field chưa có dữ liệu thật; field thiếu không tạo khoảng trống. `title` và `id` là bắt buộc cho mỗi event.

- `mapUrl` phải được nhập thủ công và dùng HTTPS; website không tự suy ra Maps từ address.
- Có address: hiện “Sao chép địa chỉ”. Có `mapUrl`: hiện CTA chính “Chỉ đường”.
- Có contact: phone dùng `tel:` trên mobile. `parkingNote` nằm trong event, không tạo section riêng.
- `mapEmbedUrl` là optional và lazy-load; bỏ field nếu không cần iframe.
- Không biết chính xác giờ calendar: bỏ toàn bộ `calendar`, không điền giờ giả.
- Query `?side=groom|bride|both` chỉ ưu tiên event phù hợp; không tự đổi tên Vu Quy/Thành Hôn.

## 3. Mừng cưới online

Mặc định phải giữ:

```ts
gift: {
  enabled: false,
  accounts: [],
}
```

Chỉ bật sau khi đã đối chiếu tài khoản thật:

```ts
gift: {
  enabled: true,
  accounts: [
    {
      id: '<ID-TÀI-KHOẢN-KHÔNG-TRÙNG>',
      side: 'groom', // 'groom' | 'bride'; optional
      label: 'Nhà Trai', // wording có thể đổi
      bankName: '<TÊN NGÂN HÀNG>',
      accountNumber: '<SỐ TÀI KHOẢN>',
      accountHolder: '<CHỦ TÀI KHOẢN>',
      // branch: '<CHI NHÁNH NẾU CÓ>',
      // qrImage: '/assets/images/<QR-THẬT>.webp',
    },
  ],
}
```

Mỗi account cần `id`, `bankName`, `accountNumber`, `accountHolder`; QR là optional. `enabled: false`, mảng rỗng hoặc account thiếu dữ liệu bắt buộc đều không tạo CTA/modal production. QR lỗi/không an toàn bị ẩn nhưng bank details hợp lệ vẫn dùng được.

QR cần ảnh vuông, không crop, nền trắng và đủ lớn để scan. Nút copy địa chỉ/STK dùng feedback inline “Đã sao chép”, không dùng `alert()`. Đây chỉ là màn hình thông tin chuyển khoản, không phải payment gateway.

## 4. RSVP

Form lưu qua `RSVPService` ở `src/services/rsvp/`. Adapter mặc định có `mode: 'local-demo'`: dữ liệu chỉ nằm trong `localStorage` của đúng browser và **không được gửi tới gia đình**.

Muốn thu RSVP tập trung, thay export trong `src/services/rsvp/index.ts` bằng remote adapter cùng interface; backend cần validation, rate-limit, chống spam và chính sách dữ liệu. RSVP mặc định không yêu cầu khách chọn từng nghi lễ.

## 5. Ảnh, câu chuyện và nhạc

- Ảnh: xem `docs/PLACEHOLDER_ASSETS.md`; cập nhật `hero`, `couple.*.portrait`, `story[]`, `gallery[]` cùng `srcSet`, `alt`, crop.
- Gallery giới hạn 4 ảnh để thiệp không quá dài. Social preview là `public/assets/social-preview.jpg` 1200×630.
- `story` hiện rỗng; chỉ thêm tối đa 3 mốc khi có nội dung thật.
- Nhạc: điền `music.{title,artist,src}` và bật `features.music`; không hack autoplay.

## 6. Cá nhân hóa và SEO

```text
/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A
/?guest=Nguy%E1%BB%85n%20V%C4%83n%20A&side=groom
```

Tên khách được normalize như text, giới hạn 80 ký tự. Cập nhật `seo.*`; khi có domain thật, đặt `VITE_SITE_URL` để build sinh canonical, `og:url` và social-image URL tuyệt đối.

## Validation và checklist phát hành

Development sẽ cảnh báo config sai. Production lọc event/account không hợp lệ và không render Maps, phone hoặc QR URL không an toàn.

- [ ] Ảnh thật, quyền sử dụng và crop mobile/desktop.
- [ ] Bố mẹ/location gia đình nếu muốn hiển thị.
- [ ] Mỗi event đã kiểm tra title, ngày, giờ, venue, address, Maps, contact và parking.
- [ ] Tài khoản/QR đã đối chiếu trên ít nhất hai thiết bị, hoặc tiếp tục để Gift tắt.
- [ ] RSVP đã nối backend nếu cần thu tập trung.
- [ ] Nhạc/story/domain/social preview đã được duyệt.
- [ ] Chạy lint, typecheck, unit, E2E, build và visual QA.
