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
        <span className="venue-panel__side">{venue.label}</span>
        <span className="venue-panel__seal" aria-hidden="true">囍</span>
        <strong>{venue.name}</strong>
        <span className="venue-panel__rule" aria-hidden="true" />
        <span className="venue-panel__date">{venue.date}</span>
        <span className="venue-panel__time">{venue.time}</span>
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
              <span>Giờ</span><strong>{venue.time}</strong>
            </div>
            <p id="venue-dialog-address" className="venue-dialog__address">{venue.address}</p>
            <div className="venue-dialog__actions">
              <a className="lacquer-button" href={venue.mapUrl} target="_blank" rel="noreferrer">
                Chỉ đường <ArrowIcon direction="external" />
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

export function Venues({ side }: { side: WeddingSide }) {
  const keys: VenueKey[] = side === 'both' ? ['groom', 'bride'] : [side];
  const [selected, setSelected] = useState<VenueKey>('groom');
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
      <div className="venue-scene__intro">
        <p className="scene-kicker">LỄ CƯỚI · 19.10.2026</p>
        <h2 id="venues-title"><span>Hai gia đình,</span><br />một ngày chung vui.</h2>
        <p>Chạm vào thiệp để xem thời gian, địa chỉ và bản đồ chỉ đường.</p>
      </div>
      <div className="venue-stage" style={{ '--venue-count': keys.length } as CSSProperties}>
        {keys.map((key) => (
          <VenuePanel key={key} venueKey={key} venue={wedding.locations[key]} onOpen={showVenue} />
        ))}
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
