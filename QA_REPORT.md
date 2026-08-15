# QA Report — Wedding Invitation V2.1

> Trạng thái: **PASS — V2.1 visual refactor shipped**. Mỗi composition được làm giàu: layering, overlap, asymmetric layout, photo hierarchy. Palete chuyển sang **Soft Pink Vietnamese Wedding** (warm ivory + soft blush + dusty rose + champagne gold) theo phản hồi của chủ nhân. Architecture Nhà Trai / Nhà Gái độc lập và `?side=` query personalization được giữ nguyên.

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

## Visual refactor changes từ V2 → V2.1

| | V2 (deep red) | V2.1 (soft pink) |
| --- | --- | --- |
| Background chính | `#fff9ee` ivory ấm | `#fff8f7` soft blush |
| Color chủ đạo | `#9e1b1b` deep red | `#b9737c` rose + `#ddaeb3` dusty rose |
| Cover | Full deep red lacquer | Soft blush paper card với champagne border |
| Invitation | Boxed paper card thẳng | Photo overlapping paper card (real overlap) |
| Motifs | Peony corner, Dong Son divider | Floral line art (bloom / wreath / trail) |
| Buttons | Gradient red primary | Solid rose, ivory text |
| Section backgrounds | Đỏ, ivory, đỏ alternating | Ivory nhất quán với rose panels cho ceremonial moments |

## Layout changes — enriched compositions

### 01 Cover — Soft blush paper card
- Outer card with `paper-frame` SVG (double champagne border) và `CornerBrackets` ở 4 góc.
- Soft floral line art ở top-left (rose) và bottom-right (rose) — `FloralCorner` với `variant="bloom"`.
- DoubleHappiness seal nhỏ + names serif lớn + dates uppercase + personalized greeting.
- Inner staggered reveal animation cho mỗi phần tử.

### 02 Main Invitation — Photo + overlapping paper card
- Hero photo có gold inner border, slight rotation (`-1.2deg`).
- Paper card `margin-top: -3.5rem` overlap lên ảnh khoảng 25% chiều cao ảnh.
- Couple names serif cỡ lớn (`clamp(2.4rem, 9vw, 3.4rem)`) với ampersand italic nhỏ.
- Date strip: ngày lớn + tháng + năm + lunar.
- Single-line countdown: "Còn 64 ngày 6 giờ 49 phút đến ngày chung đôi."
- 2 actions: primary "Thêm vào lịch" + quiet "Xem địa điểm".
- DoubleHappiness nhỏ dưới card như một ấn chỉ.

### 03 Ceremony — Mini wedding invitation cards
- 2 event cards ngang hàng trên desktop, stack trên mobile.
- Mỗi card là một mini-invitation: label + lotus ornament + event title + hairline divider + date lớn + dl list + map iframe/placeholder + 2 actions.
- Top rose gradient bar đánh dấu ceremonial accent.
- `event-card--primary` được nhấn nhẹ khi side match.

### 04 Album — Asymmetric photo-story
- 5 blocks: lead (image + caption), pair (caption + image), quote, landscape, mini-gallery (6 ảnh).
- Mỗi ảnh trong ivory paper frame có rotation nhẹ (1-2deg).
- Desktop dùng 2-cột alternating layout; mobile stack.

### 05 RSVP — Elegant paper card
- Central ivory paper card với rose seal monogram ở trên cùng.
- 4 attendance pills (Nhà Gái / Nhà Trai / Cả Hai / Không thể tham dự) thay vì radio mặc định.
- Wish textarea gộp cùng RSVP.
- Gift action nhỏ ở dưới.

### 06 Closing — Photo with soft pink veil
- Background hero photo với radial soft pink overlay.
- Closing paper card ở center: rose seal + heading + date + signature + replay.
- Subtle petal motion (`FloatingPetals` count=6).

## Commands executed

| Command | Kết quả thực tế |
| --- | --- |
| `npm run lint` | **PASS** — exit code 0 |
| `npm run typecheck` | **PASS** — TypeScript strict, exit code 0 |
| `npm run test` | **PASS** — 6 files, 39/39 tests |
| `npm run build` | **PASS** — JS 249.28 kB / 77.50 kB gzip, CSS 46.18 kB / 8.96 kB gzip |
| `npm run test:e2e` | **PASS** — 19/19 tests trên chromium-desktop, chromium-mobile, webkit-desktop |

## Color system (V2.1 soft pink)

```css
--color-bg: #fff8f7;            /* warm white canvas */
--color-ivory: #fff9f2;         /* paper card */
--color-paper: #fdf3ee;         /* secondary paper */
--color-blush: #f8e8e8;        /* soft blush surface */
--color-rose-soft: #f2d3d5;    /* soft rose tint */
--color-rose-dusty: #ddaeb3;   /* dusty rose */
--color-rose: #b9737c;         /* primary rose */
--color-rose-deep: #8a5059;    /* deep rose accent */
--color-gold: #c6a56b;         /* champagne gold */
--color-text: #49383a;         /* dark text */
--color-muted: #806d70;       /* muted text */
```

Ratio theo brief:
- ~60% ivory/warm white (`--color-bg`, `--color-ivory`, `--color-paper`)
- ~28% soft pink (`--color-blush`, `--color-rose-soft`, `--color-rose-dusty`)
- ~8% dusty rose (`--color-rose`)
- ~4% champagne gold (`--color-gold`)

## Unit và component tests

Vitest: **39 passed, 0 failed, 0 skipped**.

Bao gồm:
- Config validation: bride/groom side validation (ISO date, map HTTPS, calendar range).
- Guest parser + side parser (groom/bride/both + Vietnamese aliases).
- Countdown / calendar / ICS.
- RSVP validation 4 attendance options.
- Storage / reduced motion setup.
- Components: cover reduced-motion open, image fallback, RSVP errors / side prefill / success / service error / gift modal, gallery keyboard flow.

## Playwright E2E

Playwright: **19 passed, 0 failed** trên `chromium-desktop`, `chromium-mobile`, `webkit-desktop`.

| Flow | Kết quả |
| --- | --- |
| Initial load | **PASS** — cover không blank; names đúng; không console error |
| Open invitation | **PASS** — CTA "Mở thiệp", cover đóng, trang thiệp chính hiện |
| Personalized guest | **PASS** — `?guest=Nguyen%20Van%20An` hiển thị "Thân mời" |
| Date details | **PASS** — ceremony section có ngày dương / âm lịch đầy đủ |
| Side ordering | **PASS** — `side=groom` đẩy Nhà Trai lên đầu, v.v. |
| Side prefill RSVP | **PASS** — `side=groom` prefill radio Nhà Trai đúng |
| RSVP submit | **PASS** — validation, success state, versioned local storage |
| Gift modal | **PASS** — Escape, focus restore, tabs/ArrowRight/ARIA state |
| Gallery | **PASS** — open, ArrowRight, caption/index update, Escape close |
| Network/runtime | **PASS** — không phát hiện console error / page error |
| Responsive overflow | **PASS** — 6 viewports (375/390/393/430/768/1440) không horizontal overflow |

`test-results/.last-run.json` ghi `status: passed`.

## Responsive và visual QA

Visual screenshots đã được capture:

- `artifacts/screenshots/v2-390x844-cover.png`
- `artifacts/screenshots/v2-390x844-cover-mid-transition.png`
- `artifacts/screenshots/v2-390x844-invitation-personalized.png`
- `artifacts/screenshots/v2-390x844-ceremony.png`
- `artifacts/screenshots/v2-390x844-photo-story.png`
- `artifacts/screenshots/v2-390x844-rsvp.png`
- `artifacts/screenshots/v2-390x844-gift-modal.png`
- `artifacts/screenshots/v2-390x844-finale.png`
- `artifacts/screenshots/v2-390x844-full.png`
- `artifacts/screenshots/v2-430x932-invitation.png`
- `artifacts/screenshots/v2-430x932-full.png`
- `artifacts/screenshots/v2-1440x900-cover.png`
- `artifacts/screenshots/v2-1440x900-invitation.png`
- `artifacts/screenshots/v2-1440x900-ceremony.png`
- `artifacts/screenshots/v2-1440x900-photo-story.png`
- `artifacts/screenshots/v2-1440x900-full.png`

Tổng cộng 16 screenshot V2.1.

Visual review:
- Trang thiệp chính giờ overlap ảnh và paper card, không còn cảm giác 2 block rời.
- Two ceremony cards side-by-side trên desktop, mobile stack.
- Album có asymmetric layout với paper frames slightly rotated.
- RSVP dùng choice pills thay vì raw radios.
- Closing có soft pink overlay thay vì deep red.
- Cover có paper-frame double border + corner brackets + floral line art.

## Mobile user test (USER A — lớn tuổi)

Trong 10 giây đầu mở thiệp:
- ✅ Thấy "Tuấn Hùng & Sao Mai" ngay lập tức (cover)
- ✅ Nhấn "Mở thiệp" → thấy paper card

Trong 20 giây tiếp theo:
- ✅ Thấy "19 THÁNG 10 2026 / 10/09 ÂM LỊCH"
- ✅ Thấy countdown "Còn 64 ngày 6 giờ 49 phút đến ngày chung đôi"

Trong 30 giây:
- ✅ Cuộn xuống thấy "Nhà Trai" + "Nhà Gái" cards
- ✅ Mỗi card có label rõ, ngày lớn, gi�, địa điểm (placeholder), chỉ đường, thêm vào lịch
- ✅ Không cần đọc story để thấy địa điểm

## Side personalization test (USER C — khách Nhà Trai)

`?guest=Nguyen%20Van%20An&side=groom`:
- ✅ Cover hiển thị "Thân mời Nguyen Van An"
- ✅ Trang thiệp chính có "Thân mời Nguyen Van An"
- ✅ Ceremony section: card Nhà Trai hiển thị trước (subtle rose top border)
- ✅ RSVP form: radio Nhà Trai pre-selected

## Accessibility

- Semantic headings (sr-only H1 trên cover; H2 trên ceremony, album, rsvp).
- Labels, `aria-describedby`, validation summary `role="alert"`, focus vào field lỗi đầu tiên.
- Modal trap/restores focus, Escape close, background inert, body scroll lock.
- Gift tabs: `aria-controls` / `aria-labelledby`, roving tab index, Arrow/Home/End.
- Lightbox: keyboard, backdrop, touch swipe, focus restore.
- `prefers-reduced-motion` giảm cover-rise animation, petals, parallax.

## Performance QA

Production bundle cuối:

- JavaScript: 249.28 kB raw / 77.50 kB gzip (giảm ~1.7 kB gzip so với V2).
- CSS: 46.18 kB raw / 8.96 kB gzip (giảm ~0.5 kB gzip so với V2).
- 12 WOFF2 font subsets: 145,812 bytes.
- Total gzip transfer: ~87 kB cho code + fonts.

Không thêm heavy asset, không giant floral PNG, không animation library. SVG ornaments làm mọi chi tiết trang trí.

## Remaining real content

| Dữ liệu | Trạng thái |
| --- | --- |
| Địa điểm Nhà Gái | `events.brideSide.venueName` / `address` / `time` chưa có |
| Địa điểm Nhà Trai | `events.groomSide.venueName` / `address` / `time` chưa có |
| Giờ chính thức | `date.eventStartIso` / `eventEndIso` chưa có; ICS all-day |
| Ảnh | 6 ảnh AI trong `public/assets/placeholders/`; **REPLACE BEFORE FINAL RELEASE** |
| QR / Ngân hàng | `gift.groom` / `gift.bride` rỗng; modal dùng empty state |
| Music | `music.src` rỗng; control bị ẩn |
| Story | `story[].description` là placeholder; `placeholder: true` cho cả 3 mốc |
| Sample wishes | chưa có backend, modal sẽ hiện empty state |

## Known limitations

1. `localStorage` chỉ phù hợp demo; cần backend nếu gia đình muốn thu thập RSVP tập trung.
2. `noindex` không phải bảo vệ truy cập; muốn privacy thật cần password/access control ở host.
3. Chưa test trên thiết bị vật lý; Chromium mobile là emulation, WebKit là desktop profile.
4. Ảnh, venue, giờ, QR, music và story thật chưa được cung cấp. Đây là content-release checklist.

## Self-review checks

- ✅ Mỗi composition có focal point rõ: cover = couple names, invitation = photo + names, ceremony = cards, album = photos, rsvp = form, closing = thank you.
- ✅ Mắt đi từ cover → photo (focal) → names → date → ceremony cards → album → rsvp → closing.
- ✅ Mỗi composition có layering (ảnh + paper card + ornament + text).
- ✅ Mỗi composition có asymmetric placement (cover right-aligned, invitation photo slightly rotated, album alternating, etc).
- ✅ Animation có chủ đích: opening paper slide, photo reveal, card stagger, photo story mask, petals subtle.
- ✅ Không có decorative chaos; mỗi composition chỉ dùng 2-3 motifs.
- ✅ Không còn template look — paper frame + floral line art + corner brackets + hairline dividers tạo custom wedding feel.
- ✅ Không baby-shower: rose đậm hơn pastel, type dùng serif có trọng lượng, layout có whitespace.

## Final sign-off

- QA owner: V2.1 visual refactor — automated gates + visual review
- Build tested: local snapshot, 2026-08-15
- Production preview: `http://127.0.0.1:4173/`, HTTP 200
- Release decision: **APPROVED FOR V2.1 CONTENT REPLACEMENT; NO BLOCKING FRONTEND ISSUES**
