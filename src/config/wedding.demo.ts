import type { WeddingConfig } from '../types/wedding.ts'
import { warnForInvalidWeddingConfig } from '../utils/weddingValidation.ts'
import { weddingConfig } from './wedding.ts'

const demoBase = structuredClone(weddingConfig)

/** Loaded dynamically only when the URL contains the exact query value `demo=1`. */
export const weddingDemoConfig: WeddingConfig = {
  ...demoBase,

  // DEMO ONLY — thay bằng thông tin gia đình thật trước khi production.
  families: {
    groom: {
      label: 'Nhà Trai',
      father: 'Nguyễn Văn Minh',
      mother: 'Trần Thu Hà',
      location: 'Hà Nội',
    },
    bride: {
      label: 'Nhà Gái',
      father: 'Lê Văn Thành',
      mother: 'Phạm Ngọc Mai',
      location: 'Hà Nội',
    },
  },

  // DEMO ONLY — toàn bộ giờ, địa điểm, địa chỉ và liên hệ dưới đây là dữ liệu mẫu.
  events: [
    {
      id: 'demo-vu-quy',
      side: 'bride',
      type: 'vu-quy',
      eyebrow: 'NHÀ GÁI',
      title: 'Lễ Vu Quy',
      date: '2026-10-18',
      lunarDate: '09/09 âm lịch',
      guestArrivalTime: '16:30',
      ceremonyTime: '17:00',
      receptionTime: '17:30',
      venueName: 'Tư gia Nhà Gái',
      address: '123 Đường Hoa Hồng, Quận Cầu Giấy, Hà Nội',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=123+Duong+Hoa+Hong+Cau+Giay+Ha+Noi',
      mapEmbedUrl: 'https://www.google.com/maps?q=123+Duong+Hoa+Hong+Cau+Giay+Ha+Noi&output=embed',
      parkingNote: 'Có khu vực gửi xe máy và ô tô gần địa điểm tổ chức.',
      contactName: 'Gia đình Nhà Gái',
      contactPhone: '0900000001',
      calendar: {
        eventStartIso: '2026-10-18T17:00:00+07:00',
        eventEndIso: '2026-10-18T20:30:00+07:00',
      },
    },
    {
      id: 'demo-thanh-hon',
      side: 'groom',
      type: 'thanh-hon',
      eyebrow: 'NHÀ TRAI',
      title: 'Lễ Thành Hôn',
      date: '2026-10-19',
      lunarDate: '10/09 âm lịch',
      guestArrivalTime: '09:30',
      ceremonyTime: '10:00',
      receptionTime: '11:00',
      venueName: 'Tư gia Nhà Trai',
      address: '88 Đường Hạnh Phúc, Quận Nam Từ Liêm, Hà Nội',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=88+Duong+Hanh+Phuc+Nam+Tu+Liem+Ha+Noi',
      mapEmbedUrl: 'https://www.google.com/maps?q=88+Duong+Hanh+Phuc+Nam+Tu+Liem+Ha+Noi&output=embed',
      parkingNote: 'Khu vực gửi xe nằm cách địa điểm khoảng 50m.',
      contactName: 'Gia đình Nhà Trai',
      contactPhone: '0900000002',
      calendar: {
        eventStartIso: '2026-10-19T10:00:00+07:00',
        eventEndIso: '2026-10-19T13:30:00+07:00',
      },
    },
    {
      id: 'demo-wedding-party',
      side: 'both',
      type: 'wedding-party',
      eyebrow: 'TIỆC CƯỚI',
      title: 'Tiệc Chung Vui',
      date: '2026-10-19',
      lunarDate: '10/09 âm lịch',
      guestArrivalTime: '17:30',
      receptionTime: '18:30',
      venueName: 'Trung tâm Tiệc cưới The Rose',
      address: '456 Đại lộ Tình Yêu, Hà Nội',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=456+Dai+Lo+Tinh+Yeu+Ha+Noi',
      mapEmbedUrl: 'https://www.google.com/maps?q=456+Dai+Lo+Tinh+Yeu+Ha+Noi&output=embed',
      parkingNote: 'Có bãi đỗ ô tô và xe máy dành cho khách tham dự.',
      contactName: 'Tuấn Hùng & Sao Mai',
      contactPhone: '0900000003',
      calendar: {
        eventStartIso: '2026-10-19T18:30:00+07:00',
        eventEndIso: '2026-10-19T21:30:00+07:00',
      },
    },
  ],

  // DEMO ONLY — sticker placeholder, thay bằng ảnh cutout thật nếu muốn dùng ở production.
  decorativeStickers: [
    {
      id: 'demo-couple-cutout-hero',
      src: '/images/demo/demo-couple-sticker.webp',
      alt: 'Minh họa cặp đôi mặc áo dài cưới',
      placement: 'hero',
    },
    {
      id: 'demo-couple-cutout-gift',
      src: '/images/demo/demo-couple-sticker.webp',
      alt: 'Minh họa cặp đôi mặc áo dài cưới',
      placement: 'gift',
    },
  ],

  // DEMO ONLY — ba đoạn ngắn này không phải câu chuyện thật của cặp đôi.
  story: [
    {
      chapter: '01',
      year: 'Demo',
      title: 'Lần đầu gặp nhau',
      description: 'Một cuộc gặp rất bình thường lại mở đầu cho hành trình đặc biệt nhất của hai chúng mình.',
      image: { ...demoBase.gallery[0] },
      placeholder: true,
    },
    {
      chapter: '02',
      year: 'Demo',
      title: 'Đồng hành',
      description: 'Qua những ngày vui, những lần giận hờn và rất nhiều kỷ niệm, chúng mình đã chọn ở lại bên nhau.',
      image: { ...demoBase.gallery[1] },
      placeholder: true,
    },
    {
      chapter: '03',
      year: 'Demo',
      title: 'Về chung một nhà',
      description: 'Ngày 19 tháng 10 năm 2026, chúng mình chính thức bắt đầu một chương mới mang tên gia đình.',
      image: { ...demoBase.gallery[2] },
      placeholder: true,
    },
  ],

  // DEMO ONLY — KHÔNG PHẢI TÀI KHOẢN THẬT.
  gift: {
    enabled: true,
    accounts: [
      {
        id: 'demo-groom-bank',
        side: 'groom',
        label: 'Nhà Trai',
        bankName: 'Ngân hàng Demo',
        accountNumber: '0123456789',
        accountHolder: 'TUAN HUNG',
        qrImage: '/images/demo/demo-qr-groom.png',
      },
      {
        id: 'demo-bride-bank',
        side: 'bride',
        label: 'Nhà Gái',
        bankName: 'Ngân hàng Demo',
        accountNumber: '9876543210',
        accountHolder: 'SAO MAI',
        qrImage: '/images/demo/demo-qr-bride.png',
      },
    ],
  },
  seo: {
    ...demoBase.seo,
    robots: 'noindex, nofollow',
  },
  copy: {
    ...demoBase.copy,
    ceremonyIntro: 'Dữ liệu dưới đây chỉ dùng để kiểm tra cách thiệp hiển thị khi đã điền đầy đủ.',
    detailsNote: 'Mọi địa chỉ, thời gian, liên hệ và tài khoản trong chế độ demo đều là dữ liệu mẫu.',
    giftLabel: 'Mừng cưới online',
    giftCta: 'Gửi mừng cưới',
  },
}

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  warnForInvalidWeddingConfig(weddingDemoConfig)
}
