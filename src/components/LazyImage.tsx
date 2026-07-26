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

/** Convention: foo.jpg → foo.blur.webp (tiny LQIP next to the image). */
function blurPathFor(displayPath: string) {
  return displayPath.replace(/\.(jpe?g|png|webp)$/i, '.blur.webp')
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
    rootMargin: priority ? '0px' : '200px 0px',
  })
  const [loaded, setLoaded] = useState(false)
  const [blurOk, setBlurOk] = useState(true)
  const active = priority || inView

  const displayJpg = thumb || src
  const displayWebp = thumbWebp || webp
  const fullJpg = toUrl(displayJpg)
  const fullWebp = toUrl(displayWebp)
  const blurUrl = toUrl(blurPathFor(displayJpg))

  return (
    <div
      ref={ref}
      className={`lazy-image ${loaded ? 'is-loaded' : ''} ${className}`}
    >
      {/* In-flow sizer until the real image gives height (absolute blur alone is 0×0). */}
      {!loaded ? <div className="lazy-image__sizer" aria-hidden /> : null}
      {blurUrl && blurOk ? (
        <img
          className="lazy-image__blur"
          src={blurUrl}
          alt=""
          aria-hidden
          decoding="async"
          loading="eager"
          onError={() => setBlurOk(false)}
        />
      ) : (
        <div className="lazy-image__skeleton" aria-hidden />
      )}
      {active ? (
        <picture>
          {fullWebp ? <source srcSet={fullWebp} type="image/webp" /> : null}
          <img
            className="lazy-image__main"
            src={fullJpg}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            sizes={sizes}
            onLoad={() => setLoaded(true)}
            ref={(el) => {
              // Cached images can be complete before onLoad is attached.
              if (el?.complete && el.naturalWidth > 0) setLoaded(true)
            }}
          />
        </picture>
      ) : null}
    </div>
  )
}
