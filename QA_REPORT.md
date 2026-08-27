# QA Report — Wedding Information Completeness

Ngày kiểm tra: 20/08/2026 · `Asia/Ho_Chi_Minh`

## Automated gates

| Gate | Kết quả |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS — TypeScript strict |
| `npm run test` | PASS — 104/104, 13 files |
| `npm run build` | PASS |
| `npm run test:e2e` | PASS — 23/23 executed, 25 intentional project/fixture skips |
| Populated fixture E2E | PASS — 1/1 Chromium desktop |

E2E mặc định chạy trên Chromium desktop, Pixel 5 Chromium, WebKit desktop và iPhone 13 WebKit. Luồng kiểm tra gồm cover, tên/ngày, guest URL, RSVP invalid/valid + local persistence, gallery keyboard/lightbox, optional content ẩn sạch, console errors và horizontal overflow ở 360/375/390/412/430/768/1024/1440px.

Unit/component matrix bao phủ 0/1/2/3 wedding events; ngày khác nhau; sparse/invalid data; map/address copy/tel/parking/calendar; family empty/partial/full; Gift disabled/invalid/1/2 accounts; tabs, QR optional/broken, copy fallback, Escape, focus trap và Gift độc lập với RSVP.

## Demo preview mode

- `?demo=1` tải riêng lazy chunk `wedding.demo-*.js`; `/`, `?demo=0`, query sai hoặc trùng vẫn dùng production singleton.
- Bundle audit xác nhận tên gia đình, địa chỉ và tài khoản mẫu không xuất hiện trong HTML hoặc entry/section chunks mặc định.
- Demo E2E kiểm tra ba event, family, address copy, Maps, phone, parking, RSVP, ba file `.ics`, Gift hai tabs, hai QR, copy STK, Escape/focus return, noindex và canonical không đổi.
- Hai QR 720×720 decode đúng payload `DEMO WEDDING QR - ... - NOT FOR PAYMENT`; không chứa dữ liệu ngân hàng hoặc VietQR.

## Lighthouse mobile

Ba lần đo trên production preview, kết quả median:

| Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 99 | 100 | 100 | 100 | 2.105s | 0ms | 0.00008 |

Raw reports: `artifacts/lighthouse/completeness-mobile-1.json` đến `completeness-mobile-3.json`.

Demo `?demo=1`: Performance **97**, Accessibility **100**, Best Practices **100**, SEO **66**, LCP **2.4s**, TBT **0ms**, CLS **0**. SEO thấp có chủ đích vì Lighthouse đánh rớt `is-crawlable` khi robots là `noindex, nofollow`; production vẫn đạt SEO 100. Raw report: `artifacts/lighthouse/demo-mobile.json`.

## Visual QA

- BEFORE/AFTER production: cùng default URL, cover + full-page ở 390×844, 430×932 và 1440×900 trong `artifacts/screenshots/completeness-before/` và `completeness-after/`.
- Không có regression palette, typography, hero crop, gallery, spacing hay page length; default optional data tiếp tục ẩn hoàn toàn.
- Fixture QA-only: 3 events có địa chỉ dài + 2 gift accounts tại 390/430/1440 trong `artifacts/screenshots/completeness-fixture/`. Fixture đã được gỡ khỏi config ngay sau capture.
- Visual fixture phát hiện CTA desktop bị cắt và nút về đầu trang che CTA mobile; cả hai đã sửa và lần chạy lại xác nhận `scrollWidth <= clientWidth`, không còn overlay.
- Event cards giữ hierarchy wedding/editorial, mobile stack; Gift dùng bottom sheet mobile và modal desktop, không giống dashboard/payment gateway.
- Demo preview: full-page 390×844, 430×932, 1440×900 và Gift modal mobile/desktop nằm trực tiếp trong `artifacts/screenshots/`. Không có overflow/crop/CTA collision; badge `DEMO PREVIEW` không che nội dung. Bản mobile dài khoảng 8.7k px do fixture cố ý hiển thị đủ ba event và bốn utility actions/event; grouping vẫn rõ và không thêm section thừa.

## Runtime contract và giới hạn

- Production hiện giữ `events: []`, family chưa có dữ liệu và `gift: { enabled: false, accounts: [] }`; không có thông tin giả hoặc placeholder “Chưa cập nhật”.
- RSVP vẫn là `local-demo`: dữ liệu chỉ ở `localStorage`, chưa được gửi tới gia đình.
- QR thật chưa có nên không được tạo giả. Aspect ratio/contain/nền trắng, image-error và conditional behavior đã test; khả năng scan cần kiểm tra lại bằng QR thật trên ít nhất hai thiết bị.
- Ảnh hiện tại vẫn là placeholder AI/local, không đại diện cho Tuấn Hùng và Sao Mai.
