import { useCallback, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Gift, Send } from 'lucide-react'
import { GoldReveal, OrientalReveal } from '../components/motion'
import { FloralCorner, HairlineDivider, Lotus, RoseSeal } from '../components/ornaments'
import { Modal } from '../components/ui/Modal'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'
import { rsvpService } from '../services/rsvp'
import {
  ATTENDANCE_OPTIONS,
  attendanceIsAttending,
  validateRSVP,
  type Attendance,
  type RSVPFormErrors,
  type RSVPFormValues,
} from '../utils/rsvpValidation'
import { type GuestSide } from '../types/wedding'

interface RSVPSectionProps {
  guestName: string | null
  side: GuestSide
}

function defaultAttendance(side: GuestSide): Attendance | '' {
  if (side === 'groom') return 'groom'
  if (side === 'bride') return 'bride'
  return ''
}

export function RSVPSection({ guestName, side }: RSVPSectionProps) {
  const initialValues = useMemo<RSVPFormValues>(() => ({
    name: guestName ?? '',
    attendance: defaultAttendance(side),
    partySize: 1,
    message: '',
  }), [guestName, side])

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RSVPFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [giftOpen, setGiftOpen] = useState(false)
  const [giftTab, setGiftTab] = useState<'groom' | 'bride'>('groom')
  const closeGift = useCallback(() => setGiftOpen(false), [])
  const giftTabs = useMemo(() => ['groom', 'bride'] as const, [])

  const onGiftTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: 'groom' | 'bride') => {
    const currentIndex = giftTabs.indexOf(current)
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % giftTabs.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + giftTabs.length) % giftTabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = giftTabs.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    const nextRecipient = giftTabs[nextIndex]!
    setGiftTab(nextRecipient)
    document.getElementById(`gift-tab-${nextRecipient}`)?.focus()
  }

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
        partySize: attendanceIsAttending(values.attendance) ? values.partySize : 0,
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

  const resetForm = () => {
    setValues(initialValues)
    setSubmittedName('')
    setErrors({})
  }

  return (
    <section className="rsvp" id="rsvp" aria-labelledby="rsvp-title">
      <FloralCorner className="rsvp__floral rsvp__floral--top" corner="top-left" tone="rose" variant="trail" />
      <FloralCorner className="rsvp__floral rsvp__floral--bottom" corner="bottom-right" tone="rose" variant="trail" />

      <div className="container">
        <div className="rsvp__composition">
          <article className="rsvp__card">
            <OrientalReveal className="rsvp__head" variant="up">
              <RoseSeal className="rsvp__seal" tone="rose" monogram={config.couple.monogram} ring="thin" />
              <p className="rsvp__eyebrow">Phiếu hồi âm</p>
              <h2 id="rsvp-title" className="rsvp__title">Xác nhận tham dự</h2>
              <p className="rsvp__intro">{config.copy.rsvpIntro}</p>
              <HairlineDivider className="rsvp__divider" center="diamond" tone="rose" />
            </OrientalReveal>

            {submittedName ? (
              <div className="rsvp__success" role="status">
                <OrientalReveal variant="scale">
                  <Lotus className="rsvp__success-icon" tone="rose" withWater={false} size="3rem" />
                </OrientalReveal>
                <p className="rsvp__success-eyebrow">Đã nhận hồi âm</p>
                <p className="rsvp__success-title">{config.copy.rsvpThanks}</p>
                <p className="rsvp__success-detail">
                  Chúng mình rất vui vì <strong>{submittedName}</strong> sẽ đến chung vui.
                </p>
                <button type="button" className="text-button" onClick={resetForm}>Gửi một hồi âm khác</button>
              </div>
            ) : (
              <form className="rsvp__form" onSubmit={submit} noValidate>
                {Object.keys(errors).length > 0 && (
                  <p className="form-error form-error--summary" role="alert">Vui lòng kiểm tra các trường được đánh dấu bên dưới.</p>
                )}

                <div className="field">
                  <label htmlFor="rsvp-name">Họ và tên <span aria-hidden="true">*</span></label>
                  <input
                    id="rsvp-name"
                    name="name"
                    value={values.name}
                    maxLength={81}
                    autoComplete="name"
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'rsvp-name-error' : undefined}
                    onChange={(event) => setValues({ ...values, name: event.target.value })}
                  />
                  {errors.name && <span className="field__error" id="rsvp-name-error">{errors.name}</span>}
                </div>

                <fieldset
                  className="field fieldset"
                  aria-invalid={Boolean(errors.attendance)}
                  aria-describedby={errors.attendance ? 'rsvp-attendance-error' : undefined}
                  tabIndex={errors.attendance ? -1 : undefined}
                >
                  <legend>Bạn sẽ tham dự chứ? <span aria-hidden="true">*</span></legend>
                  {ATTENDANCE_OPTIONS.map((option) => (
                    <label className={`choice${values.attendance === option.value ? ' choice--active' : ''}`} key={option.value}>
                      <input
                        type="radio"
                        name="attendance"
                        value={option.value}
                        required
                        checked={values.attendance === option.value}
                        onChange={() => setValues({ ...values, attendance: option.value })}
                      />
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.hint}</small>
                      </span>
                    </label>
                  ))}
                  {errors.attendance && <span className="field__error" id="rsvp-attendance-error">{errors.attendance}</span>}
                </fieldset>

                {attendanceIsAttending(values.attendance) && (
                  <div className="field">
                    <label htmlFor="rsvp-party-size">Số người tham dự</label>
                    <select
                      id="rsvp-party-size"
                      value={values.partySize}
                      aria-invalid={Boolean(errors.partySize)}
                      onChange={(event) => setValues({ ...values, partySize: Number(event.target.value) })}
                    >
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((number) => (
                        <option key={number} value={number}>{number} người</option>
                      ))}
                    </select>
                    {errors.partySize && <span className="field__error">{errors.partySize}</span>}
                  </div>
                )}

                <div className="field">
                  <label htmlFor="rsvp-message">Gửi đôi lời tới Hùng &amp; Mai <small>Không bắt buộc</small></label>
                  <textarea
                    id="rsvp-message"
                    rows={4}
                    value={values.message}
                    maxLength={501}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'rsvp-message-error' : undefined}
                    onChange={(event) => setValues({ ...values, message: event.target.value })}
                  />
                  <div className="field__meta">
                    {errors.message ? <span className="field__error" id="rsvp-message-error">{errors.message}</span> : <span />}
                    {values.message.length}/500
                  </div>
                </div>

                <button className="button button--primary button--full" type="submit" disabled={submitting}>
                  <Send aria-hidden="true" /> {submitting ? 'Đang gửi…' : 'Gửi xác nhận'}
                </button>
                {submitError && <p className="form-error" role="alert">{submitError}</p>}
                <p className="rsvp__note">Bản thử nghiệm chỉ lưu hồi âm trên thiết bị này; gia đình chưa nhận được dữ liệu.</p>
              </form>
            )}
          </article>

          {config.features.gift && config.gift.enabled && (
            <OrientalReveal className="rsvp__gift" variant="up" delay={200}>
              <h3 className="rsvp__gift-title">{config.copy.giftLabel}</h3>
              <p>{config.copy.giftIntro}</p>
              <button className="button button--quiet" type="button" onClick={() => setGiftOpen(true)}>
                <Gift aria-hidden="true" /> {config.copy.giftLabel}
              </button>
            </OrientalReveal>
          )}
        </div>
      </div>

      <GoldReveal block>
        <Modal open={giftOpen} onClose={closeGift} title="gửi quà mừng" className="gift-modal">
          <div className="gift-modal__frame">
            <FloralCorner className="gift-modal__peony" tone="rose" variant="bloom" />
            <div className="gift-modal__header">
              <Lotus className="gift-modal__lotus" tone="rose" withWater={false} size="2.5rem" />
              <p className="eyebrow">Tấm lòng trân quý</p>
              <h2>{config.copy.giftLabel}</h2>
              <p>Chọn Nhà Trai hoặc Nhà Gái để xem thông tin chuyển khoản.</p>
            </div>
            <div className="gift-tabs" role="tablist" aria-label="Người nhận quà">
              {giftTabs.map((value) => (
                <button
                  type="button"
                  role="tab"
                  id={`gift-tab-${value}`}
                  aria-controls="gift-panel"
                  aria-selected={giftTab === value}
                  tabIndex={giftTab === value ? 0 : -1}
                  className={giftTab === value ? 'is-active' : ''}
                  onClick={() => setGiftTab(value)}
                  onKeyDown={(event) => onGiftTabKeyDown(event, value)}
                  key={value}
                >
                  {config.gift[value].label}
                </button>
              ))}
            </div>
            <div className="gift-modal__body" role="tabpanel" id="gift-panel" aria-labelledby={`gift-tab-${giftTab}`}>
              <GiftPanel recipient={config.gift[giftTab]} />
            </div>
          </div>
        </Modal>
      </GoldReveal>
    </section>
  )
}

function GiftPanel({ recipient }: { recipient: typeof config.gift.groom }) {
  const hasBankDetails = Boolean(recipient.bankName && recipient.accountName && recipient.accountNumber)
  return hasBankDetails ? (
    <>
      {recipient.qrImage && (
        <WeddingImage
          wrapperClassName="gift-modal__qr"
          src={recipient.qrImage}
          alt={`Mã QR quà mừng ${recipient.label}`}
          aspectRatio="1 / 1"
        />
      )}
      <dl>
        <div><dt>Ngân hàng</dt><dd>{recipient.bankName}</dd></div>
        <div><dt>Chủ tài khoản</dt><dd>{recipient.accountName}</dd></div>
        <div><dt>Số tài khoản</dt><dd>{recipient.accountNumber}</dd></div>
      </dl>
    </>
  ) : (
    <div className="gift-empty">
      <div className="gift-empty__qr" aria-hidden="true"><span>{config.couple.monogram}</span></div>
      <h3>Thông tin sẽ được cập nhật</h3>
      <p>Chúng mình chưa đăng thông tin ngân hàng hoặc mã QR thật cho {recipient.label}.</p>
    </div>
  )
}
