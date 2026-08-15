import type { Attendance } from '../../utils/rsvpValidation'
export interface RSVPSubmission {
  name: string
  attendance: Exclude<Attendance, ''>
  partySize: number
  message: string
  submittedAt: string
}
export interface RSVPResult { ok: boolean; id: string }
export interface RSVPService { submit(data: RSVPSubmission): Promise<RSVPResult> }
