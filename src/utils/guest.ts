import type { WeddingSide } from '../config/wedding';
export function guestFromSearch(search = window.location.search) {
  const params = new URLSearchParams(search);
  const raw = (params.get('guest') || '').replace(/[<>]/g, '').trim().replace(/\s+/g, ' ');
  const side = params.get('side');
  return { guest: raw.slice(0, 72), side: side === 'groom' || side === 'bride' || side === 'both' ? side as WeddingSide : 'both' as WeddingSide };
}
