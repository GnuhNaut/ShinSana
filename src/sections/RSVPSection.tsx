import { useCallback, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Gift, Send } from 'lucide-react'
import { GoldReveal, OrientalReveal } from '../components/motion'
import { FloralCorner, HairlineDivider, Lotus, RoseSeal } from '../components/ornaments'
import { Modal } from '../components/ui/Modal'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'
import { rsvpService } from '../services/rsvp'
import type { GiftRecipient } from '../types/wedding'
import {
  ATTENDANCE_OPTIONS,
  attendanceIsAttending,
  validateRSVP,
  type Attendance,
  type RSVPFormErrors,
  type RSVPFormValues,
} from '../utils/rsvpValidation'

interface RSVPSectionProps {
  guestName: string | null
}

type GiftRecipientKey = 'groom' | 'bride'

interface AvailableGiftRecipient {
  key: GiftRecipientKey
  recipient: GiftRecipient
}

function hasCompleteBankDetails(recipient: GiftRecipient): boolean {
  return Boolean(
    recipient.bankName.trim()
    && recipient.accountName.trim()
    && recipient.accountNumber.trim(),
  )
}

function hasGiftDetails(recipient: GiftRecipient): boolean {
  return hasCompleteBankDetails(recipient) || Boolean(recipient.qrImage.trim())
}

export function RSVPSection({ guestName }: RSVPSectionProps) {
  const initialValues = useMemo<RSVPFormValues>(() => ({
    name: guestName ?? '',
    attendance: '',
    partySize: 1,
    message: '',
  }), [guestName])

  const availableGiftRecipients = useMemo<AvailableGiftRecipient[]>(() => (
    (['groom', 'bride'] as const)
      .map((key) => ({ key, recipient: config.gift[key] }))
      .filter(({ recipient }) => hasGiftDetails(recipient))
  ), [])
  const giftAvailable = config.features.gift
    && config.gift.enabled
    && availableGiftRecipients.length > 0

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RSVPFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [submittedResponse, setSubmittedResponse] = useState<{
    name: string
    attendance: Attendance
  } | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [giftOpen, setGiftOpen] = useState(false)
  const [giftTab, setGiftTab] = useState<GiftRecipientKey>(
    () => availableGiftRecipients[0]?.key ?? 'groom',
  )
  const closeGift = useCallback(() => setGiftOpen(false), [])
  const clearError = (field: keyof RSVPFormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const onGiftTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: GiftRecipientKey) => {
    const currentIndex = availableGiftRecipients.findIndex(({ key }) => key === current)
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % availableGiftRecipients.length
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + availableGiftRecipients.length) % availableGiftRecipients.length
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = availableGiftRecipients.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    const nextRecipient = availableGiftRecipients[nextIndex]
    if (!nextRecipient) return
    setGiftTab(nextRecipient.key)
    document.getElementById(`gift-tab-${nextRecipient.key}`)?.focus()
  }

  if (!config.features.rsvp) return null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return

    const form = event.currentTarget
    const nextErrors = validateRSVP(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !values.attendance) {
      window.setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0)
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setSubmitError('')
    try {
      const name = values.name.trim()
      const message = values.message.trim()
      const result = await rsvpService.submit({
        name,
        attendance: values.attendance,
        submittedAt: new Date().toISOString(),
        ...(attendanceIsAttending(values.attendance) ? { partySize: values.partySize } : {}),
        ...(message ? { message } : {}),
      })
      if (result.ok) {
        setSubmittedResponse({ name, attendance: values.attendance })
      } else {
        setSubmitError('Chưa thể lưu hồi âm. Vui lòng thử lại.')
      }
    } catch {
      setSubmitError('Kết nối chưa sẵn sàng. Vui lòng thử lại sau ít phút.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setValues(initialValues)
    setSubmittedResponse(null)
    setErrors({})
    setSubmitError('')
  }

  const selectedGiftRecipient = availableGiftRecipients.find(({ key }) => key === giftTab)
    ?? availableGiftRecipients[0]

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

            {submittedResponse ? (
              <div className="rsvp__success" role="status">
                <OrientalReveal variant="scale">
                  <Lotus className="rsvp__success-icon" tone="rose" withWater={false} size="3rem" />
                </OrientalReveal>
                <p className="rsvp__success-eyebrow">Đã nhận hồi âm</p>
                {submittedResponse.attendance === 'yes' ? (
                  <>
                    <p className="rsvp__success-title">Cảm ơn bạn đã xác nhận</p>
                    <p className="rsvp__success-detail">
                      Chúng mình rất vui vì <strong>{submittedResponse.name}</strong> sẽ đến chung vui.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="rsvp__success-title">Cảm ơn bạn đã hồi âm</p>
                    <p className="rsvp__success-detail">
                      Chúng mình rất tiếc khi <strong>{submittedResponse.name}</strong> không thể có mặt,
                      nhưng luôn trân trọng tình cảm bạn gửi tới.
                    </p>
                  </>
                )}
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
                    onChange={(event) => {
                      setValues({ ...values, name: event.target.value })
                      clearError('name')
                    }}
                  />
                  {errors.name && <span className="field__error" id="rsvp-name-error">{errors.name}</span>}
                </div>

                <fieldset
                  className="field fieldset"
                  aria-invalid={Boolean(errors.attendance)}
                  aria-describedby={errors.attendance ? 'rsvp-attendance-error' : undefined}
                  tabIndex={errors.attendance ? -1 : undefined}
                >
                  <legend>Bạn sẽ đến chung vui cùng chúng mình chứ? <span aria-hidden="true">*</span></legend>
                  {ATTENDANCE_OPTIONS.map((option) => (
                    <label className={`choice${values.attendance === option.value ? ' choice--active' : ''}`} key={option.value}>
                      <input
                        type="radio"
                        name="attendance"
                        value={option.value}
                        required
                        checked={values.attendance === option.value}
                        onChange={() => {
                          setValues({ ...values, attendance: option.value })
                          clearError('attendance')
                          clearError('partySize')
                        }}
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
                      required
                      aria-invalid={Boolean(errors.partySize)}
                      aria-describedby={errors.partySize ? 'rsvp-party-size-error' : undefined}
                      onChange={(event) => {
                        setValues({ ...values, partySize: Number(event.target.value) })
                        clearError('partySize')
                      }}
                    >
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((number) => (
                        <option key={number} value={number}>{number} người</option>
                      ))}
                    </select>
                    {errors.partySize && (
                      <span className="field__error" id="rsvp-party-size-error">{errors.partySize}</span>
                    )}
                  </div>
                )}

                <div className="field">
                  <label htmlFor="rsvp-message">Gửi đôi lời tới Hùng &amp; Mai <small>Không bắt buộc</small></label>
                  <textarea
                    id="rsvp-message"
                    name="message"
                    rows={4}
                    value={values.message}
                    maxLength={501}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'rsvp-message-error' : undefined}
                    onChange={(event) => {
                      setValues({ ...values, message: event.target.value })
                      clearError('message')
                    }}
                  />
                  <div className="field__meta">
                    {errors.message ? <span className="field__error" id="rsvp-message-error">{errors.message}</span> : <span />}
                    {values.message.length}/500
                  </div>
                </div>

                <button className="button button--primary button--full" type="submit" disabled={submitting}>
                  <Send aria-hidden="true" /> {submitting ? 'Đang gửi…' : 'Gửi lời xác nhận'}
                </button>
                {submitError && <p className="form-error" role="alert">{submitError}</p>}
                {rsvpService.mode === 'local-demo' && (
                  <p className="rsvp__note">
                    <strong>Chế độ demo cục bộ:</strong> hồi âm chỉ được lưu trên thiết bị này;
                    gia đình chưa nhận được dữ liệu.
                  </p>
                )}
              </form>
            )}
          </article>

          {giftAvailable && (
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

      {giftAvailable && selectedGiftRecipient && (
        <GoldReveal block>
          <Modal open={giftOpen} onClose={closeGift} title="gửi quà mừng" className="gift-modal">
            <div className="gift-modal__frame">
              <FloralCorner className="gift-modal__peony" tone="rose" variant="bloom" />
              <div className="gift-modal__header">
                <Lotus className="gift-modal__lotus" tone="rose" withWater={false} size="2.5rem" />
                <p className="eyebrow">Tấm lòng trân quý</p>
                <h2>{config.copy.giftLabel}</h2>
                <p>
                  {availableGiftRecipients.length === 1
                    ? `Thông tin gửi quà mừng tới ${selectedGiftRecipient.recipient.label}.`
                    : 'Chọn Nhà Trai hoặc Nhà Gái để xem thông tin chuyển khoản.'}
                </p>
              </div>

              {availableGiftRecipients.length === 2 && (
                <div className="gift-tabs" role="tablist" aria-label="Người nhận quà">
                  {availableGiftRecipients.map(({ key, recipient }) => (
                    <button
                      type="button"
                      role="tab"
                      id={`gift-tab-${key}`}
                      aria-controls="gift-panel"
                      aria-selected={giftTab === key}
                      tabIndex={giftTab === key ? 0 : -1}
                      className={giftTab === key ? 'is-active' : ''}
                      onClick={() => setGiftTab(key)}
                      onKeyDown={(event) => onGiftTabKeyDown(event, key)}
                      key={key}
                    >
                      {recipient.label}
                    </button>
                  ))}
                </div>
              )}

              {availableGiftRecipients.length === 2 ? (
                <div
                  className="gift-modal__body"
                  role="tabpanel"
                  id="gift-panel"
                  aria-labelledby={`gift-tab-${selectedGiftRecipient.key}`}
                >
                  <GiftPanel recipient={selectedGiftRecipient.recipient} />
                </div>
              ) : (
                <div className="gift-modal__body">
                  <GiftPanel recipient={selectedGiftRecipient.recipient} />
                </div>
              )}
            </div>
          </Modal>
        </GoldReveal>
      )}
    </section>
  )
}

function GiftPanel({ recipient }: { recipient: GiftRecipient }) {
  const showBankDetails = hasCompleteBankDetails(recipient)

  return (
    <>
      {recipient.qrImage.trim() && (
        <WeddingImage
          wrapperClassName="gift-modal__qr"
          src={recipient.qrImage}
          alt={`Mã QR quà mừng ${recipient.label}`}
          aspectRatio="1 / 1"
        />
      )}
      {showBankDetails && (
        <dl>
          <div><dt>Ngân hàng</dt><dd>{recipient.bankName}</dd></div>
          <div><dt>Chủ tài khoản</dt><dd>{recipient.accountName}</dd></div>
          <div><dt>Số tài khoản</dt><dd>{recipient.accountNumber}</dd></div>
        </dl>
      )}
    </>
  )
}
