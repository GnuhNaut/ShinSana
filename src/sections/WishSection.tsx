import { useState, type FormEvent } from 'react'
import { Heart } from 'lucide-react'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import { isAppsScriptAvailable, submitWish } from '../services/appsScript'
import type { GuestSide } from '../types/wedding'

interface WishSectionProps {
  guestName: string | null
  side: GuestSide
}

type FormStatus = 'idle' | 'success' | 'error'

export function WishSection({ guestName, side }: WishSectionProps) {
  const config = useWeddingConfig()
  const [name, setName] = useState(guestName ?? '')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const available = isAppsScriptAvailable()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!available || submitting) return
    if (!name.trim() || !message.trim()) {
      setValidationMessage('Vui lòng điền tên và lời chúc trước khi gửi.')
      return
    }

    setSubmitting(true)
    setValidationMessage('')
    const result = await submitWish({
      name: name.trim(),
      side,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    })
    setSubmitting(false)
    setStatus(result.status === 'success' ? 'success' : 'error')
  }

  return (
    <section className="wishes" id="wishes" aria-labelledby="wishes-title">
      <div className="shell wishes__layout">
        <div className="wishes__copy">
          <p className="section-kicker">{config.content.wishEyebrow}</p>
          <h2 id="wishes-title">{config.content.wishTitle}</h2>
          <p>{config.content.wishBody}</p>
          <div className="wish-list" aria-label="Lời chúc">
            {config.sampleWishes.map((wish) => (
              <blockquote key={wish.id}>
                <p>“{wish.message}”</p>
                <cite>— {wish.name}</cite>
              </blockquote>
            ))}
          </div>
        </div>
        <form className="wish-form" onSubmit={submit} noValidate>
          {!available && <p className="form-status form-status--pending" role="status">Tính năng gửi lời chúc trực tuyến sẽ sớm được mở.</p>}
          {status === 'success' && <p className="form-status form-status--success" role="status">Lời chúc của bạn đã được gửi. Cảm ơn bạn thật nhiều.</p>}
          {status === 'error' && <p className="form-status form-status--error" role="alert">Chưa thể gửi lời chúc. Vui lòng thử lại sau.</p>}
          {validationMessage && <p className="form-status form-status--error" role="alert">{validationMessage}</p>}
          <label className="field">
            <span>Tên của bạn</span>
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} />
          </label>
          <label className="field">
            <span>Lời chúc</span>
            <textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} />
          </label>
          <button className="button button--gold button--full" type="submit" disabled={!available || submitting}>
            <Heart aria-hidden="true" /> {submitting ? 'Đang gửi' : available ? 'Gửi lời chúc' : 'Sắp mở'}
          </button>
        </form>
      </div>
    </section>
  )
}
