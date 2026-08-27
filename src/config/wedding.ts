import type { WeddingConfig } from '../types/wedding.ts'
import { warnForInvalidWeddingConfig } from '../utils/weddingValidation.ts'

export { validateWeddingConfig } from '../utils/weddingValidation.ts'

const placeholder = (file: string) => `/assets/placeholders/${file}`
const responsiveSet = (stem: string, widths: number[], sourceWidth: number) => [
  ...widths.map((width) => `${placeholder(`${stem}-${width}.webp`)} ${width}w`),
  `${placeholder(`${stem}.webp`)} ${sourceWidth}w`,
].join(', ')

const heroSizes = '(max-width: 1536px) 100vw, 1536px'
const portraitSizes = '(max-width: 1023px) calc(100vw - 40px), 470px'
const gallerySizes = '(max-width: 1023px) calc(100vw - 40px), 720px'

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
    // NHẬP THÔNG TIN NHÀ TRAI TẠI ĐÂY
    groom: { label: 'Nhà Trai' },
    // NHẬP THÔNG TIN NHÀ GÁI TẠI ĐÂY
    bride: { label: 'Nhà Gái' },
  },
  // THÊM CÁC NGHI LỄ ĐÃ XÁC NHẬN TẠI ĐÂY
  events: [],
  hero: { src: placeholder('hero.webp'), srcSet: responsiveSet('hero', [640, 960, 1280], 1536), sizes: heroSizes, alt: 'Ảnh minh họa cặp đôi mặc áo dài cưới đỏ bên hiên nhà cổ Việt Nam', aspectRatio: '3 / 2', objectPosition: '50% 48%' },
  // Chỉ thêm sticker từ ảnh thật đã được cặp đôi đồng ý sử dụng.
  decorativeStickers: [],
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
  // BẬT MỪNG CƯỚI ONLINE SAU KHI ĐÃ CÓ THÔNG TIN NGÂN HÀNG
  gift: {
    enabled: false,
    accounts: [],
  },
  seo: {
    title: 'Tuấn Hùng & Sao Mai | 19.10.2026',
    description: 'Trân trọng mời bạn đến chung vui trong ngày đặc biệt của Tuấn Hùng & Sao Mai.',
    image: '/assets/social-preview.jpg', imageWidth: 1200, imageHeight: 630,
    robots: 'index, follow', siteUrl: '',
  },
  features: { music: true, rsvp: true, wish: true, personalizedGuest: true, gallery: true },
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
    giftLabel: 'Gửi mừng cưới',
    giftCta: 'Mừng cưới online',
    giftIntro: 'Sự hiện diện và những lời chúc của bạn đã là món quà quý giá đối với chúng mình.',
  },
  sampleWishes: [
    { id: 'sample-1', name: 'Một người bạn', message: 'Chúc hai bạn luôn tìm thấy bình yên và niềm vui trong từng ngày bên nhau.' },
    { id: 'sample-2', name: 'Khách mời', message: 'Mong hành trình mới của hai bạn sẽ đầy ắp tiếng cười và những điều dịu dàng.' },
  ],
}

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  warnForInvalidWeddingConfig(weddingConfig)
}
