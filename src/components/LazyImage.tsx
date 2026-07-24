import { useState } from 'react'
import { assetUrl } from '../hooks/usePortfolio'
import { useInView } from '../hooks/useInView'

interface Sources {
  /** JPEG/PNG fallback path (relative to public/) */
  src: string
  /** Optional WebP path */
  webp?: string | null
  /** Optional smaller JPEG for grid thumbs */
  thumb?: string | null
  thumbWebp?: string | null
}

interface Props extends Sources {
  alt: string
  className?: string
  /** Eager only for above-the-fold LCP candidates */
  priority?: boolean
  sizes?: string
}

function toUrl(path?: string | null) {
  return path ? assetUrl(path) : ''
}

export function LazyImage({
  src,
  webp,
  thumb,
  thumbWebp,
  alt,
  className = '',
  priority = false,
  sizes,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: priority ? '0px' : '400px 0px',
  })
  const [loaded, setLoaded] = useState(false)
  const active = priority || inView

  const displayJpg = thumb || src
  const displayWebp = thumbWebp || webp
  const fullJpg = toUrl(displayJpg)
  const fullWebp = toUrl(displayWebp)

  return (
    <div
      ref={ref}
      className={`lazy-image ${loaded ? 'is-loaded' : ''} ${className}`}
    >
      {active ? (
        <picture>
          {fullWebp ? <source srcSet={fullWebp} type="image/webp" /> : null}
          <img
            src={fullJpg}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'low'}
            sizes={sizes}
            onLoad={() => setLoaded(true)}
          />
        </picture>
      ) : (
        <div className="lazy-image__skeleton" aria-hidden />
      )}
    </div>
  )
}
