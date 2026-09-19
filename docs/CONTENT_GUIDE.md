# Cập nhật thiệp cưới

Chỉ cần mở src/config/wedding.ts để thay dữ liệu. Không cần sửa JSX.

## Bắt buộc thay trước khi phát hành

1. locations.groom và locations.bride: giờ đón khách, giờ làm lễ, địa chỉ và mapUrl HTTPS.
2. gifts.groom và gifts.bride: ngân hàng, chủ tài khoản, số tài khoản và đường dẫn QR thật. QR để trống sẽ hiện placeholder rõ ràng, không tạo QR giả.
3. music.src: đường dẫn bản nhạc đã có quyền sử dụng. Player dùng preload="none" và chỉ thử phát sau thao tác “Mở lời mời”.
4. gallery: thay bằng ảnh cưới thật. Có thể giữ 24+ object và đổi src, srcSet, sizes, aspectRatio, objectPosition, caption/alt cho từng ảnh.
5. seo.siteUrl: URL HTTPS chính thức nếu đã có domain.

## RSVP và lời chúc

Tạo .env từ .env.example:

    VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-deployment/exec

Frontend gửi các payload:

    { type: 'rsvp', guestName, side, attendance, partySize, message, timestamp }
    { type: 'wish', name, side, message, timestamp }

Không đưa secret hoặc token vào biến VITE_; biến này sẽ được đưa vào client bundle.

## Guest links

    /?guest=Nguyen%20Van%20A&side=groom
    /?guest=Tran%20Thi%20B&side=bride
    /?guest=Gia%20dinh%20Anh%20Chi&side=both

side sai hoặc thiếu sẽ fallback về both. Tên khách được làm sạch, giới hạn 80 ký tự và xuất hiện ở cover/lời mời.
