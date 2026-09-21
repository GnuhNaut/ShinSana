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

export const heroImage = '/images/hero-ceremony.webp';
export const introImage = '/images/bride-detail.webp';
export const cinematicImage = '/images/bienhinh.webp';
export const finaleImage = '/images/finale-corridor.webp';
