import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react'
import { useWeddingConfig } from '../../config/WeddingConfigContext'

interface WeddingImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'src'> {
  src: string
  aspectRatio: string
  objectPosition?: string
  eager?: boolean
  wrapperClassName?: string
}

function dimensionsFromRatio(ratio: string): { width: number; height: number } {
  const [rawWidth, rawHeight] = ratio.split('/').map(Number)
  if (!rawWidth || !rawHeight) return { width: 1200, height: 1500 }
  return { width: Math.round(rawWidth * 200), height: Math.round(rawHeight * 200) }
}

export function WeddingImage({
  id: imageId,
  src,
  alt,
  aspectRatio,
  objectPosition = '50% 50%',
  eager = false,
  wrapperClassName = '',
  className = '',
  ...props
}: WeddingImageProps) {
  const config = useWeddingConfig()
  const [failed, setFailed] = useState(false)
  const dimensions = dimensionsFromRatio(aspectRatio)
  const style = { '--image-ratio': aspectRatio, '--image-position': objectPosition } as CSSProperties

  return (
    <span className={`wedding-image ${wrapperClassName}`} style={style}>
      {!failed ? (
        <img
          {...props}
          data-image-id={imageId}
          className={className}
          src={src}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding={eager ? 'sync' : 'async'}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="wedding-image__fallback" role="img" aria-label={alt}>
          <span>{config.couple.monogram}</span>
          <small>Ảnh sẽ được cập nhật</small>
        </span>
      )}
    </span>
  )
}
