import { describe, expect, it } from 'vitest'
import { ATTENDANCE_OPTIONS, validateRSVP, type RSVPFormValues } from '../utils/rsvpValidation'

const validValues: RSVPFormValues = {
  name: 'Nguyễn Văn An',
  attendance: 'bride',
  partySize: 2,
  message: 'Hẹn gặp hai bạn!',
}

describe('RSVP validation', () => {
  it('accepts a valid attending response', () => {
    expect(validateRSVP(validValues)).toEqual({})
  })

  it('requires a trimmed name and attendance choice', () => {
    const errors = validateRSVP({ ...validValues, name: '  ', attendance: '' })

    expect(errors.name).toBeDefined()
    expect(errors.attendance).toBeDefined()
  })

  it.each([0, 1.5, 11])('rejects an attending party size of %s', (partySize) => {
    expect(validateRSVP({ ...validValues, partySize }).partySize).toBeDefined()
  })

  it('does not require a party size when the guest cannot attend', () => {
    expect(validateRSVP({ ...validValues, attendance: 'none', partySize: 0 })).toEqual({})
  })

  it('enforces the name and optional-message limits', () => {
    const errors = validateRSVP({ ...validValues, name: 'A'.repeat(81), message: 'B'.repeat(501) })

    expect(errors.name).toBeDefined()
    expect(errors.message).toBeDefined()
  })

  it('exposes the four ceremonial attendance options', () => {
    expect(ATTENDANCE_OPTIONS.map(({ value }) => value)).toEqual(['bride', 'groom', 'both', 'none'])
  })
})
