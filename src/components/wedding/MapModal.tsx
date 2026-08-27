import { useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import { Modal } from '../ui/Modal'

interface MapModalProps {
  open: boolean
  onClose: () => void
  title: string
  address: string
  mapUrl: string | null
  mapEmbedUrl: string | null
}

/** The map only receives an iframe source after the guest expressly opens it. */
export function MapModal({ open, onClose, title, address, mapUrl, mapEmbedUrl }: MapModalProps) {
  const [loaded, setLoaded] = useState(false)
  if (!mapEmbedUrl) return null

  const close = () => {
    setLoaded(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title={`bản đồ ${title}`} className="map-modal">
      <header className="map-modal__header">
        <MapPin aria-hidden="true" />
        <p className="eyebrow">Chỉ đường đến ngày vui</p>
        <h2>{title}</h2>
        {address && <address>{address}</address>}
      </header>
      <div className="map-modal__stage" aria-busy={!loaded}>
        {!loaded && <p className="map-modal__loading" role="status">Đang tải bản đồ…</p>}
        {open && <iframe src={mapEmbedUrl} title={`Bản đồ ${title}`} loading="lazy" referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} />}
      </div>
      {mapUrl && <a className="button button--outline map-modal__external" href={mapUrl} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> Mở Google Maps</a>}
    </Modal>
  )
}
