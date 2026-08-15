import type { WeddingConfig } from '../types/wedding.ts'

const placeholder = (file: string) => `/assets/placeholders/${file}`
const responsiveSet = (stem: string, widths: number[], sourceWidth: number) => [
  ...widths.map((width) => `${placeholder(`${stem}-${width}.webp`)} ${width}w`),
  `${placeholder(`${stem}.webp`)} ${sourceWidth}w`,
].join(', ')

const heroSizes = '(max-width: 719px) calc(100vw - 36px), (max-width: 1439px) 86vw, 1060px'
const portraitSizes = '(max-width: 1023px) calc(100vw - 40px), 470px'
const storySizes = '(max-width: 1023px) calc(100vw - 80px), 550px'
const gallerySizes = '(max-width: 1023px) calc(100vw - 40px), 720px'

const emptyCalendar = { eventStartIso: '', eventEndIso: '' }

export const weddingConfig = {
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
  events: {
    brideSide: {
      enabled: true,
      label: 'Nhà Gái',
      eventTitle: '',
      date: '',
      lunarDate: '',
      time: '',
      venueName: '',
      address: '',
      mapNavigationUrl: '',
      mapEmbedUrl: '',
      calendar: { ...emptyCalendar },
    },
    groomSide: {
      enabled: true,
      label: 'Nhà Trai',
      eventTitle: '',
      date: '',
      lunarDate: '',
      time: '',
      venueName: '',
      address: '',
      mapNavigationUrl: '',
      mapEmbedUrl: '',
      calendar: { ...emptyCalendar },
    },
  },
  hero: { src: placeholder('hero.webp'), srcSet: responsiveSet('hero', [640, 960, 1280], 1536), sizes: heroSizes, alt: 'Ảnh minh họa cặp đôi mặc áo dài cưới đỏ bên hiên nhà cổ Việt Nam', aspectRatio: '3 / 2', objectPosition: '50% 48%' },
  story: [
    {
      chapter: 'Mốc 01', year: 'Khởi đầu', title: 'Một cuộc gặp thật dịu dàng',
      description: 'Câu chuyện thật của chúng mình sẽ được viết ở đây — về ngày hai người xa lạ bắt đầu bước chung một nhịp.',
      image: { src: placeholder('story-01.webp'), srcSet: responsiveSet('story-01', [640, 960, 1280], 1536), sizes: storySizes, alt: 'Ảnh minh họa đôi tay cô dâu chú rể được nối bằng sợi chỉ đỏ bên hiên nhà', aspectRatio: '3 / 2', objectPosition: '50% 50%' },
      placeholder: true,
    },
    {
      chapter: 'Mốc 02', year: 'Đồng hành', title: 'Những ngày bình thường hóa thành kỷ niệm',
      description: 'Một khoản dành cho những điều đã khiến hành trình bên nhau trở nên đáng nhớ, chờ được thay bằng câu chuyện của riêng hai bạn.',
      image: { src: placeholder('story-02.webp'), srcSet: responsiveSet('story-02', [640, 960, 1280], 1536), sizes: storySizes, alt: 'Ảnh minh họa bàn trà lễ cưới Việt với hoa sen, trầu cau và khăn lụa đỏ', aspectRatio: '3 / 2', objectPosition: '50% 50%' },
      placeholder: true,
    },
    {
      chapter: 'Mốc 03', year: 'Hôm nay', title: 'Từ đây, mình có nhau',
      description: 'Từ đây, chúng mình chọn đi tiếp cùng nhau — bằng sự thấu hiểu, dịu dàng và một lời hứa dài lâu.',
      image: { src: placeholder('gallery-detail.webp'), srcSet: responsiveSet('gallery-detail', [480, 720], 1024), sizes: storySizes, alt: 'Ảnh minh họa áo dài cưới thêu sen, thiệp màu ngà, nhẫn vàng và hoa sen', aspectRatio: '2 / 3', objectPosition: '50% 50%' },
      placeholder: true,
    },
  ],
  gallery: [
    { id: 'portrait-one', src: placeholder('couple-bride.webp'), srcSet: responsiveSet('couple-bride', [480, 720], 1024), sizes: gallerySizes, alt: 'Ảnh minh họa cô dâu mặc áo dài đỏ, cầm bó hoa sen và mẫu đơn', aspectRatio: '2 / 3', objectPosition: '50% 40%', layout: 'portrait', caption: 'Nét duyên ngày vu quy' },
    { id: 'cinematic-wide', src: placeholder('hero.webp'), srcSet: responsiveSet('hero', [640, 960, 1280], 1536), sizes: gallerySizes, alt: 'Ảnh minh họa cặp đôi mặc áo dài cưới đỏ bên hiên nhà cổ Việt Nam', aspectRatio: '3 / 2', objectPosition: '50% 48%', layout: 'feature', caption: 'Ngày mình thành đôi' },
    { id: 'story-hands', src: placeholder('story-01.webp'), srcSet: responsiveSet('story-01', [640, 960, 1280], 1536), sizes: gallerySizes, alt: 'Ảnh minh họa đôi tay cô dâu chú rể được nối bằng sợi chỉ đỏ bên hiên nhà', aspectRatio: '3 / 2', objectPosition: '50% 50%', layout: 'detail', caption: 'Duyên se chỉ đỏ' },
    { id: 'portrait-two', src: placeholder('couple-groom.webp'), srcSet: responsiveSet('couple-groom', [480, 720], 1024), sizes: gallerySizes, alt: 'Ảnh minh họa chú rể mặc áo dài đỏ đô thêu họa tiết Đông Sơn', aspectRatio: '2 / 3', objectPosition: '50% 42%', layout: 'portrait', caption: 'Vững bước bên nhau' },
    { id: 'story-wide', src: placeholder('story-02.webp'), srcSet: responsiveSet('story-02', [640, 960, 1280], 1536), sizes: gallerySizes, alt: 'Ảnh minh họa bàn trà lễ cưới Việt với hoa sen, trầu cau và khăn lụa đỏ', aspectRatio: '3 / 2', objectPosition: '50% 50%', layout: 'landscape', caption: 'Hương trà ngày hỷ' },
    { id: 'detail-close', src: placeholder('gallery-detail.webp'), srcSet: responsiveSet('gallery-detail', [480, 720], 1024), sizes: gallerySizes, alt: 'Ảnh minh họa áo dài cưới thêu sen, thiệp màu ngà, nhẫn vàng và hoa sen', aspectRatio: '2 / 3', objectPosition: '50% 50%', layout: 'detail', caption: 'Những điều nâng niu' },
  ],
  music: { title: '', artist: '', src: '' },
  gift: {
    enabled: true,
    groom: { label: 'Nhà Trai', bankName: '', accountName: '', accountNumber: '', qrImage: '' },
    bride: { label: 'Nhà Gái', bankName: '', accountName: '', accountNumber: '', qrImage: '' },
  },
  seo: {
    title: 'Tuấn Hùng & Sao Mai | 19.10.2026',
    description: 'Trân trọng mời bạn đến chung vui trong ngày đặc biệt của Tuấn Hùng & Sao Mai.',
    image: '/assets/placeholders/hero.webp', robots: 'noindex, nofollow', siteUrl: '',
  },
  features: { music: true, rsvp: true, wish: true, gift: true, personalizedGuest: true, gallery: true },
  copy: {
    coverEyebrow: 'Trân trọng kính mời',
    coverHint: 'Chạm để mở lời mời',
    invitationTitle: 'Lễ thành hôn',
    invitationGeneric: 'Trân trọng kính mời',
    invitationPersonalized: 'Thân mời',
    invitationBody: 'đến chung vui và chứng kiến khoảnh khắc chúng mình bắt đầu một chương mới.',
    storyIntro: 'Không phải một câu chuyện cổ tích — chỉ là hai người, qua những ngày bình thường, đã chọn ở lại bên nhau.',
    storyQuote: 'Có những khoảnh khắc chỉ cần được nhìn thấy, không cần được giải thích.',
    ceremonyIntro: 'Mỗi nhà tổ chức một buổi lễ riêng. Bạn có thể đến chung vui một bên hoặc cả hai — Hùng & Mai đều rất mong được đón tiếp.',
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
} satisfies WeddingConfig

export function validateWeddingConfig(config: WeddingConfig): string[] {
  const errors: string[] = []
  if (!config.couple.groom.fullName.trim()) errors.push('Missing groom name')
  if (!config.couple.bride.fullName.trim()) errors.push('Missing bride name')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(config.date.iso)) errors.push('Invalid ISO wedding date')
  if (!config.date.lunar.trim()) errors.push('Missing lunar date')
  if (!config.date.timezone.trim()) errors.push('Missing timezone')
  if (Boolean(config.date.eventStartIso) !== Boolean(config.date.eventEndIso)) errors.push('Wedding event requires both start and end times')
  if (config.date.eventStartIso && config.date.eventEndIso) {
    const start = new Date(config.date.eventStartIso)
    const end = new Date(config.date.eventEndIso)
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) errors.push('Invalid wedding event time range')
  }
  for (const side of [config.events.brideSide, config.events.groomSide] as const) {
    if (side.enabled && side.date && !/^\d{4}-\d{2}-\d{2}$/.test(side.date)) errors.push(`Invalid ISO date for ${side.label}`)
    if (side.enabled && side.calendar.eventStartIso && !side.calendar.eventEndIso) errors.push(`${side.label} event requires both start and end times`)
    if (side.enabled && side.calendar.eventStartIso && side.calendar.eventEndIso) {
      const start = new Date(side.calendar.eventStartIso)
      const end = new Date(side.calendar.eventEndIso)
      if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) errors.push(`Invalid ${side.label} event time range`)
    }
    if (side.enabled && side.mapNavigationUrl) {
      try {
        const url = new URL(side.mapNavigationUrl)
        if (url.protocol !== 'https:') errors.push(`${side.label} map URL must use HTTPS`)
      } catch { errors.push(`Invalid ${side.label} map URL`) }
    }
    if (side.enabled && side.mapEmbedUrl) {
      try {
        const url = new URL(side.mapEmbedUrl)
        if (url.protocol !== 'https:') errors.push(`${side.label} map embed must use HTTPS`)
      } catch { errors.push(`Invalid ${side.label} map embed URL`) }
    }
  }
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
