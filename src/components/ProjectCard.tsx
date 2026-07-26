import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { projectTitle } from '../i18n'
import { useApp } from '../context/AppContext'
import { assetUrl } from '../hooks/usePortfolio'
import { useCoverTheme } from '../hooks/useCoverTheme'
import { useInView } from '../hooks/useInView'
import type { CardSize } from '../lib/cardLayout'
import type { Project } from '../types'
import { LazyImage } from './LazyImage'

const LIGHT_FOOTER_SLUGS = new Set([
  'restoran-barbara-2020',
  'russkoe-kartonnoe-2023',
])

/** Dark text, no footer gradient (light covers). */
const FLAT_FOOTER_SLUGS = new Set([
  'magazin-magazin-russkikh-brendov-mega-2018',
  'art-perm-2017',
])

/** Light text, no footer gradient (dark covers). */
const FLAT_FOOTER_LIGHT_SLUGS = new Set([
  'kluby-virtualnoi-realnosti-center-2017',
])

interface Props {
  project: Project
  size?: CardSize
  variant?: 'grid' | 'masonry'
  priority?: boolean
}

export function ProjectCard({
  project,
  size = 'normal',
  variant = 'grid',
  priority = false,
}: Props) {
  const { lang } = useApp()
  const title = projectTitle(project, lang)
  const video = project.videos?.[0]
  const hasVideo = Boolean(video?.src)
  const cover =
    project.cover ||
    project.images[0]?.thumb ||
    video?.poster ||
    null
  const coverWebp =
    project.coverWebp ||
    project.images[0]?.thumbWebp ||
    video?.posterWebp ||
    null

  const lightFooter = LIGHT_FOOTER_SLUGS.has(project.slug)
  const flatFooter = FLAT_FOOTER_SLUGS.has(project.slug)
  const flatFooterLight = FLAT_FOOTER_LIGHT_SLUGS.has(project.slug)
  const sampleSrc = assetUrl(cover || video?.poster)
  const theme = useCoverTheme(
    lightFooter || flatFooter || flatFooterLight ? null : sampleSrc,
  )
  const { ref: inViewRef, inView } = useInView<HTMLAnchorElement>({
    rootMargin: '200px 0px',
  })
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !hasVideo) return
    if (inView || priority) {
      el.muted = true
      const play = el.play()
      if (play) play.catch(() => {})
    } else {
      el.pause()
    }
  }, [inView, hasVideo, priority])

  return (
    <Link
      ref={inViewRef}
      to={`/project/${project.slug}`}
      className={[
        'project-card',
        `project-card--${variant}`,
        `project-card--${size}`,
        lightFooter ? 'project-card--light-footer' : '',
        flatFooter ? 'project-card--flat-footer' : '',
        flatFooterLight ? 'project-card--flat-footer-light' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        lightFooter || flatFooter || flatFooterLight
          ? undefined
          : ({
              '--card-text': theme.text,
              '--card-gradient': theme.gradient,
            } as CSSProperties)
      }
    >
      <div className="project-card__media">
        {hasVideo && (inView || priority) ? (
          <video
            ref={videoRef}
            className="project-card__video"
            src={assetUrl(video!.src)}
            poster={assetUrl(video!.poster || cover)}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label={title}
          />
        ) : cover ? (
          <LazyImage
            src={cover}
            webp={coverWebp}
            alt={title}
            priority={priority}
            sizes={
              size === 'wide'
                ? '(max-width: 720px) 100vw, (max-width: 1100px) 66vw, 40vw'
                : '(max-width: 720px) 100vw, (max-width: 1100px) 33vw, 20vw'
            }
          />
        ) : (
          <div className="project-card__placeholder" aria-hidden>
            <span>{title}</span>
          </div>
        )}
      </div>
      <div className="project-card__meta">
        <span className="project-card__title">{title}</span>
        {project.year ? (
          <span className="project-card__year">{project.year}</span>
        ) : null}
      </div>
    </Link>
  )
}
