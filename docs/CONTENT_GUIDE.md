# Cập nhật thiệp cưới

Chỉ cần mở src/config/wedding.ts để thay dữ liệu. Không cần sửa JSX.

## Bắt buộc thay trước khi phát hành

1. locations.groom và locations.bride: giờ đón khách, giờ làm lễ, địa chỉ và mapUrl HTTPS.
2. gifts.groom và gifts.bride: ngân hàng, chủ tài khoản, số tài khoản và đường dẫn QR thật. QR để trống sẽ hiện placeholder rõ ràng, không tạo QR giả.
3. music.src: đường dẫn bản nhạc đã có quyền sử dụng. Player dùng preload="none" và chỉ thử phát sau thao tác “Mở lời mời”.
4. galleryChapters và gallery: thay bằng ảnh cưới thật. Giữ chapter của từng ảnh khớp với một galleryChapters.id; dùng featured: true tiết chế cho 1–2 ảnh break toàn chiều rộng. Có thể giữ 24+ object và đổi src, srcSet, sizes, aspectRatio, objectPosition, caption/alt cho từng ảnh.
5. seo.siteUrl: URL HTTPS chính thức nếu đã có domain.

## RSVP và lời chúc

Tạo .env từ .env.example:

    VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-deployment/exec

Frontend gửi các payload:

    { type: 'rsvp', guestName, side, attendance, partySize, message, timestamp }
    { type: 'wish', name, side, message, timestamp }

Không đưa secret hoặc token vào biến VITE_; biến này sẽ được đưa vào client bundle.

## Chuẩn bị ảnh thật

- Hero nên là ảnh ngang 3:2 hoặc 16:10, có bản `srcSet` 640w/960w/1280w/1536w để ảnh đầu trang vẫn rõ mà không tải ảnh lớn cho màn hình nhỏ.
- Ảnh chân dung dùng 2:3, ảnh ngang dùng 3:2; ảnh vuông/chi tiết có thể dùng 1:1 hoặc 4:5. Chừa khoảng thở quanh khuôn mặt vì gallery luôn giữ nguyên tỉ lệ thay vì crop ép.
- Ảnh photo break và finale nên là ảnh ngang độ phân giải cao. Với mỗi ảnh, giữ `alt`, `srcSet`, `sizes`, `aspectRatio`, `objectPosition`, `caption`, `chapter` và `layout` đồng bộ trong `src/config/wedding.ts`.

## Guest links

    /?guest=Nguyen%20Van%20A&side=groom
    /?guest=Tran%20Thi%20B&side=bride
    /?guest=Gia%20dinh%20Anh%20Chi&side=both

side sai hoặc thiếu sẽ fallback về both. Tên khách được làm sạch, giới hạn 80 ký tự và xuất hiện ở cover/lời mời.
