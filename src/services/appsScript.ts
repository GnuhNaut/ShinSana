import type { GuestSide } from '../types/wedding'
import { safeExternalUrl } from '../utils/contentSafety'

export type SubmissionStatus = 'success' | 'unavailable' | 'error'

export interface SubmissionResult {
  status: SubmissionStatus
}

export interface RSVPSubmission {
  guestName: string
  side: GuestSide
  attendance: 'yes' | 'no'
  partySize: number
  message: string
  timestamp: string
}

export interface WishSubmission {
  name: string
  side: GuestSide
  message: string
  timestamp: string
}

function endpoint(): string | null {
  return safeExternalUrl(import.meta.env.VITE_APPS_SCRIPT_URL)
}

export function isAppsScriptAvailable(): boolean {
  return endpoint() !== null
}

async function submit(payload: Record<string, unknown>): Promise<SubmissionResult> {
  const url = endpoint()
  if (!url) return { status: 'unavailable' }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return response.ok ? { status: 'success' } : { status: 'error' }
  } catch {
    return { status: 'error' }
  }
}

export function submitRSVP(input: RSVPSubmission): Promise<SubmissionResult> {
  return submit({ type: 'rsvp', ...input })
}

export function submitWish(input: WishSubmission): Promise<SubmissionResult> {
  return submit({ type: 'wish', ...input })
}
