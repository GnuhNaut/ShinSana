# Placeholder assets

## Cảnh báo phát hành

**REPLACE BEFORE FINAL RELEASE — phải thay toàn bộ tài sản trong tài liệu này trước khi phát hành bản cuối.**

Sáu ảnh WebP gốc dưới đây là hình ảnh AI được tạo riêng cho prototype bằng công cụ **OpenAI built-in imagegen** (chế độ tạo ảnh mới, không dùng ảnh tham chiếu). Social preview JPG là một biến thể imagegen dùng chính `hero.webp` làm edit target. Chúng không được lấy từ CineLove, Unsplash, Pexels hay một website bên thứ ba. Vì là nội dung AI tạm thời và không phải ảnh thật của Tuấn Hùng/Sao Mai, chúng chỉ dùng để dựng layout, crop, tải ảnh và visual QA.

- Nguồn: **OpenAI built-in imagegen**, tạo ngày 15.08.2026.
- Social preview: **OpenAI built-in imagegen**, tạo ngày 20.08.2026 từ `hero.webp`, sau đó resize cơ học về đúng 1200×630 và xuất JPG 90% (153 KB).
- PNG nguồn do công cụ sinh được lưu ngoài repository tại `C:\Users\Administrator\.codex\generated_images\01a0011f-9f0c-7f61-bbe1-8a883de82866\`; các bản WebP tối ưu nằm trong repository theo bảng dưới.
- Source URL: không có; PNG nguồn được lưu local ngoài repository, còn sáu bản WebP tối ưu được lưu trong repository.
- Trạng thái chung: **REPLACE BEFORE FINAL RELEASE**.

Mỗi ảnh gốc có thêm các bản WebP responsive được resize cơ học, không sinh lại nội dung: `hero-{640,960,1280}.webp`, `couple-groom-{480,720}.webp`, `couple-bride-{480,720}.webp`, `story-01-{640,960,1280}.webp`, `story-02-{640,960,1280}.webp` và `gallery-detail-{480,720}.webp`. Các file này phục vụ `srcSet`; chúng có cùng provenance và cũng phải **REPLACE BEFORE FINAL RELEASE** cùng ảnh gốc.

## Danh mục đầy đủ

| Đường dẫn WebP chính xác | PNG nguồn | Mô tả prompt tạo ảnh | Mục đích và nơi tham chiếu | Trạng thái |
| --- | --- | --- | --- | --- |
| `public/assets/placeholders/hero.webp` | `exec-db5faa59-e9ae-44f5-ac5e-fa7bd74599f9.png` | Cặp đôi Việt mặc áo dài cưới đỏ bên hiên nhà cổ, ánh sáng điện ảnh, hoa sen; tránh phục trang Trung Hoa, không chữ/logo. | Cover hero và gallery feature: `weddingConfig.hero`, `gallery[cinematic-wide]`. | **REPLACE BEFORE FINAL RELEASE** |
| `public/assets/social-preview.jpg` | `exec-5e8331cd-5b08-4eef-9d3f-d721019120c6.png` | Biến thể 1.91:1 từ hero: cặp đôi bên trái, paper field ngà bên phải; chữ chính xác “Tuấn Hùng & Sao Mai”, “19.10.2026”, “WEDDING INVITATION”; palette blush/rose/burgundy/champagne, không logo/watermark. | Open Graph, Zalo, Facebook và Twitter preview: `weddingConfig.seo.image`. | **REPLACE BEFORE FINAL RELEASE** |
| `public/assets/placeholders/couple-groom.webp` | `exec-56a6c872-5983-45a5-be84-c0a3e9a0f961.png` | Chân dung chú rể với áo dài đỏ đô thêu họa tiết Đông Sơn, nền kiến trúc Việt màu trầm; không chữ/logo. | Chân dung chú rể và gallery: `weddingConfig.couple.groom.portrait`, `gallery[portrait-two]`. | **REPLACE BEFORE FINAL RELEASE** |
| `public/assets/placeholders/couple-bride.webp` | `exec-33481de8-46d8-4b91-a8c6-90f3042ae71f.png` | Chân dung cô dâu trong áo dài, khăn vấn đỏ và thêu vàng, cầm sen cùng mẫu đơn; không vương miện kiểu Trung Hoa, không chữ/logo. | Chân dung cô dâu và gallery: `weddingConfig.couple.bride.portrait`, `gallery[portrait-one]`. | **REPLACE BEFORE FINAL RELEASE** |
| `public/assets/placeholders/story-01.webp` | `exec-9f342538-fbf3-4de7-b637-e2d312b6d73d.png` | Cận cảnh đôi tay trong áo dài cưới được nối bằng sợi chỉ đỏ bên hiên nhà Việt, không lộ mặt, không chữ/logo. | Ảnh Chương 01 và gallery: `weddingConfig.story[0].image`, `gallery[story-hands]`. | **REPLACE BEFORE FINAL RELEASE** |
| `public/assets/placeholders/story-02.webp` | `exec-50b1872f-5cbf-489b-972a-48977589a182.png` | Tĩnh vật bàn trà lễ cưới Việt với bộ trà sơn mài, lụa đỏ, hoa sen, trầu cau; không yếu tố Tết hay tôn giáo, không chữ/logo. | Ảnh Chương 02 và gallery: `weddingConfig.story[1].image`, `gallery[story-wide]`. | **REPLACE BEFORE FINAL RELEASE** |
| `public/assets/placeholders/gallery-detail.webp` | `exec-854bc540-77f8-4be6-bfe2-fd6bb4f2f8d8.png` | Flat lay áo dài thêu sen, thiệp ngà để trống, nhẫn vàng, lá trầu và hoa sen; không chữ/logo. | Ảnh Chương 03 và gallery: `weddingConfig.story[2].image`, `gallery[detail-close]`. | **REPLACE BEFORE FINAL RELEASE** |

Không có placeholder QR hoặc placeholder audio trong repository. Các trường `gift.*.qrImage` và `music.src` hiện để rỗng; không được điền tài sản ngẫu nhiên hoặc có bản quyền không rõ ràng.

## Cách thay an toàn

### Phương án A — thay file cùng tên

Tối ưu ảnh thật thành WebP và ghi đè đúng sáu đường dẫn gốc cùng toàn bộ biến thể responsive kể trên. Ưu điểm là không cần đổi `src`/`srcSet`. Sau đó vẫn phải cập nhật alt/crop và kiểm tra `weddingConfig.seo.image` trong `src/config/wedding.ts`.

### Phương án B — dùng thư mục ảnh thật riêng

Khuyến nghị cho bản bàn giao:

1. Đặt ảnh thật đã được cho phép phát hành trong `public/assets/images/`.
2. Đổi mọi `src` liên quan trong `src/config/wedding.ts` từ `/assets/placeholders/...` sang `/assets/images/...`.
3. Đổi `weddingConfig.seo.image`; khi đã có domain, điền URL tuyệt đối vào `weddingConfig.seo.siteUrl` để Vite sinh metadata social đầy đủ.
4. Cập nhật `srcSet`, `sizes`, `alt`, `aspectRatio`, `objectPosition` cho từng usage. Một file đang được dùng ở nhiều vị trí có thể cần tách thành nhiều crop riêng.
5. Dùng `rg "assets/placeholders" src` để chắc chắn không còn tham chiếu tạm.
6. Chạy build, broken-asset check và visual QA lại ở mọi viewport yêu cầu.

## Yêu cầu đối với ảnh thay thế

- Là ảnh thật của cặp đôi hoặc tài sản có quyền sử dụng rõ ràng và consent phát hành.
- Không copy ảnh, logo, source hoặc branding từ website tham khảo CineLove.
- Ưu tiên WebP/AVIF, kích thước phù hợp viewport, dung lượng hợp lý; giữ ảnh hero đủ nét cho LCP và social preview.
- Không hotlink từ Drive, mạng xã hội hoặc stock CDN cho production.
- Alt text mô tả nội dung ảnh. Ảnh trang trí thuần túy mới dùng alt rỗng.
- Kiểm tra crop ở 390×844, 430×932, 768×1024 và 1440×900.
- Xác minh không có ảnh vỡ/404 và fallback chỉ là phương án lỗi, không phải nội dung bản cuối.

## Checklist ký duyệt asset

- [ ] `hero.webp` đã được thay hoặc mọi tham chiếu đã chuyển sang ảnh thật.
- [ ] `couple-groom.webp` đã được thay hoặc mọi tham chiếu đã chuyển sang ảnh thật.
- [ ] `couple-bride.webp` đã được thay hoặc mọi tham chiếu đã chuyển sang ảnh thật.
- [ ] `story-01.webp` đã được thay hoặc mọi tham chiếu đã chuyển sang ảnh thật.
- [ ] `story-02.webp` đã được thay hoặc mọi tham chiếu đã chuyển sang ảnh thật.
- [ ] `gallery-detail.webp` đã được thay hoặc mọi tham chiếu đã chuyển sang ảnh thật.
- [ ] `social-preview.jpg` đã được thay bằng preview 1200×630 được cặp đôi duyệt.
- [ ] `weddingConfig.seo.image` trỏ tới ảnh phát hành thật và metadata social trong `dist/index.html` đã được kiểm tra sau build.
- [ ] Quyền sử dụng và consent của tất cả ảnh đã được xác nhận.
- [ ] Không còn kết quả từ `rg "assets/placeholders" src` (nếu chọn phương án B).
- [ ] Visual QA và broken-asset QA đã được chạy lại, ghi kết quả vào `QA_REPORT.md`.
