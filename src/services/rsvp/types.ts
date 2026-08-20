import type { Attendance } from '../../utils/rsvpValidation'

export interface RSVPSubmission {
  name: string
  attendance: Attendance
  partySize?: number
  message?: string
  submittedAt: string
}

export interface RSVPResult {
  ok: boolean
  id: string
}

export interface RSVPService {
  readonly mode: 'local-demo' | 'remote'
  submit(data: RSVPSubmission): Promise<RSVPResult>
}
