export type WeddingSide = 'groom' | 'bride' | 'both';
export type VenueKey = Exclude<WeddingSide, 'both'>;

export type Venue = {
  label: string;
  name: string;
  date: string;
  time: string;
  address: string;
  mapUrl: string;
  mapEmbedUrl: string;
};

export const wedding = {
  couple: { groom: 'Tuấn Hùng', bride: 'Sao Mai' },
  date: '19 · 10 · 2026',
  lunarDate: '10 / 09 âm lịch',
  seo: {
    title: 'Tuấn Hùng & Sao Mai — 19.10.2026',
    description: 'Trân trọng kính mời bạn đến chung vui cùng Tuấn Hùng và Sao Mai.',
  },
  locations: {
    groom: {
      label: 'NHÀ TRAI',
      name: 'Lễ Thành Hôn',
      date: 'Thứ Hai · 19.10.2026',
      time: '10:00',
      address: 'Địa chỉ sẽ được cập nhật',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Vi%E1%BB%87t%20Nam',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Vi%E1%BB%87t%20Nam&z=5&output=embed',
    },
    bride: {
      label: 'NHÀ GÁI',
      name: 'Lễ Vu Quy',
      date: 'Thứ Hai · 19.10.2026',
      time: '11:00',
      address: 'Địa chỉ sẽ được cập nhật',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Vi%E1%BB%87t%20Nam',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Vi%E1%BB%87t%20Nam&z=5&output=embed',
    },
  } satisfies Record<VenueKey, Venue>,
  gifts: {
    groom: {
      label: 'NHÀ TRAI',
      bankName: 'Ngân hàng sẽ cập nhật',
      accountHolder: 'TUẤN HÙNG',
      accountNumber: 'Đang cập nhật',
      qrImage: '',
    },
    bride: {
      label: 'NHÀ GÁI',
      bankName: 'Ngân hàng sẽ cập nhật',
      accountHolder: 'SAO MAI',
      accountNumber: 'Đang cập nhật',
      qrImage: '',
    },
  },
  music: { src: '/audio/audio.mp3', label: 'Khúc nhạc ngày vui' },
  copy: {
    intro: 'Trân trọng kính mời',
    cinematic: 'Hai người · một lời hẹn · một đời bên nhau.',
    finale: 'Hẹn gặp bạn trong ngày vui của chúng mình.',
  },
} as const;

const remotePhotoIds = [
  '1519741497674-611481863552',
  '1511285560929-80b456fea0bc',
  '1523438885200-e635ba2c371e',
  '1544078751-58fee2d8a03b',
  '1519225421980-715cb0215aed',
  '1507504031003-b417219a0fde',
  '1520854221256-17451cc331bf',
  '1519167758481-83f550bb49b3',
  '1522673607200-164d1b6ce486',
  '1530023367847-a683933f4172',
  '1487412720507-e7ab37603c6f',
  '1469371670807-013ccf25f16a',
  '1492684223066-81342ee5ff30',
  '1523438885200-e635ba2c371e',
  '1519741497674-611481863552',
  '1544078751-58fee2d8a03b',
  '1520854221256-17451cc331bf',
  '1519167758481-83f550bb49b3',
  '1522673607200-164d1b6ce486',
  '1530023367847-a683933f4172',
  '1511285560929-80b456fea0bc',
];

export const image = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=84`;

const localGallery = [
  { id: 'red-ceremony', src: '/images/hero-ceremony.webp', alt: 'Cặp đôi trong không gian lễ cưới sơn mài đỏ' },
  { id: 'bride-detail', src: '/images/bride-detail.webp', alt: 'Chi tiết áo dài cưới và hoa đỏ' },
  { id: 'red-corridor', src: '/images/finale-corridor.webp', alt: 'Cặp đôi bước qua hành lang lễ cưới đỏ' },
];

export const gallery = [
  ...localGallery,
  ...remotePhotoIds.map((id, index) => ({
    id: `${id}-${index}`,
    src: image(id),
    alt: `Khoảnh khắc cưới ${index + 4}`,
  })),
];

export const heroImage = '/images/hero-ceremony.webp';
export const introImage = '/images/bride-detail.webp';
export const cinematicImage = image('1544078751-58fee2d8a03b', 1800);
export const finaleImage = '/images/finale-corridor.webp';
