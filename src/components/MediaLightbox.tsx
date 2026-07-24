import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from 'react'
import { assetUrl } from '../hooks/usePortfolio'
import { useApp } from '../context/AppContext'

export type LightboxItem =
  | {
      type: 'image'
      src: string
      webp?: string | null
      alt: string
    }
  | {
      type: 'video'
      src: string
      poster?: string | null
      alt: string
    }

interface Props {
  items: LightboxItem[]
  index: number
  onClose: () => void
  onChange: (index: number) => void
}

export function MediaLightbox({ items, index, onClose, onChange }: Props) {
  const { ui } = useApp()
  const touchX = useRef<number | null>(null)
  const [dragHint, setDragHint] = useState(0)
  const item = items[index]
  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onChange(index - 1)
  }, [hasPrev, index, onChange])

  const goNext = useCallback(() => {
    if (hasNext) onChange(index + 1)
  }, [hasNext, index, onChange])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, onClose])

  if (!item) return null

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.changedTouches[0]?.clientX ?? null
    setDragHint(0)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (touchX.current == null) return
    const x = e.changedTouches[0]?.clientX ?? touchX.current
    setDragHint(x - touchX.current)
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current == null) return
    const x = e.changedTouches[0]?.clientX ?? touchX.current
    const delta = x - touchX.current
    touchX.current = null
    setDragHint(0)
    if (delta > 60) goPrev()
    else if (delta < -60) goNext()
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox__back"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label={ui.close}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 5L8 12L15 19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="lightbox__counter">
        {index + 1} / {items.length}
      </div>

      {hasPrev ? (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          aria-label="Previous"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 5L8 12L15 19"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      {hasNext ? (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          aria-label="Next"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 5L16 12L9 19"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      <div
        className="lightbox__stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: dragHint ? `translateX(${dragHint * 0.2}px)` : undefined }}
      >
        {item.type === 'image' ? (
          <picture>
            {item.webp ? (
              <source srcSet={assetUrl(item.webp)} type="image/webp" />
            ) : null}
            <img src={assetUrl(item.src)} alt={item.alt} />
          </picture>
        ) : (
          <video
            key={item.src}
            src={assetUrl(item.src)}
            poster={item.poster ? assetUrl(item.poster) : undefined}
            controls
            playsInline
            autoPlay
          />
        )}
      </div>
    </div>
  )
}
