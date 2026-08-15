import { readStorage, writeStorage } from '../../utils/storage'
import type { RSVPResult, RSVPService, RSVPSubmission } from './types'
export const RSVP_STORAGE_KEY = 'wedding_v1_rsvp'

class LocalRSVPService implements RSVPService {
  async submit(data: RSVPSubmission): Promise<RSVPResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    const submissions = readStorage<RSVPSubmission[]>(RSVP_STORAGE_KEY, [])
    const saved = writeStorage(RSVP_STORAGE_KEY, [...submissions, { ...data, name: data.name.trim(), message: data.message.trim() }])
    return { ok: saved, id: `local-${Date.now()}` }
  }
}
export const rsvpService: RSVPService = new LocalRSVPService()
