import { readStorage, writeStorage } from '../../utils/storage'
import type { RSVPResult, RSVPService, RSVPSubmission } from './types'
export const RSVP_STORAGE_KEY = 'wedding_v1_rsvp'

class LocalRSVPService implements RSVPService {
  readonly mode = 'local-demo' as const

  async submit(data: RSVPSubmission): Promise<RSVPResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    const submissions = readStorage<RSVPSubmission[]>(RSVP_STORAGE_KEY, [])
    const message = data.message?.trim()
    const normalized: RSVPSubmission = {
      name: data.name.trim(),
      attendance: data.attendance,
      submittedAt: data.submittedAt,
      ...(data.attendance === 'yes' && data.partySize !== undefined ? { partySize: data.partySize } : {}),
      ...(message ? { message } : {}),
    }
    const saved = writeStorage(RSVP_STORAGE_KEY, [...submissions, normalized])
    return { ok: saved, id: `local-${Date.now()}` }
  }
}
export const rsvpService: RSVPService = new LocalRSVPService()
