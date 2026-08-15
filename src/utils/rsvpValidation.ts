export type Attendance = 'yes' | 'no' | ''
export interface RSVPFormValues { name: string; attendance: Attendance; partySize: number; message: string }
export type RSVPFormErrors = Partial<Record<keyof RSVPFormValues, string>>

export function validateRSVP(values: RSVPFormValues): RSVPFormErrors {
  const errors: RSVPFormErrors = {}
  const name = values.name.trim()
  const message = values.message.trim()
  if (!name) errors.name = 'Vui lòng cho chúng mình biết tên của bạn.'
  else if (name.length > 80) errors.name = 'Tên không được dài quá 80 ký tự.'
  if (!values.attendance) errors.attendance = 'Vui lòng chọn khả năng tham dự.'
  if (values.attendance === 'yes' && (!Number.isInteger(values.partySize) || values.partySize < 1 || values.partySize > 10)) errors.partySize = 'Số người tham dự cần từ 1 đến 10.'
  if (message.length > 500) errors.message = 'Lời nhắn không được dài quá 500 ký tự.'
  return errors
}
