# QA Report — Wedding Invitation V2.1 Polish

> Trạng thái: **PASS — V2.1 visual contrast polish shipped**. Background vẫn soft pink/ivory; text, borders, CTA và decorative details được nâng độ tương phản lên rõ rệt. Đổi sang palette có độ đậm hơn (`#A83A51` rose primary, `#7B2D3E` deep rose cho heading, `#3B2930` text) để giải quyết feedback "màu sắc hơi nhạt, text chưa đủ nổi, viền chưa đủ rõ".

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

## Contrast improvements — palette migration

| Token | Before (V2.1) | After (polish) | Use |
| --- | --- | --- | --- |
| `--color-bg` | `#fff8f7` | `#fff8f7` | Base warm white |
| `--color-ivory` | `#fff9f2` | `#fff9f7` | Paper card surface |
| `--color-paper` | `#fdf3ee` | `#fffbf7` | Card paper |
| `--color-paper-warm` | — | `#fbefec` | Hover background |
| `--color-blush` | `#f8e8e8` | `#fbeaec` | Section background tint |
| `--color-blush-strong` | — | `#f5dce0` | Label badge + selected state |
| `--color-rose` | `#b9737c` | **`#a83a51`** | Primary rose / CTA |
| `--color-rose-strong` | — | `#8e3045` | CTA hover |
| `--color-rose-deep` | `#8a5059` | **`#7b2d3e`** | Heading, couple names, labels |
| `--color-rose-dusty` | `#ddaeb3` | **`#d89aa8`** | Card border |
| `--color-rose-line` | — | `#d6bcc1` | Inner divider lines |
| `--color-text` | `#49383a` | **`#3b2930`** | Body text (đậm hơn) |
| `--color-text-strong` | `#6c5a5d` | **`#2a1c22`** | Input value, dd |
| `--color-text-soft` | `#806d70` | `#70575e` | Secondary text |
| `--color-muted` | `#806d70` | `#8a7780` | Hint text |
| `--color-gold` | `#c6a56b` | `#b88a4b` | Champagne gold accents |

## Color hierarchy

- **Main headings**: `--color-rose-deep` `#7b2d3e`
- **Couple names**: `--color-rose-deep` `#7b2d3e`
- **Section labels**: `--color-rose` `#a83a51`
- **Body text**: `--color-text` `#3b2930`
- **Secondary text**: `--color-text-soft` `#70575e`
- **Borders**: `--color-rose-dusty` `#d89aa8` (1.5px) + `--color-rose-line` `#d6bcc1` (inner)
- **CTA primary**: bg `--color-rose` `#a83a51`, text `#fff9f7`, with rose-tinted shadow
- **CTA hover**: `--color-rose-strong` `#8e3045` + deeper shadow

## Typography hierarchy

| Element | Mobile | Desktop | Weight | Color |
| --- | --- | --- | --- | --- |
| Couple names | clamp(2.4rem, 11vw, 4.2rem) | inherited | 500 | deep rose |
| Main headings | clamp(1.85rem, 4vw, 2.6rem) | same | 500 | deep rose |
| Section labels (NHÀ TRAI/GÁI) | .68rem | .68rem | 700 | deep rose on blush-strong |
| Event title | clamp(1.5rem, 3.5vw, 1.95rem) | same | 500 | deep rose |
| Date day | clamp(2.6rem, 7vw, 3.2rem) | same | 600 | deep rose |
| Body | 1rem | 1rem | 400 | text |
| Small labels | .68–.75rem | same | 600–700 | rose |

## Borders & depth

### Borders
- **Main paper/card borders**: `1.5px solid #d89aa8` (rose-dusty).
- **Decorative inner line**: `1px solid #d6bcc1` (rose-line).
- **CTA outline**: `1.5px solid #a83a51`.

### Shadows (3-tier system)
- **Paper shadow** (`--shadow-paper`): `0 1.5rem 3.4rem -1.4rem rgb(123 45 62 / 14%), 0 .6rem 1.2rem -0.6rem rgb(123 45 62 / 8%)`
- **Image shadow** (`--shadow-image`): `0 1.8rem 3.4rem -1rem rgb(123 45 62 / 22%), 0 .8rem 1.4rem -0.4rem rgb(123 45 62 / 12%)`
- **Modal shadow** (`--shadow-modal`): `0 2.4rem 5rem -1rem rgb(80 40 50 / 36%)`

### Cover card
```css
box-shadow:
  0 1.6rem 3.6rem -1.4rem rgb(123 45 62 / 18%),
  0 .6rem 1.4rem -0.5rem rgb(123 45 62 / 10%);
```

## Main Invitation — overlap & depth

- Photo wrapped in `.invite__photo-wrap` which has `::before` soft pink paper shape `inset: -2% -2% -2% -2%` with image shadow — gives the photo dimensional depth.
- `.invite__photo` rotated `-1.4deg` with rose-dusty border + gold inner hairline + image shadow.
- `.invite__card` (the paper below) has `margin-top: -3.75rem` (≈ 22% of photo height) overlap onto photo.
- Photo and card together form the "background → photo → paper → typography" layering.
- Couple names at `clamp(2.6rem, 9vw, 3.6rem)` with subtle text-shadow `0 2px 10px rgba(123, 45, 62, .06)`.
- Date strip uses deep rose bold + text-strong for non-date labels.

## Events — info hierarchy

- `.event-card` background `--color-paper` + border `1.5px solid --color-rose-dusty`.
- **Top rose gradient bar** (`linear-gradient(90deg, #a83a51, #7b2d3e)`) — 3px ceremonial accent at top.
- **Inner decorative line** (`1px solid #d89aa899` inset 0.45rem) — paper card double-line feel.
- **NHÀ TRAI / NHÀ GÁI label badge**: blush-strong background, deep rose text, rounded rectangle (4px) with padding.
- **Date row**: top + bottom border (rose-line), large 19-day number in deep rose, weekday uppercase.
- **Info rows** (Âm lịch / Giờ / Địa điểm): dt = rose uppercase, dd = text-strong with strong-weight venue name.
- **CTA hierarchy**: "Thêm vào lịch" = primary rose (with shadow), "Chỉ đường" = outline rose.
- `.event-card--primary` (when side matches) uses stronger border (`--color-rose`) + paper shadow.

## Album — color & composition

- Section background: `linear-gradient(180deg, #fff8f7 0%, #fbeaec 100%)` — soft pink tint that grows toward the bottom.
- Heading `--color-rose-deep` for stronger focal point.
- Album blocks use ivory paper frames with `box-shadow: var(--shadow-image)` (rose-tinted) for clear depth.
- Captions: rose label number + text-soft description.

## RSVP — form contrast

- Section background: dual radial-gradient blush + linear gradient to paper.
- `.rsvp__card`: `1.5px solid --color-rose-dusty` + paper shadow + inner decorative line.
- Heading: `--color-rose-deep` for stronger presence.
- **Form inputs**: `1.5px solid #c9a7ae` (interactive-border) by default; hover → `#b97584`; focus → `#a83a51` + 3px rose-tinted ring.
- **Choice pills**: unselected = ivory + `#d6bcc1` border; selected = blush-strong + `#a83a51` border + inset 1px rose + strong text.
- **Submit button**: rose primary with `box-shadow: 0 .65rem 1.4rem -0.6rem #a83a516b` + active scale `.98`.
- **Gift CTA**: dashed border + soft paper-warm hover.

## Closing — overlay readability

- `.closing__veil` updated to `radial-gradient(circle at 50% 60%, #ffe8e866 0%, #7b2d3e80 45%, #5b1d2de0 100%)` — soft rose radial at top, deep rose at bottom.
- Closing paper card: 1.5px rose border, paper shadow.
- Heading `--color-rose-deep` for stronger focal point.
- Date row: deep rose + soft-rose small text.

## Tests

| Gate | Result |
| --- | --- |
| `npm run lint` | **PASS** exit code 0 |
| `npm run typecheck` | **PASS** TypeScript strict |
| `npm run test` | **PASS** 6 files, **39/39** |
| `npm run build` | **PASS** JS 249.28 kB / 77.50 kB gzip, CSS **49.40 kB / 9.52 kB gzip** |
| `npm run test:e2e` | **PASS** **19/19** trên chromium-desktop, chromium-mobile, webkit-desktop |

## Screenshots

V2.1 polish set in `artifacts/screenshots/`:

- `v2-390x844-cover.png`
- `v2-390x844-cover-mid-transition.png`
- `v2-390x844-invitation-personalized.png`
- `v2-390x844-ceremony.png`
- `v2-390x844-photo-story.png`
- `v2-390x844-rsvp.png`
- `v2-390x844-gift-modal.png`
- `v2-390x844-finale.png`
- `v2-390x844-full.png`
- `v2-430x932-invitation.png`
- `v2-430x932-full.png`
- `v2-1440x900-cover.png`
- `v2-1440x900-invitation.png`
- `v2-1440x900-ceremony.png`
- `v2-1440x900-photo-story.png`
- `v2-1440x900-full.png`

16 screenshots — same coverage as V2.1 base.

## Visual hierarchy check (squint test)

| Composition | Focal point (squint) | Result |
| --- | --- | --- |
| Opening | Couple names "Tuấn Hùng & Sao Mai" | ✅ Clear (deep rose serif) |
| Main invitation | Photo + couple names | ✅ Clear (rose paper card overlap photo) |
| Events | Date number + venue name | ✅ Clear (large 19 + bold venue) |
| Album | Hero photos | ✅ Clear (rose-tinted image shadows) |
| RSVP | Submit button + name field | ✅ Clear (rose CTA + visible borders) |
| Final | Photo + "Cảm ơn bạn" + signature | ✅ Clear (rose deep on rose-tinted overlay) |

## Self-review

- ✅ **Soft background**: sections use blush tints only where ceremonial focus needed; cards stay ivory.
- ✅ **Strong rose details**: headings, names, dates, CTAs, label badges all use deep rose / primary rose.
- ✅ **Decorative gold kept subtle**: only on inner hairline + seal text, not body text.
- ✅ **Borders strong not invisible**: 1.5px solid rose-dusty on every paper card.
- ✅ **CTAs pop**: rose with rose-tinted shadow.
- ✅ **Main invitation layered**: background → soft paper shape → photo with shadow → overlapping paper card → typography.
- ✅ **Events legible at-a-glance**: NHÀ TRAI / NHÀ GÁI label badge + large date number + bold venue.
- ✅ **Album has a tinted area**: linear gradient to blush at bottom.
- ✅ **RSVP form contrast**: borders + selected state + CTA shadow.
- ✅ **Mobile + desktop both polished**: viewport tests pass at 375/390/393/430/768/1440.

## Known issues

1. The album's gradient background only becomes visible at the bottom of the section on mobile (small sections). On desktop full-page it's more apparent.
2. Section labels use `clamp(2.4rem, 11vw, 4.2rem)` for couple names — on very wide desktop viewports the names stay around 4.2rem which is intentional for paper-card scale.
3. No content placeholder for actual venue/time (Nhà Trai/Nhà Gái) — empty-state UI shows correctly per the existing template.

## Final sign-off

- QA owner: V2.1 contrast polish — automated gates + visual review
- Build tested: local snapshot, 2026-08-15
- Production preview: `http://127.0.0.1:4173/`, HTTP 200
- Release decision: **APPROVED FOR V2.1 CONTENT REPLACEMENT; NO BLOCKING FRONTEND ISSUES**
