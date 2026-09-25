import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { wedding, type Venue, type VenueKey, type WeddingSide } from '../config/wedding';
import { useModalDialog } from '../hooks/useModalDialog';
import { usePointerSurface } from '../hooks/usePointerSurface';
import { ArrowIcon, CloseIcon } from './Icons';

function VenuePanel({
  venueKey,
  venue,
  onOpen,
}: {
  venueKey: VenueKey;
  venue: Venue;
  onOpen: (key: VenueKey, trigger: HTMLButtonElement) => void;
}) {
  const pointerRef = usePointerSurface<HTMLButtonElement>();
  return (
    <button
      ref={pointerRef}
      className={`venue-panel venue-panel--${venueKey}`}
      type="button"
      onClick={(event) => onOpen(venueKey, event.currentTarget)}
      aria-label={`Xem địa điểm ${venue.label}`}
    >
      <span className="venue-panel__edge" aria-hidden="true" />
      <span className="venue-panel__lattice" aria-hidden="true" />
      <span className="venue-panel__index" aria-hidden="true">{venueKey === 'groom' ? '壹' : '貳'}</span>
      <span className="venue-panel__content">
        <span className="venue-panel__top">
          <span className="venue-panel__side">{venue.label}</span>
          <span className="venue-panel__seal" aria-hidden="true">囍</span>
        </span>
        <strong className="venue-panel__title">{venue.name}</strong>
        <span className="venue-panel__rule" aria-hidden="true" />
        <span className="venue-panel__date">{venue.date}</span>
        {venue.time ? <span className="venue-panel__time">{venue.time}</span> : null}
        <span className="venue-panel__address">{venue.address}</span>
        <span className="text-action">Xem bản đồ <ArrowIcon direction="external" /></span>
      </span>
    </button>
  );
}

export function VenueMapDialog({
  venue,
  venueKey,
  open,
  onClose,
  returnFocus,
}: {
  venue: Venue;
  venueKey: VenueKey;
  open: boolean;
  onClose: () => void;
  returnFocus: React.RefObject<HTMLElement | null>;
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const close = useCallback(() => {
    setCopyState('idle');
    onClose();
  }, [onClose]);
  const dialogRef = useModalDialog<HTMLDivElement>(open, close, returnFocus);

  if (!open) return null;

  const copyAddress = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(venue.address);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return createPortal(
    <div
      className="venue-dialog-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className={`venue-dialog venue-dialog--${venueKey}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-dialog-title"
        aria-describedby="venue-dialog-address"
        tabIndex={-1}
      >
        <header className="venue-dialog__header">
          <span className="venue-dialog__mark" aria-hidden="true">囍</span>
          <span>{venue.label} · {venue.date}</span>
          <button className="seal-button venue-dialog__close" type="button" onClick={close} aria-label="Đóng bản đồ" data-autofocus>
            <CloseIcon />
          </button>
        </header>
        <div className="venue-dialog__body">
          <div className="venue-dialog__map-wrap">
            <iframe
              className="venue-dialog__map"
              src={venue.mapEmbedUrl}
              title={`Bản đồ ${venue.label}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <span className="venue-dialog__map-corner" aria-hidden="true">{venueKey === 'groom' ? '壹' : '貳'}</span>
          </div>
          <div className="venue-dialog__info">
            <p className="scene-kicker">{venue.label}</p>
            <h2 id="venue-dialog-title">{venue.name}</h2>
            <div className="venue-dialog__schedule">
              <span>Ngày</span><strong>{venue.date}</strong>
              {venue.time ? <><span>Giờ</span><strong>{venue.time}</strong></> : null}
            </div>
            <p id="venue-dialog-address" className="venue-dialog__address">{venue.address}</p>
            <div className="venue-dialog__actions">
              <a className="lacquer-button" href={venue.mapUrl} target="_blank" rel="noreferrer">
                Chỉ đường <ArrowIcon direction="external" />
              </a>
              <a
                className="ivory-button venue-dialog__cal-btn"
                href={
                  venueKey === 'groom'
                    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Lễ Thành Hôn Tuấn Hùng & Sao Mai (Tiệc Nhà Trai)')}&dates=20261019T030000Z/20261019T060000Z&details=${encodeURIComponent('Trân trọng kính mời bạn đến chung vui lễ thành hôn cùng Tuấn Hùng & Sao Mai.')}&location=${encodeURIComponent(venue.address)}`
                    : `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Tiệc Báo Hỷ Tuấn Hùng & Sao Mai (Tiệc Nhà Gái)')}&dates=20261018T033000Z/20261018T063000Z&details=${encodeURIComponent('Trân trọng kính mời bạn đến chung vui tiệc báo hỷ cùng Tuấn Hùng & Sao Mai.')}&location=${encodeURIComponent(venue.address)}`
                }
                target="_blank"
                rel="noreferrer"
                title="Thêm sự kiện vào Google Calendar trên điện thoại / máy tính"
              >
                Lưu vào lịch 📅
              </a>
              <button className="ivory-button" type="button" onClick={copyAddress}>
                {copyState === 'copied' ? 'Đã sao chép' : copyState === 'failed' ? 'Không thể sao chép' : 'Sao chép địa chỉ'}
              </button>
            </div>
            <p className="venue-dialog__feedback" role="status" aria-live="polite">
              {copyState === 'copied' ? 'Địa chỉ đã được lưu vào bộ nhớ tạm.' : copyState === 'failed' ? 'Vui lòng chọn và sao chép địa chỉ thủ công.' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function Venues({ side }: { side?: WeddingSide }) {
  // Luôn hiển thị đầy đủ cả Nhà Trai và Nhà Gái, không chia lọc nữa
  const keys: VenueKey[] = ['groom', 'bride'];
  const [selected, setSelected] = useState<VenueKey>(side === 'bride' ? 'bride' : 'groom');
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);

  const showVenue = (key: VenueKey, trigger: HTMLButtonElement) => {
    opener.current = trigger;
    setSelected(key);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

  return (
    <section
      className={`scene venue-scene ${keys.length === 1 ? 'venue-scene--single' : ''}`}
      data-testid="ceremony"
      aria-labelledby="venues-title"
    >
      {/* Khối Báo Tin Hôn Lễ Hai Bên Gia Đình (Tham khảo ảnh 2 & 3) */}
      <div className="venue-ceremony-card">
        <div className="venue-ceremony-card__inner">
          <div className="venue-ceremony-header">
            <span className="ceremony-header-line" aria-hidden="true" />
            <span className="venue-ceremony-badge">THÔNG TIN LỄ CƯỚI</span>
            <span className="ceremony-header-line" aria-hidden="true" />
          </div>

          <div className="venue-families-row">
            <div className="venue-family-branch venue-family-branch--groom">
              <span className="venue-family-tag">NHÀ TRAI</span>
              <p className="venue-family-prefix">Ông Bà</p>
              <strong className="venue-family-name">{wedding.parents.groom.father.toUpperCase()}</strong>
              <strong className="venue-family-name">{wedding.parents.groom.mother.toUpperCase()}</strong>
              <span className="venue-family-origin">Tân Hưng, Đa Phúc, Hà Nội</span>
            </div>

            <div className="venue-family-divider" aria-hidden="true">
              <span className="family-divider-seal">囍</span>
            </div>

            <div className="venue-family-branch venue-family-branch--bride">
              <span className="venue-family-tag">NHÀ GÁI</span>
              <p className="venue-family-prefix">Ông Bà</p>
              <strong className="venue-family-name">{wedding.parents.bride.father.toUpperCase()}</strong>
              <strong className="venue-family-name">{wedding.parents.bride.mother.toUpperCase()}</strong>
              <span className="venue-family-origin">Phú Lương, Hà Nội</span>
            </div>
          </div>

          <div className="venue-ceremony-notice">
            <p className="ceremony-notice-lead">TRÂN TRỌNG BÁO TIN</p>
            <p className="ceremony-notice-sub">LỄ THÀNH HÔN CỦA HAI CON CHÚNG TÔI</p>
          </div>

          <div className="venue-ceremony-couple">
            <div className="ceremony-couple-col">
              {/* <span className="ceremony-couple-rank">{wedding.parents.groom.rank.toUpperCase()}</span> */}
              <span className="ceremony-couple-name">{wedding.parents.groom.child}</span>
            </div>
            <span className="ceremony-couple-amp" aria-hidden="true">&amp;</span>
            <div className="ceremony-couple-col">
              {/* <span className="ceremony-couple-rank">{wedding.parents.bride.rank.toUpperCase()}</span> */}
              <span className="ceremony-couple-name">{wedding.parents.bride.child}</span>
            </div>
          </div>

          <div className="venue-ceremony-timebox">
            <p className="ceremony-timebox-label">LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI TƯ GIA NHÀ TRAI</p>
            {/* <div className="ceremony-timebox-clock">VÀO LÚC 09:00</div> */}
            <div className="ceremony-timebox-date">
              <span className="timebox-dow">THỨ HAI</span>
              <span className="timebox-bar">|</span>
              <strong className="timebox-day">19</strong>
              <span className="timebox-bar">|</span>
              <span className="timebox-month">THÁNG 10</span>
              <span className="timebox-bar">|</span>
              <span className="ceremony-timebox-year">2026</span>
            </div>
            <p className="ceremony-timebox-lunar">(TỨC NGÀY 10 THÁNG 09 NĂM BÍNH NGỌ)</p>
          </div>
        </div>
      </div>

      {/* Cầu nối chuyển tiếp giữa Lễ Thành Hôn và Tiệc Cưới */}
      <div className="venue-scene-divider" aria-hidden="true">
        <span className="venue-divider-line" />
        <span className="venue-divider-mark">❖ THÔNG TIN TIỆC CƯỚI ❖</span>
        <span className="venue-divider-line" />
      </div>

      {/* Khối Thông Tin Tiệc Cưới & Địa Điểm (Ảnh 1) */}
      <div className="venue-reception-block">
        <div className="venue-scene__intro">
          <h2 id="venues-title">
            <em>Kính mời</em>
            <span className="venue-title-row">đến chung vui</span>
            <span className="venue-title-row">ngày thành đôi.</span>
          </h2>
          <p className="venue-scene__subtext">
            Trân trọng kính mời bạn cùng người thương đến dự bữa cơm thân mật, chung vui và nâng ly chúc phúc cùng gia đình chúng tôi.
          </p>
          <div className="venue-scene__divider" aria-hidden="true">
            <span className="venue-scene__divider-line" />
            <span className="venue-scene__divider-star">✦</span>
            <span className="venue-scene__divider-line" />
          </div>
          <p className="venue-scene__subtext-honor">
            Sự hiện diện của bạn sẽ khiến ngày vui của chúng tôi thêm trọn vẹn và đáng nhớ.
          </p>
          <div className="venue-scene__touch-guide">
            <span className="venue-scene__touch-guide-star" aria-hidden="true">✦</span>
            <span>Chạm vào thiệp để xem thời gian, địa điểm & bản đồ chỉ đường</span>
            <span className="venue-scene__touch-guide-star" aria-hidden="true">✦</span>
          </div>
        </div>
        <div className="venue-stage" style={{ '--venue-count': keys.length } as CSSProperties}>
          {keys.map((key) => (
            <VenuePanel key={key} venueKey={key} venue={wedding.locations[key]} onOpen={showVenue} />
          ))}
        </div>
      </div>
      <div className="venue-scene__folio" aria-hidden="true">
        <span>TH</span><i /> <span>SM</span>
      </div>
      <VenueMapDialog
        venue={wedding.locations[selected]}
        venueKey={selected}
        open={open}
        onClose={close}
        returnFocus={opener}
      />
    </section>
  );
}
