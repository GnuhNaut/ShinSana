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
      name: 'Tiệc Cưới & Lễ Thành Hôn',
      date: 'Chủ Nhật - Thứ Hai · 18 - 19.10.2026',
      time: '',
      address: 'Nhà Văn Hoá Thôn Tân Hưng - xã Đa Phúc (Thôn Cốc Lương, xã Tân Hưng cũ)',
      mapUrl: 'https://maps.app.goo.gl/ragsqLQmLqAaR1zp8',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3717.1646106963476!2d105.893625!3d21.304510999999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31351b41ffbdf877%3A0xe8f33f3316a3db49!2zTmjDoCBWxINuIEjDs2EgVGjDtG4gQ-G7kWMgTMawxqFuZw!5e0!3m2!1sen!2s!4v1790076212885!5m2!1sen!2s',
    },
    bride: {
      label: 'NHÀ GÁI',
      name: 'Tiệc Báo Hỷ',
      date: 'Chủ Nhật · 18.10.2026',
      time: '10:30',
      address: 'Phòng tiệc tầng 1 Royal 4 - Trống Đồng Palace Hà Đông - TTTM Melinh Plaza, Hà Nội',
      mapUrl: 'https://maps.app.goo.gl/KieiNiQXmooPRMhc7',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.70652360095!2d105.771636!3d20.9642976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313452d76a3d8bbd%3A0xa699af82bbad2713!2zVHLhu5FuZyDEkOG7k25nIFBhbGFjZQ!5e0!3m2!1sen!2s!4v1790083004188!5m2!1sen!2s',
    },
  } satisfies Record<VenueKey, Venue>,
  gifts: {
    groom: {
      label: 'NHÀ TRAI',
      bankName: 'TP BANK',
      accountHolder: 'TRƯƠNG TUẤN HÙNG',
      accountNumber: 'SHINSANA',
      qrImage: '/images/qr-groom.png',
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
export const finaleImage = '/images/test.png';
