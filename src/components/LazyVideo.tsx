import { useEffect, useRef } from 'react'
import { assetUrl } from '../hooks/usePortfolio'
import { useInView } from '../hooks/useInView'

interface Props {
  src: string
  poster?: string | null
  posterWebp?: string | null
  title?: string
  className?: string
  /** Poster-only preview (no player) — for gallery tiles */
  preview?: boolean
}

export function LazyVideo({
  src,
  poster,
  posterWebp,
  title,
  className = '',
  preview = false,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: '250px 0px',
  })
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const posterJpg = poster ? assetUrl(poster) : ''
  const posterWebpUrl = posterWebp ? assetUrl(posterWebp) : ''

  useEffect(() => {
    if (preview) return
    const video = videoRef.current
    if (!video || !inView) return
    if (video.preload !== 'metadata') {
      video.preload = 'metadata'
      video.load()
    }
  }, [inView, preview])

  const posterNode =
    posterJpg || posterWebpUrl ? (
      <picture>
        {posterWebpUrl ? (
          <source srcSet={posterWebpUrl} type="image/webp" />
        ) : null}
        <img src={posterJpg} alt={title || ''} loading="lazy" decoding="async" />
      </picture>
    ) : (
      <div className="lazy-video__skeleton" aria-hidden />
    )

  if (preview) {
    return (
      <div ref={ref} className={`lazy-video lazy-video--preview ${className}`}>
        {inView ? posterNode : <div className="lazy-video__skeleton" aria-hidden />}
      </div>
    )
  }

  return (
    <div ref={ref} className={`lazy-video ${className}`}>
      {inView ? (
        <video
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={posterJpg || undefined}
          title={title}
        >
          <source src={assetUrl(src)} type="video/mp4" />
        </video>
      ) : (
        posterNode
      )}
    </div>
  )
}
