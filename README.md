# Tuấn Hùng & Sao Mai

Thiệp cưới React + TypeScript + Vite, thiết kế mobile-first theo hướng Chinese wedding luxury: đỏ lacquer, vàng champagne, giấy kem và nhịp ảnh editorial.

## Chạy dự án

    npm run dev
    npm run lint
    npm run typecheck
    npm run test
    npm run build
    npm run test:e2e

## Dữ liệu và tích hợp

Tất cả dữ liệu có thể thay đổi nằm trong src/config/wedding.ts:

- tên, ngày cưới, hai địa điểm Nhà Trai/Nhà Gái;
- hai tài khoản mừng cưới và QR;
- nhạc nền;
- nội dung và 24+ cấu hình ảnh.

Guest personalization dùng ?guest=... và ?side=groom|bride|both. side chỉ lọc địa điểm; hai phong bao mừng cưới luôn hiện, với bên tương ứng được ưu tiên.

Sao chép .env.example thành .env rồi cấu hình VITE_APPS_SCRIPT_URL để kích hoạt POST RSVP/lời chúc tới Google Apps Script. Khi endpoint chưa có, form vẫn hiện trạng thái chưa sẵn sàng và không giả lập gửi thành công.

Xem chi tiết thay nội dung/asset tại docs/CONTENT_GUIDE.md.
