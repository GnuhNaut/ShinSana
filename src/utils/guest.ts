import type { WeddingSide } from '../config/wedding';

const GUEST_STORAGE_KEY = 'shinsana_wedding_guest';
const SIDE_STORAGE_KEY = 'shinsana_wedding_side';

function getStored(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem(key);
    if (local) return local;
  } catch {
    // Ignore localStorage errors
  }
  try {
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + key + '=([^;]*)'));
    if (match) return decodeURIComponent(match[1]);
  } catch {
    // Ignore cookie errors
  }
  return null;
}

function setStored(key: string, value: string, days = 365) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore localStorage errors
  }
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie errors
  }
}

export function guestFromSearch(
  search = typeof window !== 'undefined' ? window.location.search : '',
  pathname = typeof window !== 'undefined' ? window.location.pathname : ''
): { guest: string; side: WeddingSide } {
  const params = new URLSearchParams(search);

  // 1. Kiểm tra tham số Tên Khách Mời từ URL
  const hasGuestInUrl = params.has('guest');
  const rawParamGuest = (params.get('guest') || '').replace(/[<>]/g, '').trim().replace(/\s+/g, ' ');

  // 2. Xác định Nhà Trai / Nhà Gái từ Pathname (/groom, /bride) hoặc Query Param (?side=groom)
  const path = pathname.toLowerCase();
  let explicitSide: WeddingSide | null = null;

  if (path.includes('groom')) {
    explicitSide = 'groom';
  } else if (path.includes('bride')) {
    explicitSide = 'bride';
  } else {
    const sideParam = params.get('side');
    if (sideParam === 'groom' || sideParam === 'bride' || sideParam === 'both') {
      explicitSide = sideParam as WeddingSide;
    }
  }

  // 3. Lấy dữ liệu đã lưu từ Cookie/LocalStorage nếu có
  const savedGuest = getStored(GUEST_STORAGE_KEY) || '';
  const savedSide = (getStored(SIDE_STORAGE_KEY) as WeddingSide) || 'both';

  // 4. Quyết định Tên khách mời:
  // - Nếu URL có ?guest=... -> Dùng tên mới trên URL và lưu lại
  // - Nếu URL không có -> Dùng tên đã lưu từ Cookie/LocalStorage trước đó
  const finalGuest = hasGuestInUrl ? rawParamGuest.slice(0, 72) : savedGuest;

  // 5. Quyết định Bên (Nhà Trai / Nhà Gái):
  // - Nếu URL có /groom hoặc /bride hoặc ?side=... -> Dùng bên mới trên URL và lưu lại
  // - Nếu truy cập trang chủ (root /) không có tham số -> Dùng bên đã lưu từ Cookie/LocalStorage
  const finalSide: WeddingSide = explicitSide || savedSide || 'both';

  // 6. Cập nhật vào Cookie/LocalStorage
  if (hasGuestInUrl) {
    if (finalGuest) {
      setStored(GUEST_STORAGE_KEY, finalGuest);
    }
  } else if (!savedGuest && finalGuest) {
    setStored(GUEST_STORAGE_KEY, finalGuest);
  }

  if (explicitSide) {
    setStored(SIDE_STORAGE_KEY, explicitSide);
  }

  return {
    guest: finalGuest,
    side: finalSide,
  };
}
