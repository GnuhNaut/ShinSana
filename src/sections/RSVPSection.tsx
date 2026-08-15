import { useMemo, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { GoldReveal, OrientalReveal } from '../components/motion'
import { EasternCloud, Lotus, PeonyCorner } from '../components/ornaments'
import { weddingConfig as config } from '../config/wedding'
import { rsvpService } from '../services/rsvp'
import { validateRSVP, type RSVPFormErrors, type RSVPFormValues } from '../utils/rsvpValidation'

interface RSVPSectionProps { guestName: string | null }

export function RSVPSection({ guestName }: RSVPSectionProps) {
  const initialValues = useMemo<RSVPFormValues>(() => ({ name: guestName ?? '', attendance: '', partySize: 1, message: '' }), [guestName])
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RSVPFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [submitError, setSubmitError] = useState('')

  if (!config.features.rsvp) return null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    const nextErrors = validateRSVP(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !values.attendance) {
      window.setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await rsvpService.submit({
        ...values,
        name: values.name.trim(),
        message: values.message.trim(),
        attendance: values.attendance,
        partySize: values.attendance === 'yes' ? values.partySize : 0,
        submittedAt: new Date().toISOString(),
      })
      if (result.ok) setSubmittedName(values.name.trim())
      else setSubmitError('Chưa thể lưu hồi âm. Vui lòng thử lại.')
    } catch {
      setSubmitError('Kết nối chưa sẵn sàng. Vui lòng thử lại sau ít phút.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rsvp section ceremonial-section ceremonial-section--paper" id="rsvp" aria-labelledby="rsvp-title">
      <PeonyCorner className="rsvp__peony rsvp__peony--top" tone="red" corner="top-left" />
      <PeonyCorner className="rsvp__peony rsvp__peony--bottom" tone="red" corner="bottom-right" />
      <EasternCloud className="rsvp__cloud rsvp__cloud--left" tone="gold" direction="left" />
      <EasternCloud className="rsvp__cloud rsvp__cloud--right" tone="gold" direction="right" />
      <div className="container rsvp__layout rsvp__ceremonial-frame">
        <OrientalReveal className="rsvp__intro" variant="left">
          <Lotus className="rsvp__lotus" tone="red" size={96} />
          <p className="eyebrow">Hồi âm trân trọng</p>
          <h2 id="rsvp-title">Xác nhận<br />tham dự</h2>
          <p>{config.copy.rsvpIntro}</p>
          <span className="rsvp__date"><small>Ngày chung đôi</small>{config.date.display.replaceAll('.', ' · ')}</span>
        </OrientalReveal>
        <OrientalReveal className="rsvp__sheet" variant="right" delay={120}>
          <span className="rsvp__sheet-line rsvp__sheet-line--outer" aria-hidden="true" />
          <span className="rsvp__sheet-line rsvp__sheet-line--inner" aria-hidden="true" />
          {submittedName ? (
            <div className="form-success" role="status">
              <GoldReveal block className="form-success__flourish"><Lotus tone="red" withWater={false} /></GoldReveal>
              <p className="eyebrow">Đã nhận hồi âm</p>
              <h3>Cảm ơn, {submittedName}.</h3>
              <p>Chúng mình đã lưu lời xác nhận của bạn trên thiết bị này.</p>
              <button type="button" className="text-button" onClick={() => { setValues(initialValues); setSubmittedName(''); setErrors({}) }}>Gửi một hồi âm khác</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {Object.keys(errors).length > 0 && <p className="form-error form-error--summary" role="alert">Vui lòng kiểm tra các trường được đánh dấu bên dưới.</p>}
              <div className="field">
                <label htmlFor="rsvp-name">Họ và tên <span aria-hidden="true">*</span></label>
                <input id="rsvp-name" name="name" value={values.name} maxLength={81} autoComplete="name" required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'rsvp-name-error' : undefined} onChange={(event) => setValues({ ...values, name: event.target.value })} />
                {errors.name && <span className="field__error" id="rsvp-name-error">{errors.name}</span>}
              </div>

              <fieldset className="field fieldset" aria-invalid={Boolean(errors.attendance)} aria-describedby={errors.attendance ? 'rsvp-attendance-error' : undefined} tabIndex={errors.attendance ? -1 : undefined}>
                <legend>Bạn sẽ tham dự chứ? <span aria-hidden="true">*</span></legend>
                <label className={`choice ${values.attendance === 'yes' ? 'choice--active' : ''}`}>
                  <input type="radio" name="attendance" value="yes" required checked={values.attendance === 'yes'} onChange={() => setValues({ ...values, attendance: 'yes' })} />
                  <span><strong>Có, tôi sẽ tham dự</strong><small>Hẹn gặp nhau trong ngày vui</small></span>
                </label>
                <label className={`choice ${values.attendance === 'no' ? 'choice--active' : ''}`}>
                  <input type="radio" name="attendance" value="no" required checked={values.attendance === 'no'} onChange={() => setValues({ ...values, attendance: 'no' })} />
                  <span><strong>Rất tiếc, tôi không thể tham dự</strong><small>Gửi yêu thương từ xa</small></span>
                </label>
                {errors.attendance && <span className="field__error" id="rsvp-attendance-error">{errors.attendance}</span>}
              </fieldset>

              {values.attendance === 'yes' && (
                <div className="field">
                  <label htmlFor="rsvp-party-size">Số người tham dự</label>
                  <select id="rsvp-party-size" value={values.partySize} aria-invalid={Boolean(errors.partySize)} onChange={(event) => setValues({ ...values, partySize: Number(event.target.value) })}>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((number) => <option key={number} value={number}>{number} người</option>)}
                  </select>
                  {errors.partySize && <span className="field__error">{errors.partySize}</span>}
                </div>
              )}

              <div className="field">
                <label htmlFor="rsvp-message">Lời nhắn <small>Không bắt buộc</small></label>
                <textarea id="rsvp-message" rows={4} value={values.message} maxLength={501} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'rsvp-message-error' : undefined} onChange={(event) => setValues({ ...values, message: event.target.value })} />
                <div className="field__meta">{errors.message ? <span className="field__error" id="rsvp-message-error">{errors.message}</span> : <span />}{values.message.length}/500</div>
              </div>

              <button className="button button--primary button--full" type="submit" disabled={submitting}>
                <Send aria-hidden="true" /> {submitting ? 'Đang gửi…' : 'Gửi xác nhận'}
              </button>
              {submitError && <p className="form-error" role="alert">{submitError}</p>}
              <p className="form-note">Bản thử nghiệm chỉ lưu hồi âm trên thiết bị này; gia đình chưa nhận được dữ liệu.</p>
            </form>
          )}
        </OrientalReveal>
      </div>
    </section>
  )
}
