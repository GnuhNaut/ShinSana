import { useEffect, useState } from 'react';
import { wedding, type VenueKey, type WeddingSide } from '../config/wedding';
import { usePointerSurface } from '../hooks/usePointerSurface';

function RedEnvelope({
  envelopeKey,
  active,
  preferred,
  onOpen,
}: {
  envelopeKey: VenueKey;
  active: boolean;
  preferred: boolean;
  onOpen: () => void;
}) {
  const pointerRef = usePointerSurface<HTMLButtonElement>();
  const gift = wedding.gifts[envelopeKey];
  return (
    <button
      ref={pointerRef}
      className={`red-envelope ${active ? 'is-open' : ''} ${preferred ? 'is-preferred' : ''}`}
      type="button"
      onClick={onOpen}
      aria-expanded={active}
      aria-controls="gift-details"
    >
      <span className="red-envelope__back" aria-hidden="true" />
      <span className="red-envelope__insert" aria-hidden="true"><i>19 · 10</i></span>
      <span className="red-envelope__front">
        <span className="red-envelope__fold red-envelope__fold--left" aria-hidden="true" />
        <span className="red-envelope__fold red-envelope__fold--right" aria-hidden="true" />
        <span className="red-envelope__label">{gift.label}</span>
        <span className="red-envelope__year">BÍNH NGỌ · 2026</span>
      </span>
      <span className="red-envelope__flap" aria-hidden="true" />
      <span className="red-envelope__seal" aria-hidden="true"><i>囍</i></span>
      <span className="red-envelope__shine" aria-hidden="true" />
    </button>
  );
}

export function Gift({ side }: { side: WeddingSide }) {
  const preferred: VenueKey = side === 'bride' ? 'bride' : 'groom';
  const [active, setActive] = useState<VenueKey | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const selected = wedding.gifts[active ?? preferred];
  const isPlaceholder = selected.accountNumber === 'Đang cập nhật';

  useEffect(() => setCopyState('idle'), [active]);

  const copyAccount = async () => {
    if (isPlaceholder) return;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(selected.accountNumber);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <section className={`scene gift-scene ${active ? 'gift-scene--open' : ''}`} id="gift" aria-labelledby="gift-title">
      <div className="gift-scene__heading">
        <p className="scene-kicker">MỪNG CƯỚI</p>
        <h2 id="gift-title">Gửi một niềm vui nhỏ.</h2>
        <p>Sự hiện diện của bạn là món quà quý nhất. Nếu muốn gửi lời mừng, hãy mở phong bao của gia đình.</p>
      </div>

      <div className={`gift-stage ${active ? 'has-open-envelope' : ''}`}>
        <div className="gift-envelopes" aria-label="Chọn phong bao mừng cưới">
          {(['groom', 'bride'] as const).map((key) => (
            <div key={key} className={`gift-envelope-slot ${active && active !== key ? 'is-receding' : ''}`}>
              <RedEnvelope
                envelopeKey={key}
                active={active === key}
                preferred={active === null && preferred === key}
                onOpen={() => setActive(key)}
              />
              <span className="gift-envelope-caption">{wedding.gifts[key].label}</span>
            </div>
          ))}
        </div>

        <div
          id="gift-details"
          className={`gift-details ${active ? 'is-visible' : ''}`}
          aria-hidden={!active}
          inert={!active}
          aria-live="polite"
          key={active ?? 'closed'}
        >
          <div className="gift-details__identity">
            <span>PHONG BAO · {selected.label}</span>
            <strong>{selected.accountHolder}</strong>
          </div>
          <div className="gift-details__bank">
            <span>NGÂN HÀNG</span>
            <p>{selected.bankName}</p>
            <span>SỐ TÀI KHOẢN</span>
            <b>{selected.accountNumber}</b>
            <button className="text-action" type="button" onClick={copyAccount} disabled={isPlaceholder}>
              {copyState === 'copied' ? 'Đã sao chép' : copyState === 'failed' ? 'Không thể sao chép' : 'Sao chép số tài khoản'} <i aria-hidden="true">↗</i>
            </button>
            <p className="gift-details__status" role="status">
              {isPlaceholder ? 'Thông tin chuyển khoản đang chờ cập nhật.' : copyState === 'copied' ? 'Số tài khoản đã được sao chép.' : copyState === 'failed' ? 'Vui lòng sao chép thủ công.' : ''}
            </p>
          </div>
          <div className="gift-details__qr">
            {selected.qrImage ? (
              <img src={selected.qrImage} alt={`Mã QR chuyển khoản ${selected.label}`} loading="lazy" />
            ) : (
              <div className="qr-empty" role="img" aria-label="Mã QR đang chờ cập nhật">
                <span aria-hidden="true">QR</span>
                <small>ĐANG CẬP NHẬT</small>
              </div>
            )}
          </div>
        </div>
        {!active && <p className="gift-stage__prompt">Chạm vào phong bao để mở</p>}
      </div>
    </section>
  );
}
