import type { WeddingSide } from '../config/wedding';

export type SavedRsvp = {
  id: string;
  guestName: string;
  side: WeddingSide;
  attendance: string;
  partySize: number;
  message: string;
  submittedAt: string;
};

export type SavedWish = {
  id: string;
  name: string;
  side: WeddingSide;
  message: string;
  submittedAt: string;
};


const RSVP_KEY = 'shinsana_wedding_rsvp';
const WISH_KEY = 'shinsana_wedding_wish';

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie write errors
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function saveRsvp(data: SavedRsvp) {
  const json = JSON.stringify(data);
  try {
    localStorage.setItem(RSVP_KEY, json);
  } catch {
    // localStorage may fail in private mode
  }
  setCookie(RSVP_KEY, json);
}

export function getSavedRsvp(): SavedRsvp | null {
  try {
    const local = localStorage.getItem(RSVP_KEY);
    if (local) return JSON.parse(local);
  } catch {
    // Ignore parse error
  }
  try {
    const cookie = getCookie(RSVP_KEY);
    if (cookie) return JSON.parse(cookie);
  } catch {
    // Ignore parse error
  }
  return null;
}

export function saveWish(data: SavedWish) {
  const json = JSON.stringify(data);
  try {
    localStorage.setItem(WISH_KEY, json);
  } catch {
    // Ignore
  }
  setCookie(WISH_KEY, json);
}

export function getSavedWish(): SavedWish | null {
  try {
    const local = localStorage.getItem(WISH_KEY);
    if (local) return JSON.parse(local);
  } catch {
    // Ignore
  }
  try {
    const cookie = getCookie(WISH_KEY);
    if (cookie) return JSON.parse(cookie);
  } catch {
    // Ignore
  }
  return null;
}
