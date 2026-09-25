import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { wedding, type WeddingSide } from '../config/wedding';
import { usePointerSurface } from '../hooks/usePointerSurface';
import { CloseIcon } from './Icons';

function RedEnvelope({
  onOpen,
}: {
  onOpen: () => void;
}) {
  const pointerRef = usePointerSurface<HTMLButtonElement>();
  const gift = wedding.gifts.groom;
  return (
    <button
      ref={pointerRef}
      className="red-envelope"
      type="button"
      onClick={onOpen}
      aria-label={`Mở phong bao ${gift.label}`}
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
  // Chỉ hiển thị phần mừng cưới cho Nhà Trai ('groom') hoặc cả hai bên ('both')
  if (side !== 'groom' && side !== 'both') {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [downloadingQr, setDownloadingQr] = useState(false);
  const selected = wedding.gifts.groom;
  const isPlaceholder = (selected.accountNumber as string) === 'Đang cập nhật';

  useEffect(() => {
    setCopyState('idle');
  }, [open]);

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selected.qrImage || downloadingQr) return;
    setDownloadingQr(true);

    const cleanName = selected.accountHolder.trim().replace(/\s+/g, '_') || 'Tuan_Hung';
    const fileName = `QR-MungCuoi-${cleanName}.png`;

    try {
      const res = await fetch(selected.qrImage);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();

      // Hỗ trợ Web Share API trên thiết bị di động (iOS / Android) lưu ảnh trực tiếp vào Thư viện ảnh
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        const file = new File([blob], fileName, { type: blob.type || 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Mã QR Mừng Cưới',
            });
            setDownloadingQr(false);
            return;
          } catch (err: unknown) {
            if ((err as Error)?.name === 'AbortError') {
              setDownloadingQr(false);
              return;
            }
          }
        }
      }

      // Tải về cho Desktop và các trình duyệt hỗ trợ
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = fileName;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();

      // Giữ blob trong 60 giây, không thu hồi ngay lập tức để tránh lỗi tải lại trang trên Safari
      window.setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch {
      // Phương thức dự phòng an toàn không dùng window.open để tránh chuyển hướng trang
      const fallbackLink = document.createElement('a');
      fallbackLink.href = selected.qrImage;
      fallbackLink.download = fileName;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      window.setTimeout(() => {
        if (document.body.contains(fallbackLink)) document.body.removeChild(fallbackLink);
      }, 1000);
    } finally {
      setDownloadingQr(false);
    }
  };

  return (
    <section className="scene gift-scene" id="gift" aria-labelledby="gift-title">
      <div className="gift-scene__bg-art" aria-hidden="true">
        <span className="gift-scene__bg-circle gift-scene__bg-circle--left" />
        <span className="gift-scene__bg-circle gift-scene__bg-circle--right" />
        <span className="gift-scene__bg-emblem">囍</span>
      </div>

      <div className="gift-scene__inner">
        <div className="gift-scene__heading">
          <p className="scene-kicker">MỪNG HỶ</p>
          <h2 id="gift-title">
            <span className="gift-scene__title-main">Gửi trọn</span>
            <span className="gift-scene__title-accent">yêu thương.</span>
          </h2>
          <div className="gift-scene__copy">
            <p className="gift-scene__lead">
              Sự hiện diện và lời chúc của bạn đã là món quà ý nghĩa nhất dành cho chúng mình.
            </p>
            <div className="gift-scene__divider" aria-hidden="true">
              <span className="gift-scene__divider-line" />
              <span className="gift-scene__divider-star">✦</span>
              <span className="gift-scene__divider-line" />
            </div>
            <p className="gift-scene__note">
              Nếu bạn muốn gửi thêm lời chúc mừng, chúng mình xin trân trọng đón nhận.
            </p>
          </div>
          <div className="gift-scene__signature" aria-hidden="true">
            <span>Tuấn Hùng</span>
            <i>囍</i>
            <span>Sao Mai</span>
          </div>
        </div>

        <div className="gift-stage">
          <div className="gift-envelopes" aria-label="Phong bao mừng cưới">
            <div className="gift-envelope-slot">
              <RedEnvelope onOpen={() => setOpen(true)} />
            </div>
          </div>

          <button
            type="button"
            className="gift-stage__prompt"
            onClick={() => setOpen(true)}
            aria-label="Chạm vào phong bao để mở"
          >
            <span className="gift-stage__prompt-star">✦</span>
            <span>Chạm vào phong bao để mở</span>
            <span className="gift-stage__prompt-star">✦</span>
          </button>
        </div>
      </div>

      {open && createPortal(
        <div
          className="gift-modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Thông tin mừng cưới Hỷ Tín"
        >
          <div className="gift-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="seal-button gift-modal__close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng bảng mừng cưới"
            >
              <CloseIcon />
            </button>

            <header className="gift-modal__header">
              <span className="gift-modal__tag">HỶ TÍN · {selected.label}</span>
              <i className="gift-modal__date">19 · 10 · 2026</i>
            </header>

            <div className="gift-modal__body">
              <div className="gift-modal__info">
                <p className="gift-modal__label">CHỦ TÀI KHOẢN</p>
                <h3 className="gift-modal__name">{selected.accountHolder}</h3>

                <div className="gift-modal__rule" aria-hidden="true">
                  <span>囍</span>
                </div>

                <p className="gift-modal__label">NGÂN HÀNG</p>
                <p className="gift-modal__bank">{selected.bankName}</p>

                <div className="gift-modal__account-wrap">
                  <p className="gift-modal__label">SỐ TÀI KHOẢN</p>
                  <div className="gift-modal__account-row">
                    <strong className="gift-modal__acc-number">{selected.accountNumber}</strong>
                    <button
                      className="gift-modal__copy-btn"
                      type="button"
                      onClick={copyAccount}
                      disabled={isPlaceholder}
                    >
                      {copyState === 'copied' ? 'Đã sao chép ✓' : copyState === 'failed' ? 'Lỗi' : 'Sao chép STK'}
                    </button>
                  </div>
                  {copyState === 'copied' && (
                    <p className="gift-modal__status" role="status">
                      Đã sao chép số tài khoản vào bộ nhớ tạm.
                    </p>
                  )}
                </div>
              </div>

              <div className="gift-modal__qr-wrap">
                <div className="gift-modal__qr-card">
                  {selected.qrImage ? (
                    <img
                      src={selected.qrImage}
                      alt={`Mã QR mừng cưới ${selected.label}`}
                      className="gift-modal__qr-image"
                      title="Chạm giữ để lưu ảnh mã QR"
                    />
                  ) : (
                    <div className="qr-empty" role="img" aria-label="Mã QR đang chờ cập nhật">
                      <span aria-hidden="true">QR</span>
                      <small>ĐANG CẬP NHẬT</small>
                    </div>
                  )}
                </div>

                {selected.qrImage && (
                  <button
                    type="button"
                    className="lacquer-button gift-modal__download-btn"
                    onClick={downloadQrImage}
                    disabled={downloadingQr}
                  >
                    {downloadingQr ? 'Đang tải về...' : 'Tải mã QR về máy 📥'}
                  </button>
                )}

                <p className="gift-modal__hint">
                  💡 Bạn có thể bấm nút tải về hoặc chạm giữ vào ảnh QR để lưu trực tiếp vào máy.
                </p>
              </div>
            </div>

            <footer className="gift-modal__footer">
              <span>Tuấn Hùng</span>
              <i>囍</i>
              <span>Sao Mai</span>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
