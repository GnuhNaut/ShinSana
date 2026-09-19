import type { GalleryChapterId, GalleryImage, ImageAsset, WeddingConfig } from '../types/wedding.ts'

const asset = (file: string) => '/assets/placeholders/' + file

const responsive = (stem: string, widths: number[], original: number) => [
  ...widths.map((width) => asset(stem + '-' + width + '.webp') + ' ' + width + 'w'),
  asset(stem + '.webp') + ' ' + original + 'w',
].join(', ')

const hero: ImageAsset = {
  id: 'hero',
  src: asset('hero.webp'),
  srcSet: responsive('hero', [640, 960, 1280], 1536),
  sizes: '100vw',
  alt: 'Tuấn Hùng và Sao Mai trong trang phục cưới đỏ',
  aspectRatio: '3 / 2',
  objectPosition: '50% 48%',
}

const galleryImage = (
  id: string,
  source: 'hero' | 'couple-bride' | 'couple-groom' | 'story-01' | 'story-02' | 'gallery-detail',
  caption: string,
  layout: GalleryImage['layout'],
  chapter: GalleryChapterId,
  objectPosition = '50% 50%',
  featured = false,
): GalleryImage => {
  const portrait = source === 'couple-bride' || source === 'couple-groom'
  const hasWideVariants = source === 'hero' || source === 'story-01' || source === 'story-02'
  const altBySource = {
    hero: 'Khoảnh khắc cưới của Tuấn Hùng và Sao Mai',
    'couple-bride': 'Chân dung cô dâu Sao Mai',
    'couple-groom': 'Chân dung chú rể Tuấn Hùng',
    'story-01': 'Khoảnh khắc dịu dàng trong bộ ảnh cưới',
    'story-02': 'Không gian lễ cưới với sắc đỏ trầm',
    'gallery-detail': 'Chi tiết bộ ảnh cưới',
  }

  return {
    id,
    src: asset(source + '.webp'),
    ...(portrait
      ? { srcSet: responsive(source, [480, 720], 1024), sizes: '(max-width: 700px) 78vw, 32vw' }
      : hasWideVariants
        ? { srcSet: responsive(source, [640, 960, 1280], 1536), sizes: featured ? '100vw' : '(max-width: 700px) 90vw, 48vw' }
        : { srcSet: responsive(source, [480, 720], 1024), sizes: '(max-width: 700px) 78vw, 32vw' }),
    alt: altBySource[source],
    aspectRatio: portrait ? '2 / 3' : layout === 'square' ? '1 / 1' : layout === 'detail' ? '4 / 5' : '3 / 2',
    objectPosition,
    caption,
    layout,
    chapter,
    featured,
  }
}

/**
 * The single editing surface for wedding data. Replace placeholder venue, bank,
 * QR, music and gallery values here; presentational components carry no wedding data.
 */
export const weddingConfig: WeddingConfig = {
  couple: {
    groom: 'Tuấn Hùng',
    bride: 'Sao Mai',
    monogram: '囍',
  },
  date: {
    iso: '2026-10-19',
    display: '19 · 10 · 2026',
    displayLong: '19 tháng 10 năm 2026',
    lunar: '10 / 09 âm lịch',
  },
  hero,
  locations: {
    groom: {
      side: 'groom',
      title: 'Nhà Trai',
      date: '19.10.2026',
      lunarDate: '10 / 09 âm lịch',
      receptionTime: 'Sẽ cập nhật',
      ceremonyTime: 'Sẽ cập nhật',
      address: 'Địa chỉ sẽ được cập nhật',
      mapUrl: '',
      note: 'Thông tin buổi lễ sẽ được gia đình cập nhật sớm nhất.',
    },
    bride: {
      side: 'bride',
      title: 'Nhà Gái',
      date: '19.10.2026',
      lunarDate: '10 / 09 âm lịch',
      receptionTime: 'Sẽ cập nhật',
      ceremonyTime: 'Sẽ cập nhật',
      address: 'Địa chỉ sẽ được cập nhật',
      mapUrl: '',
      note: 'Thông tin buổi lễ sẽ được gia đình cập nhật sớm nhất.',
    },
  },
  gifts: {
    groom: { side: 'groom', bankName: '', accountHolder: '', accountNumber: '' },
    bride: { side: 'bride', bankName: '', accountHolder: '', accountNumber: '' },
  },
  // Add a licensed local track later. Empty source keeps the player honest and non-blocking.
  music: { src: '', title: 'Nhạc nền', artist: '' },
  galleryChapters: [
    { id: 'opening', eyebrow: 'Khởi đầu', title: 'Ngày mình thành đôi', lead: 'Một vài khung hình mở đầu cho ngày vui.' },
    { id: 'portraits', eyebrow: 'Chương chân dung', title: 'Dung nhan ngày hỷ', lead: 'Nhìn về phía nhau, thật gần và thật dịu dàng.' },
    { id: 'ritual', eyebrow: 'Duyên lành', title: 'Những điều thân thương', lead: 'Từ nét chạm nhỏ đến khoảnh khắc vẹn tròn.' },
    { id: 'closing', eyebrow: 'Về chung một lối', title: 'Hẹn gặp tại ngày vui', lead: 'Khép lại bộ ảnh bằng một lời hẹn ấm áp.' },
  ],
  gallery: [
    galleryImage('01-opening', 'hero', 'Ngày mình thành đôi', 'wide', 'opening', '50% 47%'),
    galleryImage('02-mai-portrait', 'couple-bride', 'Nét duyên ngày hỷ', 'portrait', 'opening', '50% 40%'),
    galleryImage('03-hung-portrait', 'couple-groom', 'Một ánh nhìn', 'portrait', 'opening', '50% 42%'),
    galleryImage('04-red-thread', 'story-01', 'Duyên se chỉ đỏ', 'detail', 'opening'),
    galleryImage('05-tea-ceremony', 'story-02', 'Hương trà ngày vui', 'wide', 'opening', '50% 50%', true),
    galleryImage('06-detail', 'gallery-detail', 'Chạm vào kỷ niệm', 'square', 'opening', '50% 48%'),
    galleryImage('07-mai-editorial', 'couple-bride', 'Sắc đỏ của Mai', 'portrait', 'portraits', '53% 38%'),
    galleryImage('08-hung-editorial', 'couple-groom', 'Đi về cùng nhau', 'portrait', 'portraits', '47% 43%'),
    galleryImage('09-cinematic', 'hero', 'Một chương mới', 'wide', 'portraits', '45% 50%'),
    galleryImage('10-hands', 'story-01', 'Gần nhau hơn một chút', 'detail', 'portraits', '47% 50%'),
    galleryImage('11-lacquer', 'gallery-detail', 'Màu của hỷ sự', 'square', 'portraits', '45% 50%'),
    galleryImage('12-table', 'story-02', 'Vẹn tròn', 'wide', 'portraits', '55% 49%'),
    galleryImage('13-mai-close', 'couple-bride', 'Nụ cười của cô dâu', 'portrait', 'ritual', '47% 35%'),
    galleryImage('14-hung-close', 'couple-groom', 'Nụ cười của chú rể', 'portrait', 'ritual', '54% 40%'),
    galleryImage('15-walk', 'hero', 'Chúng mình', 'wide', 'ritual', '55% 46%'),
    galleryImage('16-ribbon', 'story-01', 'Lời hẹn ước', 'detail', 'ritual', '55% 50%'),
    galleryImage('17-flower', 'gallery-detail', 'Một đóa hoa cho ngày vui', 'square', 'ritual', '56% 48%'),
    galleryImage('18-ritual', 'story-02', 'Những điều thân thương', 'wide', 'ritual', '46% 52%'),
    galleryImage('19-mai-light', 'couple-bride', 'Dịu dàng mà rực rỡ', 'portrait', 'closing', '55% 42%'),
    galleryImage('20-hung-light', 'couple-groom', 'Bình yên', 'portrait', 'closing', '45% 45%'),
    galleryImage('21-together', 'hero', 'Ngày có đôi', 'wide', 'closing', '50% 52%', true),
    galleryImage('22-letter', 'story-01', 'Gửi vào gió một lời thương', 'detail', 'closing', '52% 52%'),
    galleryImage('23-details', 'gallery-detail', 'Vết son ngày cưới', 'square', 'closing', '50% 54%'),
    galleryImage('24-closing', 'story-02', 'Hẹn gặp bạn tại ngày vui', 'wide', 'closing', '50% 50%'),
  ],
  content: {
    coverEyebrow: 'Trân trọng kính mời',
    coverPrompt: 'Mở thiệp',
    invitationEyebrow: 'Ngày chung đôi',
    invitationTitle: 'Ngày chúng mình chung đôi',
    invitationBody: 'Một lời mời nhỏ, dành cho người chúng mình yêu quý. Mong được đón bạn trong khoảnh khắc bắt đầu hành trình mới.',
    dateEyebrow: 'Tháng mười',
    dateTitle: 'Một ngày thật đỏ',
    dateBody: '19 tháng 10 năm 2026 · 10 tháng 09 âm lịch',
    storyEyebrow: 'Chương ảnh',
    storyTitle: 'Album của chúng mình',
    storyLead: 'Không cần một câu chuyện quá dài. Chỉ cần những khoảnh khắc thật, đủ để nhớ về một ngày rất đẹp.',
    storyQuote: '“Chúng mình đã chọn cùng đi về phía những ngày bình thường.”',
    locationsEyebrow: 'Lễ thành hôn',
    locationsTitle: 'Hẹn bạn tại ngày vui',
    locationsBody: 'Mỗi lời chúc và sự hiện diện của bạn đều làm ngày vui của chúng mình trọn vẹn hơn.',
    rsvpEyebrow: 'Hồi âm',
    rsvpTitle: 'Xác nhận tham dự',
    rsvpBody: 'Xin để lại hồi âm để chúng mình chuẩn bị đón tiếp bạn chu đáo.',
    wishEyebrow: 'Lời chúc',
    wishTitle: 'Gửi đôi lời thương',
    wishBody: 'Một câu chúc nhỏ của bạn sẽ là món quà chúng mình luôn trân quý.',
    giftEyebrow: 'Phong bao hỷ',
    giftTitle: 'Gửi mừng cưới',
    giftBody: 'Thông tin mừng cưới của hai gia đình.',
    closingEyebrow: 'Thương gửi',
    closingTitle: 'Cảm ơn bạn đã đến chung vui.',
    closingBody: 'Tuấn Hùng & Sao Mai',
  },
  sampleWishes: [
    { id: 'wish-01', name: 'Một người bạn', message: 'Chúc hai bạn luôn giữ được niềm vui dịu dàng này trong mọi ngày về sau.' },
    { id: 'wish-02', name: 'Khách mời thân thương', message: 'Chúc hành trình mới đầy ắp yêu thương, bình an và tiếng cười.' },
  ],
  seo: {
    title: 'Tuấn Hùng & Sao Mai | 19.10.2026',
    description: 'Trân trọng kính mời bạn đến chung vui cùng Tuấn Hùng và Sao Mai vào ngày 19 tháng 10 năm 2026.',
    image: hero.src,
    imageWidth: 1536,
    imageHeight: 1024,
    robots: 'index, follow',
    siteUrl: '',
  },
}
