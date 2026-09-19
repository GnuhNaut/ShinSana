import type { WeddingSide } from '../config/wedding';
export type SubmissionResult = { ok: true } | { ok: false; reason: 'unavailable' | 'failed' };
const endpoint = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
async function submit(body: object): Promise<SubmissionResult> {
  if (!endpoint) return { ok: false, reason: 'unavailable' };
  try { const response = await fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }); return response ? { ok: true } : { ok: false, reason: 'failed' }; } catch { return { ok: false, reason: 'failed' }; }
}
export const submitRsvp = (payload: { guestName: string; side: WeddingSide; attendance: string; partySize: number; message: string }) => submit({ type: 'rsvp', ...payload, timestamp: new Date().toISOString() });
export const submitWish = (payload: { name: string; side: WeddingSide; message: string }) => submit({ type: 'wish', ...payload, timestamp: new Date().toISOString() });
