# QA Report — Wedding Invitation V1

> Trạng thái: **PASS — V1 frontend sẵn sàng để thay nội dung thật**. Không có lỗi blocking đã biết trong source hiện tại. Bản public cuối vẫn phải thay dữ liệu placeholder và xác nhận thông tin thật trước khi phát hành.

## Environment

| Hạng mục | Giá trị đã kiểm tra |
| --- | --- |
| Ngày / múi giờ | 2026-08-15, `Asia/Ho_Chi_Minh` (+07:00) |
| OS | Windows 11 Pro for Workstations 64-bit, build 26200 |
| Shell | PowerShell |
| Node.js / npm | v22.14.0 / 10.9.2 |
| App stack | React 19.2.8, TypeScript 6.0.2, Vite 8.2.1 |
| Test stack | Vitest 4.1.10, Playwright 1.62.1 |
| Browsers | Chromium 151.0.7922.34; WebKit 26.5 |
| Production target | Static bundle trong `dist/` |

Folder hiện không phải Git repository, vì vậy không có commit SHA để ghi nhận. QA áp dụng cho snapshot file tại thời điểm báo cáo.

## Commands executed

| Command | Kết quả thực tế |
| --- | --- |
| `npm install` | **PASS** — package lock đồng bộ; 240 packages audited; 0 vulnerabilities |
| `npm run lint` | **PASS** — exit code 0 |
| `npm run typecheck` | **PASS** — TypeScript strict, exit code 0 |
| `npm run test` | **PASS** — 6 files, 33/33 tests |
| `npm run build` | **PASS** — production bundle tạo thành công |
| `npm run test:e2e` | **PASS** — 15/15 tests trên 3 browser projects |
| `npm run preview` + HTTP smoke | **PASS** — `http://127.0.0.1:4173/` trả HTTP 200 |

Các gate cuối được chạy ngày 2026-08-15 trên source sau design/accessibility/performance polish. Playwright chạy trực tiếp với production preview, không dùng dev server.

## Unit và component tests

Vitest: **33 passed, 0 failed, 0 skipped**.

- Config validation: dữ liệu chuẩn, required fields, cặp thời gian, time range, launch URL.
- Guest parser: empty, ASCII/Unicode encoded, whitespace/control characters, giới hạn 80 ký tự, malformed URL/percent encoding.
- Countdown: trước, đúng boundary, sau ngày cưới, invalid target, không bao giờ âm.
- Calendar: October 2026 bắt đầu Thứ Năm, 31 ngày, chỉ highlight ngày 19.
- ICS: `DTSTAMP`, all-day `20261019`, exclusive `DTEND:20261020`, escaping/folding, data URI và đường chuyển sang timed UTC event.
- RSVP validation: name/attendance required, party size 1–10, message limits.
- Storage: versioned envelope và fallback khi payload/storage lỗi.
- Components: opening/reduced motion, image fallback, RSVP errors/focus/success/service error, Gift modal focus restoration, Gallery keyboard flow.

## Playwright E2E

Playwright: **15 passed, 0 failed** trên `chromium-desktop`, `chromium-mobile` (Pixel 5 emulation) và `webkit-desktop`.

| Flow | Kết quả |
| --- | --- |
| Initial load | **PASS** — opening không blank; names đúng; không `console.error`/`pageerror` |
| Open invitation | **PASS** — CTA `MỞ THIỆP`, opening đóng, Hero hiện |
| Personalized guest | **PASS** — `/?guest=Nguyen%20Van%20An` hiển thị và prefill an toàn |
| Wedding details | **PASS** — ngày dương/âm và calendar ngày 19 đúng |
| RSVP | **PASS** — validation, inline alert/focus, submit, success và versioned local storage |
| Guestbook | **PASS** — validation/focus, submit, rendered wish và versioned local storage |
| Gift | **PASS** — close button, Escape, focus restore, tabs/ArrowRight/ARIA state |
| Gallery | **PASS** — open, ArrowRight, caption/index update, Escape close |
| Network/runtime | **PASS** — capture critical HTTP failures, console errors và page errors; không phát hiện lỗi |
| Responsive overflow | **PASS** — document/body/real horizontal scroll đều nằm trong viewport |

`test-results/.last-run.json` ghi `status: passed` và không có failed test.

## Responsive và visual QA

Automated overflow sweep chạy trên cả ba browser projects tại:

- 375 × 812
- 390 × 844
- 393 × 852
- 430 × 932
- 768 × 1024
- 1440 × 900

Screenshot production đã được chụp lại sau final polish và kiểm tra bằng mắt. Bộ chính:

- `artifacts/screenshots/390x844-{opening,hero,full}.png`
- `artifacts/screenshots/430x932-{opening,hero,full}.png`
- `artifacts/screenshots/768x1024-{opening,hero,full}.png`
- `artifacts/screenshots/1440x900-{opening,hero,full}.png`
- `artifacts/screenshots/390x844-gift-modal.png`
- `artifacts/screenshots/390x844-lightbox.png`

Kết quả review: typography/crop/spacing nhất quán; modal nằm trong viewport; CTA không bị fixed controls che; không có ảnh vỡ; gallery giữ nhịp asymmetric ở mobile/tablet/desktop; safe-area padding và overlay ổn. Tổng cộng 14 screenshot.

## Accessibility review

Targeted review: **PASS cho scope V1**, không phải chứng nhận WCAG độc lập.

- Semantic headings; opening có heading thật; calendar dùng table/caption/header/cell semantics.
- Labels, `aria-describedby`, validation summary `role="alert"` và focus vào field lỗi đầu tiên.
- Focus ring rõ; control/form borders đủ tương phản; touch targets chính tối thiểu 44 px.
- Modal trap/restores focus, Escape close, background inert và body scroll lock.
- Gift tabs có `aria-controls`/`aria-labelledby`, roving tab index, Arrow/Home/End.
- Lightbox hỗ trợ keyboard, backdrop, touch swipe và focus restore.
- Foreign-language runs chính có `lang="en"`/`lang="fr"`.
- `prefers-reduced-motion` bỏ large movement, smooth scroll cưỡng ép và reveal delay.
- Contrast token review: accent text đạt tối thiểu 6.51:1; interactive border 4.89:1 trên nền ivory.

## Content, privacy và asset audit

| Hạng mục | Kết quả |
| --- | --- |
| Chú rể / cô dâu | **PASS** — `Tuấn Hùng` / `Sao Mai` |
| Ngày dương | **PASS** — ISO `2026-10-19`, display `19.10.2026`, `Thứ Hai` |
| Ngày âm | **PASS** — giữ nguyên dữ liệu cung cấp `10/09 âm lịch`, chi tiết `10 tháng 09 âm lịch` |
| Timezone | **PASS** — `Asia/Ho_Chi_Minh` |
| Fake event data | **PASS** — không có địa chỉ, giờ, phone/email, bank/QR hoặc map URL giả |
| ICS | **PASS** — title config-driven; all-day date và exclusive next-day end đúng |
| Metadata | **PASS** — title/description/robots từ config được inject vào production HTML; không còn token chưa thay |
| Privacy default | **PASS** — meta `noindex, nofollow`; `robots.txt` cho phép crawler đọc metadata nhưng không tạo access control giả |
| Assets | **PASS** — favicon, robots file và sáu ảnh placeholder tồn tại; 0 broken image/critical 404 trong QA |
| Config centralization | **PASS** — names/date/monogram/venue/images/metadata dùng `src/config/wedding.ts` |

## Performance QA

Production bundle cuối:

- JavaScript: 238.82 kB raw / 74.63 kB gzip.
- CSS: 36.61 kB raw / 7.63 kB gzip.
- 12 WOFF2 Latin/Vietnamese font subsets: 145,812 bytes trong bundle; không còn Cyrillic/Greek/WOFF dư thừa.
- Toàn bộ `dist/`: 1,222,718 bytes.
- Sáu ảnh placeholder: 798,832 bytes; hero và dimension reservation ưu tiên, ảnh dưới fold lazy-load.

Cold-load lab check tại 390 × 844, 100 ms latency và 1.6 Mbps download:

- First Contentful Paint / LCP: 760 ms.
- CLS: 0.00263.
- Long tasks: 0.
- Tài nguyên trước khi mở thiệp: 417,230 transfer bytes, 13 requests, chỉ 1 image.

Đây là phép đo local lab để bắt regression, không thay thế Lighthouse/RUM trên domain và CDN thật.

## Placeholder data remaining

| Dữ liệu | Vị trí / trạng thái trước public release |
| --- | --- |
| Ảnh | Sáu ảnh AI trong `public/assets/placeholders/`; **REPLACE BEFORE FINAL RELEASE** |
| Couple/story copy | Introduction, `story`, `copy.storyIntro` là nội dung mẫu cần hai bạn duyệt |
| Sample wishes | `weddingConfig.sampleWishes` cần thay hoặc xóa |
| Venue/maps | `weddingConfig.venue` đang rỗng; UI dùng empty state đúng |
| Actual event time | Chưa có; countdown dùng fallback đầu ngày và ICS hiện là all-day |
| Gift/QR | Bank fields và QR của hai bên đang rỗng; modal dùng empty state |
| Music | `music.src` rỗng; control được ẩn cho tới khi có file hợp pháp |
| RSVP/guestbook backend | V1 dùng local adapters, không đồng bộ giữa thiết bị |
| Public URL/social card | `seo.siteUrl` rỗng; cần domain HTTPS thật để sinh canonical, `og:url` và absolute social image URL |

## Known limitations

1. `localStorage` chỉ phù hợp demo V1; cần backend nếu gia đình muốn thu thập RSVP/lời chúc tập trung.
2. `noindex` không phải bảo vệ truy cập. Nếu thiệp chứa dữ liệu riêng tư, host phải có password/access control phù hợp.
3. Chưa test trên thiết bị vật lý hoặc mạng/CDN production; Chromium mobile là emulation và WebKit được test ở desktop profile.
4. Ảnh, venue, giờ, QR, music và story thật chưa được cung cấp. Đây là content-release checklist, không phải lỗi frontend.

Không có known blocking issue trong frontend V1.

## Suggested next steps

1. Thay nội dung theo `docs/CONTENT_GUIDE.md` và asset checklist trong `docs/PLACEHOLDER_ASSETS.md`.
2. Điền `seo.siteUrl`, kiểm tra social preview trên domain thật và cấu hình privacy/access control.
3. Nối RSVP/guestbook backend nếu cần thu thập tập trung; không đặt secret trong frontend.
4. Test lại QR, map, music, crop ảnh và full QA trên ít nhất một iPhone và một Android thật trước public release.

## Final sign-off

- QA owner: Codex — automated gates + visual/accessibility/performance audit
- Build tested: local snapshot, 2026-08-15 (folder không có Git commit)
- Production preview: `http://127.0.0.1:4173/`, HTTP 200
- Release decision: **APPROVED FOR V1 CONTENT REPLACEMENT; NO BLOCKING FRONTEND ISSUES**
