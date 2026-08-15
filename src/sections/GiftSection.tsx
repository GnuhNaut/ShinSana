import { useCallback, useState, type KeyboardEvent } from 'react'
import { Gift, LockKeyhole } from 'lucide-react'
import { OrientalReveal } from '../components/motion'
import { EasternCloud, Lotus, PeonyCorner } from '../components/ornaments'
import { Modal } from '../components/ui/Modal'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function GiftSection() {
  const [open, setOpen] = useState(false)
  const [recipient, setRecipient] = useState<'groom' | 'bride'>('groom')
  const closeModal = useCallback(() => setOpen(false), [])
  if (!config.features.gift || !config.gift.enabled) return null
  const details = config.gift[recipient]
  const hasBankDetails = Boolean(details.bankName && details.accountName && details.accountNumber)
  const recipients = ['groom', 'bride'] as const

  const moveTabFocus = (event: KeyboardEvent<HTMLButtonElement>, current: 'groom' | 'bride') => {
    const currentIndex = recipients.indexOf(current)
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % recipients.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + recipients.length) % recipients.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = recipients.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    const nextRecipient = recipients[nextIndex]!
    setRecipient(nextRecipient)
    document.getElementById(`gift-tab-${nextRecipient}`)?.focus()
  }

  return (
    <section className="gift section gift--lacquer ceremonial-section ceremonial-section--red" aria-labelledby="gift-title">
      <PeonyCorner className="gift__peony gift__peony--left" tone="gold" corner="top-left" />
      <PeonyCorner className="gift__peony gift__peony--right" tone="gold" corner="bottom-right" />
      <EasternCloud className="gift__cloud" tone="champagne" direction="right" />
      <OrientalReveal className="container gift__inner gift__ceremonial-frame" variant="up">
        <div className="gift__title-wrap">
          <p className="eyebrow">Lễ vật chúc phúc</p>
          <h2 id="gift-title">Một món quà nhỏ,<br />một niềm vui lớn</h2>
        </div>
        <div className="gift__copy">
          <p>Sự hiện diện của bạn đã là món quà quý giá. Nếu muốn gửi thêm lời chúc theo một cách khác, bạn có thể mở hộp quà bên dưới.</p>
          <button className="button button--outline" type="button" onClick={() => setOpen(true)}><Gift aria-hidden="true" /> Gửi quà mừng</button>
        </div>
      </OrientalReveal>
      <Modal open={open} onClose={closeModal} title="quà mừng" className="gift-modal">
        <div className="gift-modal__ceremonial-frame">
          <PeonyCorner className="gift-modal__peony" tone="red" corner="top-right" size={130} />
          <div className="gift-modal__header">
            <Lotus className="gift-modal__lotus" tone="red" size={78} />
            <p className="eyebrow">Tấm lòng trân quý</p>
            <h2>Gửi quà mừng</h2>
            <p>Thông tin sẽ chỉ xuất hiện khi gia đình cập nhật dữ liệu thật.</p>
          </div>
          <div className="gift-tabs" role="tablist" aria-label="Người nhận quà">
            {recipients.map((value) => <button type="button" role="tab" id={`gift-tab-${value}`} aria-controls="gift-panel" aria-selected={recipient === value} tabIndex={recipient === value ? 0 : -1} className={recipient === value ? 'is-active' : ''} onClick={() => setRecipient(value)} onKeyDown={(event) => moveTabFocus(event, value)} key={value}>{config.gift[value].label}</button>)}
          </div>
          <div className="gift-modal__body" role="tabpanel" id="gift-panel" aria-labelledby={`gift-tab-${recipient}`}>
            {hasBankDetails ? (
              <><WeddingQr src={details.qrImage} label={details.label} /><dl><div><dt>Ngân hàng</dt><dd>{details.bankName}</dd></div><div><dt>Chủ tài khoản</dt><dd>{details.accountName}</dd></div><div><dt>Số tài khoản</dt><dd>{details.accountNumber}</dd></div></dl></>
            ) : (
              <div className="gift-empty"><div className="gift-empty__qr" aria-hidden="true"><span>{config.couple.monogram}</span></div><LockKeyhole aria-hidden="true" /><h3>Thông tin sẽ được cập nhật</h3><p>Chúng mình chưa đăng thông tin ngân hàng hoặc mã QR thật.</p></div>
            )}
          </div>
        </div>
      </Modal>
    </section>
  )
}

function WeddingQr({ src, label }: { src: string; label: string }) {
  return src ? <WeddingImage wrapperClassName="gift-modal__qr" src={src} alt={`Mã QR quà mừng ${label}`} aspectRatio="1 / 1" /> : null
}
