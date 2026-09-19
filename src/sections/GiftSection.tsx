import { useState } from 'react'
import { Check, Copy, HeartHandshake } from 'lucide-react'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import type { GuestSide, WeddingGiftAccount, WeddingSide } from '../types/wedding'
import { copyPlainText } from '../utils/clipboard'
import { safeAssetUrl } from '../utils/contentSafety'

interface GiftSectionProps {
  side: GuestSide
}

export function GiftSection({ side }: GiftSectionProps) {
  const config = useWeddingConfig()
  const defaultSide: WeddingSide | null = side === 'both' ? null : side
  const [activeSide, setActiveSide] = useState<WeddingSide | null>(defaultSide)
  const accounts = side === 'groom'
    ? [config.gifts.groom, config.gifts.bride]
    : side === 'bride'
      ? [config.gifts.bride, config.gifts.groom]
      : [config.gifts.groom, config.gifts.bride]

  return (
    <section className={'gifts gifts--' + side} id="gifts" aria-labelledby="gifts-title">
      <div className="shell">
        <header className="gifts__header">
          <p className="section-kicker">{config.content.giftEyebrow}</p>
          <h2 id="gifts-title">{config.content.giftTitle}</h2>
          <p>{config.content.giftBody}</p>
        </header>
        <div className="gift-envelopes">
          {accounts.map((account) => (
            <GiftEnvelope
              account={account}
              active={activeSide === account.side}
              onActivate={() => setActiveSide(account.side)}
              key={account.side}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function GiftEnvelope({
  account,
  active,
  onActivate,
}: {
  account: WeddingGiftAccount
  active: boolean
  onActivate: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [qrFailed, setQrFailed] = useState(false)
  const qrImage = qrFailed ? null : safeAssetUrl(account.qrImage)
  const hasAccountNumber = Boolean(account.accountNumber.trim())
  const label = account.side === 'groom' ? 'Nhà Trai' : 'Nhà Gái'

  const copy = async () => {
    if (!hasAccountNumber) return
    const success = await copyPlainText(account.accountNumber)
    setCopied(success)
    if (success) window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <article className={'gift-envelope gift-envelope--' + account.side + (active ? ' is-active' : '')}>
      <button className="gift-envelope__activate" type="button" onClick={onActivate} aria-pressed={active}>
        <span>{label}</span>
        <i aria-hidden="true">{active ? 'Đang xem' : 'Xem thông tin'}</i>
      </button>
      <div className="gift-envelope__seal" aria-hidden="true">囍</div>
      <div className="gift-envelope__content">
        <p className="gift-envelope__label">{label}</p>
        <div className="gift-envelope__qr">
          {qrImage ? (
            <img src={qrImage} alt={'Mã QR mừng cưới ' + label} width="640" height="640" loading="lazy" decoding="async" onError={() => setQrFailed(true)} />
          ) : (
            <div className="gift-envelope__qr-placeholder" role="img" aria-label={'Mã QR ' + label + ' sẽ được cập nhật'}>
              <span>QR</span><small>Sẽ cập nhật</small>
            </div>
          )}
        </div>
        <dl>
          <div><dt>Ngân hàng</dt><dd>{account.bankName || 'Chưa cập nhật'}</dd></div>
          <div><dt>Chủ tài khoản</dt><dd>{account.accountHolder || 'Chưa cập nhật'}</dd></div>
          <div><dt>Số tài khoản</dt><dd>{account.accountNumber || 'Chưa cập nhật'}</dd></div>
        </dl>
        <button className="button button--cream button--full" type="button" disabled={!hasAccountNumber} onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'Đã sao chép' : hasAccountNumber ? 'Copy số tài khoản' : 'Chưa có số tài khoản'}
        </button>
        <span className="sr-only" aria-live="polite">{copied ? 'Đã sao chép số tài khoản' : ''}</span>
      </div>
      <HeartHandshake className="gift-envelope__icon" aria-hidden="true" />
    </article>
  )
}
