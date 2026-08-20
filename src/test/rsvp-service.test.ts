import { describe, expect, it, vi } from 'vitest'
import { RSVP_STORAGE_KEY, rsvpService } from '../services/rsvp/localRSVPService'
import type { RSVPSubmission } from '../services/rsvp'
import { readStorage } from '../utils/storage'

describe('local RSVP adapter', () => {
  it('identifies itself as local-demo and stores a normalized attending response', async () => {
    vi.useFakeTimers()
    const pending = rsvpService.submit({
      name: '  Nguyễn Văn An  ',
      attendance: 'yes',
      partySize: 2,
      message: '  Hẹn gặp hai bạn!  ',
      submittedAt: '2026-08-20T08:00:00.000Z',
    })

    await vi.advanceTimersByTimeAsync(350)
    await expect(pending).resolves.toEqual(expect.objectContaining({ ok: true }))
    expect(rsvpService.mode).toBe('local-demo')
    expect(readStorage<RSVPSubmission[]>(RSVP_STORAGE_KEY, [])).toEqual([{
      name: 'Nguyễn Văn An',
      attendance: 'yes',
      partySize: 2,
      message: 'Hẹn gặp hai bạn!',
      submittedAt: '2026-08-20T08:00:00.000Z',
    }])
  })

  it('does not persist party size or a blank optional message for a declined response', async () => {
    vi.useFakeTimers()
    const pending = rsvpService.submit({
      name: 'Khách mời',
      attendance: 'no',
      partySize: 4,
      message: '   ',
      submittedAt: '2026-08-20T08:00:00.000Z',
    })

    await vi.advanceTimersByTimeAsync(350)
    await pending
    expect(readStorage<RSVPSubmission[]>(RSVP_STORAGE_KEY, [])[0]).toEqual({
      name: 'Khách mời',
      attendance: 'no',
      submittedAt: '2026-08-20T08:00:00.000Z',
    })
  })
})
