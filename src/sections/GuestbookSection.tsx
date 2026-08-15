import { useEffect, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { OrientalReveal } from '../components/motion'
import { EasternCloud, Lotus, PeonyCorner } from '../components/ornaments'
import { weddingConfig as config } from '../config/wedding'
import { guestbookService, type Wish } from '../services/guestbook'

export function GuestbookSection() {
  const [wishes, setWishes] = useState<Wish[]>(config.sampleWishes)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')
  const [submitError, setSubmitError] = useState(false)

  useEffect(() => {
    if (!config.features.guestbook) return
    let active = true
    guestbookService.list()
      .then((stored) => { if (active && stored.length) setWishes([...stored, ...config.sampleWishes]) })
      .catch(() => {
        if (active) {
          setSubmitError(true)
          setStatus('Chưa thể tải các lời chúc đã lưu trên thiết bị này.')
        }
      })
    return () => { active = false }
  }, [])

  if (!config.features.guestbook) return null

  const submitWish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    const nextErrors: { name?: string; message?: string } = {}
    if (!name.trim()) nextErrors.name = 'Vui lòng nhập tên của bạn.'
    else if (name.trim().length > 80) nextErrors.name = 'Tên không được dài quá 80 ký tự.'
    if (!message.trim()) nextErrors.message = 'Hãy viết một lời chúc nhỏ.'
    else if (message.trim().length > 500) nextErrors.message = 'Lời chúc không được dài quá 500 ký tự.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      window.setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0)
      return
    }
    setSubmitting(true)
    setSubmitError(false)
    setStatus('')
    try {
      const wish = await guestbookService.submit({ name, message })
      setWishes((current) => [wish, ...current])
      setName(''); setMessage(''); setStatus('Lời chúc của bạn đã được lưu. Cảm ơn bạn!')
    } catch {
      setSubmitError(true)
      setStatus('Chưa thể lưu lời chúc. Vui lòng thử lại sau ít phút.')
    } finally { setSubmitting(false) }
  }

  return (
    <section className="guestbook section ceremonial-section ceremonial-section--ivory" id="wishes" aria-labelledby="guestbook-title">
      <PeonyCorner className="guestbook__peony" tone="red" corner="top-right" />
      <EasternCloud className="guestbook__cloud" tone="gold" direction="left" />
      <div className="container">
        <OrientalReveal variant="up">
          <header className="section-heading guestbook__heading">
            <div className="section-heading__meta"><span>Lời chúc phúc</span></div>
            <Lotus className="guestbook__lotus" tone="red" size={92} />
            <h2 id="guestbook-title">Gửi lời chúc</h2>
            <p>{config.copy.guestbookIntro}</p>
          </header>
        </OrientalReveal>
        <div className="guestbook__layout">
          <OrientalReveal className="guestbook__form-wrap" variant="left">
            <form className="guestbook__form" onSubmit={submitWish} noValidate>
              <h3>Viết đôi lời thương</h3>
              {Object.keys(errors).length > 0 && <p className="form-error form-error--summary" role="alert">Vui lòng kiểm tra thông tin bên dưới.</p>}
              <div className="field"><label htmlFor="wish-name">Tên của bạn</label><input id="wish-name" name="name" autoComplete="name" value={name} maxLength={81} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'wish-name-error' : undefined} onChange={(event) => setName(event.target.value)} />{errors.name && <span id="wish-name-error" className="field__error">{errors.name}</span>}</div>
              <div className="field"><label htmlFor="wish-message">Lời chúc</label><textarea id="wish-message" name="message" rows={5} value={message} maxLength={501} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'wish-message-error' : undefined} onChange={(event) => setMessage(event.target.value)} />{errors.message && <span id="wish-message-error" className="field__error">{errors.message}</span>}</div>
              <button className="button button--primary button--full" type="submit" disabled={submitting}><Send aria-hidden="true" /> {submitting ? 'Đang gửi…' : 'Gửi lời chúc'}</button>
              <p className={`form-status ${submitError ? 'form-status--error' : ''}`} role={submitError ? 'alert' : 'status'}>{status}</p>
            </form>
          </OrientalReveal>
          <div className="wishes" aria-label="Các lời chúc" role="region" tabIndex={0}>
            {wishes.slice(0, 6).map((wish, index) => (
              <OrientalReveal className="wish-card" delay={(index % 3) * 80} key={wish.id} variant="up">
                <span className="wish-card__cord" aria-hidden="true" />
                <span className="wish-card__number">{String(index + 1).padStart(2, '0')}</span>
                <blockquote>“{wish.message}”</blockquote>
                <p>— {wish.name}</p>
              </OrientalReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
