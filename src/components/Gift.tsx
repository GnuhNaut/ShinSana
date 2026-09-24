import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { wedding, type VenueKey, type WeddingSide } from '../config/wedding';
import { usePointerSurface } from '../hooks/usePointerSurface';
import { ArrowIcon, CloseIcon } from './Icons';

function RedEnvelope({
  selected,
  onOpen,
}: {
  selected: boolean;
  onOpen: () => void;
}) {
  const pointerRef = usePointerSurface<HTMLButtonElement>();
  const gift = wedding.gifts.groom;
  return (
    <button
      ref={pointerRef}
      className={`red-envelope ${selected ? 'is-selected' : ''}`}
      type="button"
      onClick={onOpen}
      aria-expanded={selected}
      aria-pressed={selected}
      aria-controls="gift-insert"
      aria-label={`${selected ? 'Đóng' : 'Mở'} phong bao ${gift.label}`}
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
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [zoomQr, setZoomQr] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const selected = wedding.gifts.groom;
  const isPlaceholder = (selected.accountNumber as string) === 'Đang cập nhật';

  useEffect(() => {
    setCopyState('idle');
    if (!open) setZoomQr(false);
  }, [open]);

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

  const downloadQrImage = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selected.qrImage) return;
    setDownloadingQr(true);
    try {
      const res = await fetch(selected.qrImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = selected.accountHolder.trim().replace(/\s+/g, '_') || 'Tuan_Hung';
      a.download = `QR-MungCuoi-${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(selected.qrImage, '_blank');
    } finally {
      setDownloadingQr(false);
    }
  };

  return (
    <section className={`scene gift-scene ${open ? 'gift-scene--open' : ''}`} id="gift" aria-labelledby="gift-title">
      <div className="gift-scene__heading">
        <p className="scene-kicker">MỪNG HỶ</p>
        <h2 id="gift-title">Gửi trọn yêu thương.</h2>
        <p>Sự hiện diện và lời chúc của bạn
đã là món quà ý nghĩa nhất dành cho chúng mình.
Nếu bạn muốn gửi thêm lời chúc mừng,
chúng mình xin trân trọng đón nhận.</p>
      </div>

      <div className="gift-stage">
        <div className="gift-envelopes" aria-label="Phong bao mừng cưới">
          <div className={`gift-envelope-slot ${open ? 'is-active' : ''}`}>
            <RedEnvelope
              selected={open}
              onOpen={() => setOpen((prev) => !prev)}
            />
            <span className="gift-envelope-caption">{selected.label}</span>
          </div>
        </div>

        <div
          className={`gift-open-object ${open ? 'is-visible' : ''}`}
          aria-hidden={!open}
          inert={!open}
        >
          <div className="gift-open-envelope" aria-hidden="true">
            <span className="gift-open-envelope__back" />
            <span className="gift-open-envelope__flap" />
            <span className="gift-open-envelope__front" />
            <span className="gift-open-envelope__seal">囍</span>
          </div>

          <article id="gift-insert" className="gift-insert" key={open ? 'open' : 'closed'} aria-live="polite">
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
              <div
                className="gift-insert__qr"
                data-no-hearts
                onClick={() => selected.qrImage && setZoomQr(true)}
                title={selected.qrImage ? 'Chạm để phóng to mã QR' : undefined}
                style={{ cursor: selected.qrImage ? 'pointer' : 'default' }}
                role={selected.qrImage ? 'button' : undefined}
                tabIndex={selected.qrImage ? 0 : undefined}
                onKeyDown={(e) => {
                  if (selected.qrImage && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setZoomQr(true);
                  }
                }}
              >
                {selected.qrImage ? (
                  <img src={selected.qrImage} alt={`Mã QR chuyển khoản ${selected.label}`} loading="lazy" />
                ) : (
                  <div className="qr-empty" role="img" aria-label="Mã QR đang chờ cập nhật">
                    <span aria-hidden="true">QR</span>
                    <small>ĐANG CẬP NHẬT</small>
                  </div>
                )}
                <span>CHẠM PHÓNG TO / TẢI VỀ 🔍</span>
              </div>
            </div>
            <footer><span>Tuấn Hùng</span><i>囍</i><span>Sao Mai</span></footer>
          </article>
        </div>

        {!open && <p className="gift-stage__prompt">Chạm vào phong bao để mở</p>}
      </div>

      {zoomQr && selected.qrImage && createPortal(
        <div
          className="qr-zoom-backdrop"
          onClick={() => setZoomQr(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Phóng to mã QR mừng cưới"
        >
          <div className="qr-zoom-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="seal-button qr-zoom-close"
              type="button"
              onClick={() => setZoomQr(false)}
              aria-label="Đóng"
            >
              <CloseIcon />
            </button>
            <div className="qr-zoom-header">
              <span className="qr-zoom-seal">囍</span>
              <h3>MÃ QR MỪNG CƯỚI</h3>
              <p>{selected.accountHolder} · {selected.bankName}</p>
            </div>
            <div className="qr-zoom-img-wrap">
              <img src={selected.qrImage} alt={`Mã QR ${selected.label}`} />
            </div>
            <div className="qr-zoom-account">
              <span>Số tài khoản: <strong>{selected.accountNumber}</strong></span>
              <div className="qr-zoom-actions">
                <button
                  type="button"
                  className="ivory-button qr-zoom-btn"
                  onClick={copyAccount}
                >
                  {copyState === 'copied' ? 'Đã sao chép STK ✓' : 'Sao chép STK'}
                </button>
                <button
                  type="button"
                  className="lacquer-button qr-zoom-btn"
                  onClick={downloadQrImage}
                  disabled={downloadingQr}
                >
                  {downloadingQr ? 'Đang tải về...' : 'Tải mã QR 📥'}
                </button>
              </div>
            </div>
            <p className="qr-zoom-hint">
              💡 Bạn có thể <strong>tải mã QR</strong> về máy để mở ứng dụng ngân hàng và quét trực tiếp từ thư viện ảnh.
            </p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
