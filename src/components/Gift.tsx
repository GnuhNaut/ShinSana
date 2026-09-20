import { useEffect, useState } from 'react';
import { wedding, type VenueKey, type WeddingSide } from '../config/wedding';
import { usePointerSurface } from '../hooks/usePointerSurface';
import { ArrowIcon } from './Icons';

function RedEnvelope({
  envelopeKey,
  selected,
  preferred,
  onOpen,
}: {
  envelopeKey: VenueKey;
  selected: boolean;
  preferred: boolean;
  onOpen: () => void;
}) {
  const pointerRef = usePointerSurface<HTMLButtonElement>();
  const gift = wedding.gifts[envelopeKey];
  return (
    <button
      ref={pointerRef}
      className={`red-envelope ${selected ? 'is-selected' : ''} ${preferred ? 'is-preferred' : ''}`}
      type="button"
      onClick={onOpen}
      aria-expanded={selected}
      aria-pressed={selected}
      aria-controls="gift-insert"
      aria-label={`${selected ? 'Đang chọn' : 'Mở'} phong bao ${gift.label}`}
    >
      <span className="red-envelope__back" aria-hidden="true" />
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
        <p>Sự hiện diện của bạn là món quà quý nhất. Nếu muốn gửi lời mừng, hãy chọn phong bao của gia đình.</p>
      </div>

      <div className="gift-stage">
        <div className="gift-envelopes" aria-label="Chọn phong bao mừng cưới">
          {(['groom', 'bride'] as const).map((key) => (
            <div key={key} className={`gift-envelope-slot ${active === key ? 'is-active' : ''} ${active && active !== key ? 'is-receding' : ''}`}>
              <RedEnvelope
                envelopeKey={key}
                selected={active === key}
                preferred={active === null && preferred === key}
                onOpen={() => setActive(key)}
              />
              <span className="gift-envelope-caption">{wedding.gifts[key].label}</span>
            </div>
          ))}
        </div>

        <div
          className={`gift-open-object ${active ? 'is-visible' : ''}`}
          aria-hidden={!active}
          inert={!active}
        >
          <div className="gift-open-envelope" aria-hidden="true">
            <span className="gift-open-envelope__back" />
            <span className="gift-open-envelope__flap" />
            <span className="gift-open-envelope__front" />
            <span className="gift-open-envelope__seal">囍</span>
          </div>

          <article id="gift-insert" className="gift-insert" key={active ?? 'closed'} aria-live="polite">
            <header className="gift-insert__header">
              <span>HỶ TÍN · {selected.label}</span>
              <i>19 · 10 · 2026</i>
            </header>
            <div className="gift-insert__content">
              <div className="gift-insert__information">
                <p className="gift-insert__overline">CHỦ TÀI KHOẢN</p>
                <h3>{selected.accountHolder}</h3>
                <div className="gift-insert__rule" aria-hidden="true"><span>囍</span></div>
                <p className="gift-insert__overline">NGÂN HÀNG</p>
                <p className="gift-insert__bank">{selected.bankName}</p>
                <div className="gift-insert__account">
                  <div>
                    <p className="gift-insert__overline">SỐ TÀI KHOẢN</p>
                    <strong>{selected.accountNumber}</strong>
                  </div>
                  <button className="text-action" type="button" onClick={copyAccount} disabled={isPlaceholder}>
                    {copyState === 'copied' ? 'Đã sao chép' : copyState === 'failed' ? 'Không thể sao chép' : 'Sao chép'}
                    <ArrowIcon direction="external" />
                  </button>
                </div>
                <p className="gift-insert__status" role="status">
                  {isPlaceholder ? 'Thông tin chuyển khoản đang chờ cập nhật.' : copyState === 'copied' ? 'Số tài khoản đã được sao chép.' : copyState === 'failed' ? 'Vui lòng sao chép thủ công.' : ''}
                </p>
              </div>
              <div className="gift-insert__qr" data-no-hearts>
                {selected.qrImage ? (
                  <img src={selected.qrImage} alt={`Mã QR chuyển khoản ${selected.label}`} loading="lazy" />
                ) : (
                  <div className="qr-empty" role="img" aria-label="Mã QR đang chờ cập nhật">
                    <span aria-hidden="true">QR</span>
                    <small>ĐANG CẬP NHẬT</small>
                  </div>
                )}
                <span>QUÉT MÃ MỪNG CƯỚI</span>
              </div>
            </div>
            <footer><span>Tuấn Hùng</span><i>囍</i><span>Sao Mai</span></footer>
          </article>
        </div>

        {!active && <p className="gift-stage__prompt">Chạm vào một phong bao để mở</p>}
      </div>
    </section>
  );
}
