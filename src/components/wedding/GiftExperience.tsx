import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { Check, Copy, Gift, HeartHandshake, Sparkles } from 'lucide-react'
import { GoldReveal, OrientalReveal } from '../motion'
import { FloralCorner, Lotus } from '../ornaments'
import { Modal } from '../ui/Modal'
import type { WeddingConfig, WeddingGiftAccount } from '../../types/wedding'
import { copyPlainText } from '../../utils/clipboard'
import { cleanOptionalText } from '../../utils/contentSafety'
import { getDisplayableGiftAccounts, safeGiftQrImage } from '../../utils/gift'

export const OPEN_GIFT_EXPERIENCE_EVENT = 'wedding:open-gift-experience'

interface GiftExperienceProps {
  gift: WeddingConfig['gift']
  heading: string
  intro: string
  ctaLabel?: string
}

const COPY_FEEDBACK_MS = 2200

export function GiftExperience({ gift, heading, intro, ctaLabel }: GiftExperienceProps) {
  const resolvedCtaLabel = ctaLabel ?? 'Mừng cưới online'
  const modalTitle = ctaLabel ?? 'mừng cưới online'
  const accounts = useMemo(() => getDisplayableGiftAccounts(gift), [gift])
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(() => accounts[0]?.id ?? '')
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const openGift = () => setOpen(true)
    window.addEventListener(OPEN_GIFT_EXPERIENCE_EVENT, openGift)
    return () => window.removeEventListener(OPEN_GIFT_EXPERIENCE_EVENT, openGift)
  }, [])

  if (!gift.enabled || accounts.length === 0) return null

  const requestedIndex = accounts.findIndex((account) => account.id === activeId)
  const activeIndex = requestedIndex >= 0 ? requestedIndex : 0
  const activeAccount = accounts[activeIndex]
  if (!activeAccount) return null

  const selectTab = (index: number) => {
    const account = accounts[index]
    if (!account) return
    setActiveId(account.id)
    document.getElementById(`gift-tab-${index}`)?.focus()
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % accounts.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + accounts.length) % accounts.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = accounts.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    selectTab(nextIndex)
  }

  return (
    <>
      <OrientalReveal className="gift-section" variant="up" delay={120}>
        <span className="gift-section__sparkle gift-section__sparkle--one" aria-hidden="true">✦</span>
        <span className="gift-section__sparkle gift-section__sparkle--two" aria-hidden="true">✧</span>
        <div className="container gift-section__inner">
          <HeartHandshake className="gift-section__icon" aria-hidden="true" />
          <p className="eyebrow">Tấm lòng yêu thương</p>
          <h2 id="gift-title">{heading} <span aria-hidden="true">💌</span></h2>
          <p className="gift-section__intro">{intro}</p>
          <button className="button button--primary" type="button" onClick={() => setOpen(true)}>
            <Gift aria-hidden="true" /> {resolvedCtaLabel}
          </button>
        </div>
      </OrientalReveal>

      <GoldReveal block>
        <Modal open={open} onClose={close} title={modalTitle} className="gift-modal">
          <div className="gift-modal__frame">
            <FloralCorner className="gift-modal__peony" tone="rose" variant="bloom" />
            <span className="gift-modal__sparkle gift-modal__sparkle--one" aria-hidden="true">✦</span>
            <span className="gift-modal__sparkle gift-modal__sparkle--two" aria-hidden="true">♥</span>
            <header className="gift-modal__header">
              <Sparkles className="gift-modal__sparkles" aria-hidden="true" />
              <Lotus className="gift-modal__lotus" tone="rose" withWater={false} size="2.5rem" />
              <p className="eyebrow">Tấm lòng trân quý</p>
              <h2>{heading}</h2>
              <p>{intro}</p>
            </header>

            {accounts.length > 1 && (
              <div
                className="gift-tabs"
                role="tablist"
                aria-label="Tài khoản nhận mừng cưới"
                style={{ '--gift-tab-count': accounts.length } as CSSProperties}
              >
                {accounts.map((account, index) => (
                  <button
                    type="button"
                    role="tab"
                    id={`gift-tab-${index}`}
                    aria-controls="gift-panel"
                    aria-selected={activeIndex === index}
                    tabIndex={activeIndex === index ? 0 : -1}
                    className={activeIndex === index ? 'is-active' : ''}
                    onClick={() => setActiveId(account.id)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                    key={account.id}
                  >
                    {giftAccountLabel(account)}
                  </button>
                ))}
              </div>
            )}

            <div
              className="gift-modal__body"
              role={accounts.length > 1 ? 'tabpanel' : undefined}
              id={accounts.length > 1 ? 'gift-panel' : undefined}
              aria-labelledby={accounts.length > 1 ? `gift-tab-${activeIndex}` : undefined}
            >
              <GiftPanel account={activeAccount} key={activeAccount.id} />
            </div>
          </div>
        </Modal>
      </GoldReveal>
    </>
  )
}

function giftAccountLabel(account: WeddingGiftAccount): string {
  const sideLabel = account.side === 'groom'
    ? 'Nhà Trai'
    : account.side === 'bride'
      ? 'Nhà Gái'
      : ''
  return cleanOptionalText(account.label) || sideLabel || cleanOptionalText(account.bankName)
}

function GiftPanel({ account }: { account: WeddingGiftAccount }) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [qrFailed, setQrFailed] = useState(false)
  const feedbackTimer = useRef<number | undefined>(undefined)
  const qrImage = qrFailed ? null : safeGiftQrImage(account)
  const branch = cleanOptionalText(account.branch)

  useEffect(() => () => window.clearTimeout(feedbackTimer.current), [])

  const copyAccountNumber = async () => {
    window.clearTimeout(feedbackTimer.current)
    const success = await copyPlainText(account.accountNumber)
    setCopied(success)
    setCopyFailed(!success)
    feedbackTimer.current = window.setTimeout(() => {
      setCopied(false)
      setCopyFailed(false)
    }, COPY_FEEDBACK_MS)
  }

  return (
    <>
      {qrImage && (
        <div className="gift-modal__qr">
          <img
            src={qrImage}
            alt={`Mã QR mừng cưới ${giftAccountLabel(account)}`}
            width="640"
            height="640"
            decoding="async"
            onError={() => setQrFailed(true)}
          />
        </div>
      )}

      <dl className="gift-modal__details">
        <div><dt>Ngân hàng</dt><dd>{cleanOptionalText(account.bankName)}</dd></div>
        {branch && <div><dt>Chi nhánh</dt><dd>{branch}</dd></div>}
        <div><dt>Chủ tài khoản</dt><dd>{cleanOptionalText(account.accountHolder)}</dd></div>
        <div className="gift-modal__account-number">
          <dt>Số tài khoản</dt>
          <dd>{cleanOptionalText(account.accountNumber)}</dd>
        </div>
      </dl>

      <div className="gift-modal__copy">
        <button className="button button--outline" type="button" onClick={copyAccountNumber}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'Đã sao chép' : 'Sao chép STK'}
        </button>
        <span className="gift-modal__copy-status" role="status" aria-live="polite">
          {copied ? 'Đã sao chép số tài khoản' : copyFailed ? 'Không thể sao chép. Vui lòng sao chép thủ công.' : ''}
        </span>
      </div>
    </>
  )
}
