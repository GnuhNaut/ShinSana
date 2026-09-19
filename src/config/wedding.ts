export type WeddingSide = 'groom' | 'bride' | 'both';

export const wedding = {
  couple: { groom: 'Tuấn Hùng', bride: 'Sao Mai' },
  date: '19 · 10 · 2026',
  lunarDate: '10 / 09 âm lịch',
  seo: { title: 'Tuấn Hùng & Sao Mai — 19.10.2026', description: 'Trân trọng kính mời bạn đến chung vui.' },
  locations: {
    groom: { label: 'NHÀ TRAI', time: '10:00 · Thứ Hai, 19.10.2026', address: 'Địa chỉ sẽ được cập nhật', map: '#' },
    bride: { label: 'NHÀ GÁI', time: '11:00 · Thứ Hai, 19.10.2026', address: 'Địa chỉ sẽ được cập nhật', map: '#' },
  },
  gifts: {
    groom: { label: 'NHÀ TRAI', bankName: 'Ngân hàng sẽ cập nhật', accountHolder: 'Tuấn Hùng', accountNumber: 'Đang cập nhật', qrImage: '/qr/groom-placeholder.svg' },
    bride: { label: 'NHÀ GÁI', bankName: 'Ngân hàng sẽ cập nhật', accountHolder: 'Sao Mai', accountNumber: 'Đang cập nhật', qrImage: '/qr/bride-placeholder.svg' },
  },
  music: { src: '', label: 'Nhạc nền' },
  copy: { intro: 'Trân trọng kính mời', cinematic: 'Một ngày nhiều niềm vui.', finale: 'Cảm ơn bạn đã đến chung vui.' },
} as const;

const photoIds = ['1519741497674-611481863552','1511285560929-80b456fea0bc','1523438885200-e635ba2c371e','1544078751-58fee2d8a03b','1519225421980-715cb0215aed','1507504031003-b417219a0fde','1520854221256-17451cc331bf','1507504031003-b417219a0fde','1519167758481-83f550bb49b3','1522673607200-164d1b6ce486','1530023367847-a683933f4172','1507504031003-b417219a0fde','1487412720507-e7ab37603c6f','1469371670807-013ccf25f16a','1511285560929-80b456fea0bc','1492684223066-81342ee5ff30','1519225421980-715cb0215aed','1523438885200-e635ba2c371e','1519741497674-611481863552','1544078751-58fee2d8a03b','1520854221256-17451cc331bf','1519167758481-83f550bb49b3','1522673607200-164d1b6ce486','1530023367847-a683933f4172'];
export const image = (id: string, width = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=84`;
export const gallery = photoIds.map((id, index) => ({ id: `${id}-${index}`, src: image(id), alt: `Khoảnh khắc cưới ${index + 1}`, orientation: index % 4 === 0 ? 'portrait' : index % 4 === 1 ? 'landscape' : 'square' }));
export const heroImage = image('1519741497674-611481863552', 1600);
export const introImage = image('1523438885200-e635ba2c371e', 1200);
export const cinematicImage = image('1544078751-58fee2d8a03b', 1600);
export const finaleImage = image('1511285560929-80b456fea0bc', 1600);
