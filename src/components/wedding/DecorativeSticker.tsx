import { useWeddingConfig } from '../../config/WeddingConfigContext'
import type { DecorativeSticker as DecorativeStickerConfig } from '../../types/wedding'

interface DecorativeStickerProps {
  placement: DecorativeStickerConfig['placement']
  className?: string
  eager?: boolean
}

/** Optional, config-driven visual embellishment. It is deliberately hidden from assistive tech. */
export function DecorativeSticker({ placement, className = '', eager = false }: DecorativeStickerProps) {
  const config = useWeddingConfig()
  const sticker = config.decorativeStickers?.find((item) => item.placement === placement)
  if (!sticker) return null

  return (
    <img
      className={`decorative-sticker ${className}`}
      src={sticker.src}
      alt=""
      aria-hidden="true"
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'low' : undefined}
    />
  )
}
