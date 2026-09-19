import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import { isAppsScriptAvailable, submitRSVP } from '../services/appsScript'
import type { GuestSide } from '../types/wedding'

interface RSVPSectionProps {
  guestName: string | null
  side: GuestSide
}

type Attendance = '' | 'yes' | 'no'
type FormStatus = 'idle' | 'success' | 'error'

export function RSVPSection({ guestName, side }: RSVPSectionProps) {
  const config = useWeddingConfig()
  const [name, setName] = useState(guestName ?? '')
  const [attendance, setAttendance] = useState<Attendance>('')
  const [partySize, setPartySize] = useState(1)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [validationMessage, setValidationMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const available = isAppsScriptAvailable()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!available || submitting) return
    if (!name.trim() || !attendance) {
      setValidationMessage('Vui lòng điền tên và chọn phản hồi tham dự.')
      return
    }

    setValidationMessage('')
    setSubmitting(true)
    const result = await submitRSVP({
      guestName: name.trim(),
      side,
      attendance,
      partySize: attendance === 'yes' ? partySize : 0,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    })
    setSubmitting(false)
    setStatus(result.status === 'success' ? 'success' : 'error')
  }

  return (
    <section className="response response--rsvp" id="rsvp" aria-labelledby="rsvp-title">
      <div className="shell response__layout">
        <header className="response__intro">
          <p className="section-kicker">{config.content.rsvpEyebrow}</p>
          <h2 id="rsvp-title">{config.content.rsvpTitle}</h2>
          <p>{config.content.rsvpBody}</p>
          <p className="response__stamp" aria-hidden="true">{config.couple.monogram}</p>
        </header>
        <form className="response__form" onSubmit={submit} noValidate>
          {!available && (
            <p className="form-status form-status--pending" role="status">
              Chức năng xác nhận trực tuyến sẽ sớm được mở.
            </p>
          )}
          {status === 'success' && <p className="form-status form-status--success" role="status">Cảm ơn bạn, hồi âm đã được gửi.</p>}
          {status === 'error' && <p className="form-status form-status--error" role="alert">Chưa thể gửi hồi âm. Vui lòng thử lại sau.</p>}
          {validationMessage && <p className="form-status form-status--error" role="alert">{validationMessage}</p>}
          <label className="field">
            <span>Họ và tên</span>
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} />
          </label>
          <fieldset className="field choice-field">
            <legend>Bạn có thể đến chung vui chứ?</legend>
            <label><input type="radio" name="attendance" checked={attendance === 'yes'} onChange={() => setAttendance('yes')} /><span>Có, mình sẽ đến</span></label>
            <label><input type="radio" name="attendance" checked={attendance === 'no'} onChange={() => setAttendance('no')} /><span>Rất tiếc, mình chưa thể đến</span></label>
          </fieldset>
          {attendance === 'yes' && (
            <label className="field">
              <span>Số người tham dự</span>
              <select value={partySize} onChange={(event) => setPartySize(Number(event.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((number) => <option value={number} key={number}>{number} người</option>)}
              </select>
            </label>
          )}
          <label className="field">
            <span>Nhắn gửi đôi lời <small>Không bắt buộc</small></span>
            <textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} />
          </label>
          <button className="button button--wine button--full" type="submit" disabled={!available || submitting}>
            <Send aria-hidden="true" /> {submitting ? 'Đang gửi' : available ? 'Gửi hồi âm' : 'Sắp mở'}
          </button>
        </form>
      </div>
    </section>
  )
}
