import type { WeddingConfig } from '../types/wedding.ts'
import { eventHasMeaningfulDetails, safeExternalUrl } from '../utils/ceremony.ts'

const placeholder = (file: string) => `/assets/placeholders/${file}`
const responsiveSet = (stem: string, widths: number[], sourceWidth: number) => [
  ...widths.map((width) => `${placeholder(`${stem}-${width}.webp`)} ${width}w`),
  `${placeholder(`${stem}.webp`)} ${sourceWidth}w`,
].join(', ')

const heroSizes = '(max-width: 1536px) 100vw, 1536px'
const portraitSizes = '(max-width: 1023px) calc(100vw - 40px), 470px'
const gallerySizes = '(max-width: 1023px) calc(100vw - 40px), 720px'

const emptyCalendar = { eventStartIso: '', eventEndIso: '' }

export const weddingConfig: WeddingConfig = {
  couple: {
    groom: {
      firstName: 'Hùng', fullName: 'Tuấn Hùng', role: 'Chú rể',
      portrait: { src: placeholder('couple-groom.webp'), srcSet: responsiveSet('couple-groom', [480, 720], 1024), sizes: portraitSizes, alt: 'Ảnh minh họa chú rể mặc áo dài đỏ đô thêu họa tiết Đông Sơn', aspectRatio: '2 / 3', objectPosition: '50% 42%' },
      introduction: 'Một người chọn bình yên trong những điều giản dị và trân trọng từng khoảnh khắc được sẻ chia.',
    },
    bride: {
      firstName: 'Mai', fullName: 'Sao Mai', role: 'Cô dâu',
      portrait: { src: placeholder('couple-bride.webp'), srcSet: responsiveSet('couple-bride', [480, 720], 1024), sizes: portraitSizes, alt: 'Ảnh minh họa cô dâu mặc áo dài đỏ, cầm bó hoa sen và mẫu đơn', aspectRatio: '2 / 3', objectPosition: '50% 40%' },
      introduction: 'Một người luôn tin rằng yêu thương đẹp nhất khi được nuôi dưỡng bằng sự chân thành mỗi ngày.',
    },
    signature: 'Hùng & Mai', monogram: 'H × M',
  },
  date: {
    iso: '2026-10-19', countdownIso: '2026-10-19T00:00:00+07:00', eventStartIso: '', eventEndIso: '', display: '19.10.2026',
    displayLong: '19 tháng 10 năm 2026', weekday: 'Thứ Hai', lunar: '10/09 âm lịch',
    lunarLong: '10 tháng 09 âm lịch', timezone: 'Asia/Ho_Chi_Minh',
  },
  families: {
    groomParents: { father: '', mother: '' },
    brideParents: { father: '', mother: '' },
  },
  events: [
    {
      id: 'bride-event',
      side: 'bride',
      enabled: false,
      label: '',
      eventTitle: '',
      date: '',
      lunarDate: '',
      guestArrivalTime: '',
      ceremonyTime: '',
      banquetTime: '',
      venueName: '',
      address: '',
      phone: '',
      mapNavigationUrl: '',
      mapEmbedUrl: '',
      calendar: { ...emptyCalendar },
    },
    {
      id: 'groom-event',
      side: 'groom',
      enabled: false,
      label: '',
      eventTitle: '',
      date: '',
      lunarDate: '',
      guestArrivalTime: '',
      ceremonyTime: '',
      banquetTime: '',
      venueName: '',
      address: '',
      phone: '',
      mapNavigationUrl: '',
      mapEmbedUrl: '',
      calendar: { ...emptyCalendar },
    },
  ],
  hero: { src: placeholder('hero.webp'), srcSet: responsiveSet('hero', [640, 960, 1280], 1536), sizes: heroSizes, alt: 'Ảnh minh họa cặp đôi mặc áo dài cưới đỏ bên hiên nhà cổ Việt Nam', aspectRatio: '3 / 2', objectPosition: '50% 48%' },
  // Chưa có câu chuyện thật: để trống để UI chỉ hiện lời dẫn trung tính + gallery.
  // Thêm tối đa 3 mốc theo StoryChapter khi cặp đôi cung cấp nội dung đã xác nhận.
  story: [],
  gallery: [
    { id: 'cinematic-wide', src: placeholder('hero.webp'), srcSet: responsiveSet('hero', [640, 960, 1280], 1536), sizes: gallerySizes, alt: 'Ảnh minh họa cặp đôi mặc áo dài cưới đỏ bên hiên nhà cổ Việt Nam', aspectRatio: '3 / 2', objectPosition: '50% 48%', layout: 'feature', caption: 'Ngày mình thành đôi' },
    { id: 'portrait-one', src: placeholder('couple-bride.webp'), srcSet: responsiveSet('couple-bride', [480, 720], 1024), sizes: gallerySizes, alt: 'Ảnh minh họa cô dâu mặc áo dài đỏ, cầm bó hoa sen và mẫu đơn', aspectRatio: '2 / 3', objectPosition: '50% 40%', layout: 'portrait', caption: 'Nét duyên ngày cưới' },
    { id: 'story-hands', src: placeholder('story-01.webp'), srcSet: responsiveSet('story-01', [640, 960, 1280], 1536), sizes: gallerySizes, alt: 'Ảnh minh họa đôi tay cô dâu chú rể được nối bằng sợi chỉ đỏ bên hiên nhà', aspectRatio: '3 / 2', objectPosition: '50% 50%', layout: 'detail', caption: 'Duyên se chỉ đỏ' },
    { id: 'story-wide', src: placeholder('story-02.webp'), srcSet: responsiveSet('story-02', [640, 960, 1280], 1536), sizes: gallerySizes, alt: 'Ảnh minh họa bàn trà lễ cưới Việt với hoa sen, trầu cau và khăn lụa đỏ', aspectRatio: '3 / 2', objectPosition: '50% 50%', layout: 'landscape', caption: 'Hương trà ngày hỷ' },
  ],
  music: { title: '', artist: '', src: '' },
  gift: {
    enabled: false,
    groom: { label: 'Nhà Trai', bankName: '', accountName: '', accountNumber: '', qrImage: '' },
    bride: { label: 'Nhà Gái', bankName: '', accountName: '', accountNumber: '', qrImage: '' },
  },
  seo: {
    title: 'Tuấn Hùng & Sao Mai | 19.10.2026',
    description: 'Trân trọng mời bạn đến chung vui trong ngày đặc biệt của Tuấn Hùng & Sao Mai.',
    image: '/assets/social-preview.jpg', imageWidth: 1200, imageHeight: 630,
    robots: 'index, follow', siteUrl: '',
  },
  features: { music: true, rsvp: true, wish: true, gift: false, personalizedGuest: true, gallery: true },
  copy: {
    coverEyebrow: 'Trân trọng kính mời',
    coverHint: 'Chạm để mở lời mời',
    invitationTitle: 'Thiệp cưới',
    invitationGeneric: 'Trân trọng kính mời',
    invitationPersonalized: 'Thân mời',
    invitationBody: 'đến chung vui và chứng kiến khoảnh khắc chúng mình bắt đầu một chương mới.',
    storyIntro: 'Không phải một câu chuyện cổ tích — chỉ là hai người, qua những ngày bình thường, đã chọn ở lại bên nhau.',
    storyQuote: 'Có những khoảnh khắc chỉ cần được nhìn thấy, không cần được giải thích.',
    ceremonyIntro: 'Thông tin buổi lễ sẽ được hiển thị sau khi gia đình xác nhận.',
    ceremonyTitle: 'Thông tin hôn lễ',
    detailsNote: 'Địa điểm và giờ cử hành sẽ được cập nhật ngay khi gia đình xác nhận.',
    finalTitle: 'Cảm ơn bạn',
    finalMessage: 'Vì đã trở thành một phần trong ngày đặc biệt của chúng mình.',
    rsvpTitle: 'Xác nhận tham dự',
    rsvpIntro: 'Sự hiện diện của bạn là niềm vui của chúng mình. Xin vui lòng hồi âm để chúng mình được đón tiếp thật chu đáo.',
    rsvpThanks: 'Cảm ơn bạn đã xác nhận. Hùng & Mai rất mong được gặp bạn trong ngày đặc biệt này.',
    giftLabel: 'Gửi quà mừng',
    giftIntro: 'Sự hiện diện của bạn đã là món quà ý nghĩa nhất. Nếu muốn gửi thêm lời chúc theo một cách khác, bạn có thể mở hộp quà bên dưới.',
  },
  sampleWishes: [
    { id: 'sample-1', name: 'Một người bạn', message: 'Chúc hai bạn luôn tìm thấy bình yên và niềm vui trong từng ngày bên nhau.' },
    { id: 'sample-2', name: 'Khách mời', message: 'Mong hành trình mới của hai bạn sẽ đầy ắp tiếng cười và những điều dịu dàng.' },
  ],
}

export function validateWeddingConfig(config: WeddingConfig): string[] {
  const errors: string[] = []
  if (!config.couple.groom.fullName.trim()) errors.push('Missing groom name')
  if (!config.couple.bride.fullName.trim()) errors.push('Missing bride name')
  if (!isValidIsoDate(config.date.iso)) errors.push('Invalid ISO wedding date')
  if (!config.date.lunar.trim()) errors.push('Missing lunar date')
  if (!config.date.timezone.trim()) errors.push('Missing timezone')
  if (Boolean(config.date.eventStartIso) !== Boolean(config.date.eventEndIso)) errors.push('Wedding event requires both start and end times')
  if (config.date.eventStartIso && config.date.eventEndIso) {
    const start = new Date(config.date.eventStartIso)
    const end = new Date(config.date.eventEndIso)
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) errors.push('Invalid wedding event time range')
  }
  const eventIds = new Set<string>()
  for (const [index, event] of config.events.entries()) {
    const eventId = event.id.trim()
    const eventName = event.label.trim() || eventId || `event ${index + 1}`

    if (!eventId) errors.push(`Missing ceremony event id at index ${index}`)
    else if (eventIds.has(eventId)) errors.push(`Duplicate ceremony event id: ${eventId}`)
    else eventIds.add(eventId)

    if (event.enabled && !eventHasMeaningfulDetails(event)) errors.push(`${eventName} is enabled without ceremony details`)
    if (event.date && !isValidIsoDate(event.date)) errors.push(`Invalid ISO date for ${eventName}`)

    const hasCalendarStart = Boolean(event.calendar.eventStartIso.trim())
    const hasCalendarEnd = Boolean(event.calendar.eventEndIso.trim())
    if (hasCalendarStart !== hasCalendarEnd) errors.push(`${eventName} event requires both start and end times`)
    if (hasCalendarStart && hasCalendarEnd) {
      const start = new Date(event.calendar.eventStartIso)
      const end = new Date(event.calendar.eventEndIso)
      if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) errors.push(`Invalid ${eventName} event time range`)
    }

    if (event.mapNavigationUrl.trim() && !safeExternalUrl(event.mapNavigationUrl)) errors.push(`${eventName} map URL must be a safe HTTPS URL`)
    if (event.mapEmbedUrl.trim() && !safeExternalUrl(event.mapEmbedUrl)) errors.push(`${eventName} map embed must be a safe HTTPS URL`)
  }
  if (config.gallery.length > 4) errors.push('Gallery must contain at most 4 images')
  if (!config.seo.title.trim() || !config.seo.description.trim()) errors.push('Missing SEO metadata')
  if (config.seo.siteUrl) {
    try {
      const siteUrl = new URL(config.seo.siteUrl)
      if (!['http:', 'https:'].includes(siteUrl.protocol)) errors.push('Wedding site URL must use HTTP or HTTPS')
    } catch {
      errors.push('Invalid wedding site URL')
    }
  }
  return errors
}

function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}
