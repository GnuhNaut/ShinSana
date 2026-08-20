# Design audit — bản BEFORE (20.08.2026)

## Hiện trạng kỹ thuật

- React 19 + TypeScript strict + Vite 8; SPA không router/global state; CSS token thủ công.
- Vitest + Testing Library + Playwright; RSVP dùng adapter `localStorage` demo.
- Worktree sạch trước audit, nhánh `main` đi trước `origin/main` 1 commit. Baseline: lint, typecheck, 39/39 test và build đều PASS.
- Ảnh AI placeholder local đã có `srcSet`, kích thước cố định và provenance rõ; Modal, WeddingImage, lightbox, motion/reduced-motion, ICS và guest sanitizer có thể tái sử dụng.
- BEFORE đã chụp tại `artifacts/screenshots/before/` cho 360×800, 390×844, 430×932, 768×1024, 1024×768 và 1440×900 (cover + full page).

## 9 vấn đề chính

1. **Hồng nhưng bị “washed-out” do phân bổ, không phải vì thiếu màu đậm.** Canvas `#FFF6F7`, paper `#FFFCFA` và phần lớn surface chỉ chênh luminance rất ít; blush phủ diện rộng trong khi rose mạnh chủ yếu nằm ở chữ rất nhỏ. Border-soft `#E7B8C2` trên paper chỉ khoảng **1.71:1**, muted text `#8A7780` trên canvas khoảng **3.93:1**. Kết quả là viền, hint và lớp nền hòa vào nhau dù primary rose tự nó đủ tương phản.
2. **Hierarchy bị thu nhỏ trên desktop.** Trang thiệp chính chỉ rộng khoảng 470px giữa canvas rất lớn; body/eyebrow 11–13px và khoảng trắng ngoài composition quá nhiều. Ở 1024–1440px, nội dung trông như bản mobile bị đặt giữa màn hình, tên và ngày không còn là focal point mạnh.
3. **Bìa đúng hình thức “tấm thiệp” nhưng chưa tạo cảm xúc đầu tiên.** Cover không dùng ảnh hero; phần giấy trắng chiếm gần toàn viewport, floral gần như biến mất vì opacity thấp. Tên nổi nhưng bìa thiếu chiều sâu/photo anchoring theo art direction mới.
4. **Cardification và đường viền lặp.** Hai event dùng wrapper và `<article>` cùng class `event-card`, tạo khung kép/padding kép. RSVP, closing và gallery polaroid tiếp tục lặp border + radius + shadow, khiến trang có nhịp template/component hơn là editorial invitation.
5. **Luồng dài do nội dung bị lặp.** Story ba mốc đã dùng 3 ảnh, gallery lại render 6 ảnh trùng asset; riêng mobile tạo một đoạn album rất dài. Nhiều caption placeholder và card ảnh làm cảm xúc bị loãng.
6. **Dữ liệu chưa có vẫn tạo UI giả.** Ceremony luôn render cả Nhà Trai/Nhà Gái dù `enabled`, giờ và địa điểm rỗng; hiển thị dấu “—”, “sẽ cập nhật”, map giả và nút disabled. Gift CTA/modal vẫn xuất hiện khi QR/tài khoản rỗng. Điều này trái nguyên tắc conditional-render và làm khách tưởng thông tin bị thiếu.
7. **RSVP chưa đúng mental model phổ thông.** Bốn lựa chọn Nhà Gái/Nhà Trai/Cả Hai/Không dự phức tạp hơn yêu cầu “Có tham dự/Không thể tham dự”; party size chưa trở thành bước phụ rõ ràng. Success copy cũng không phân biệt khách từ chối. Adapter có contract tốt nhưng chỉ lưu trên đúng thiết bị hiện tại.
8. **Ngày cưới/countdown có lỗi kiến trúc.** Countdown trong trang chính chỉ được tính một lần bằng `useMemo`; component live đã có nhưng chưa dùng. Timezone config chưa tham gia parse trực tiếp, trạng thái sau cưới không xuất hiện ở UI chính, và năm `2026` còn hardcode.
9. **A11y/SEO/QA còn khoảng trống.** Sau khi mở cover, H1 bị unmount; link “Xem địa điểm” vẫn hiện khi không có địa điểm. Chưa có apple-touch-icon/social asset 1200×630 chuyên dụng, `og:image` chưa thể tuyệt đối khi chưa có domain. E2E thiếu 360/412/1024, mobile WebKit, music/map active branch, conditional optional data và Lighthouse.

## Hướng sửa đã khóa

Giữ stack và các primitive tốt; tái cấu trúc có kiểm soát thành 6 nhịp: cover ảnh + paper, lời kính mời/gia đình, ngày cưới + event conditional, photo-story ngắn, RSVP/gift conditional, closing. Tăng chiều sâu có chọn lọc bằng burgundy/rose ở tên-ngày-CTA-heading, surface blush rõ tầng hơn, border chức năng đủ tương phản và giảm số card/ảnh lặp.
