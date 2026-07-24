import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ContactButton } from '../components/ContactButton'
import { Header } from '../components/Header'
import { LazyImage } from '../components/LazyImage'
import { LazyVideo } from '../components/LazyVideo'
import {
  MediaLightbox,
  type LightboxItem,
} from '../components/MediaLightbox'
import { SearchOverlay } from '../components/SearchOverlay'
import { useApp } from '../context/AppContext'
import { usePortfolio } from '../hooks/usePortfolio'
import {
  projectCity,
  projectDescription,
  projectTitle,
} from '../i18n'

export function ProjectPage() {
  const { slug } = useParams()
  const { data, loading, error } = usePortfolio()
  const { lang, ui } = useApp()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const project = useMemo(
    () => data?.projects.find((p) => p.slug === slug),
    [data, slug],
  )

  const nextProject = useMemo(() => {
    if (!data || !project) return null
    const gallery = data.projects.filter((p) => p.hasGallery)
    const idx = gallery.findIndex((p) => p.slug === project.slug)
    if (idx === -1) {
      return gallery[0] || null
    }
    return gallery[(idx + 1) % gallery.length]
  }, [data, project])

  const lightboxItems = useMemo<LightboxItem[]>(() => {
    if (!project) return []
    const title = projectTitle(project, lang)
    const images = project.images.map((img, i) => ({
      type: 'image' as const,
      src: img.full,
      webp: img.fullWebp,
      alt: `${title} — ${i + 1}`,
    }))
    const videos = (project.videos ?? []).map((video, i) => ({
      type: 'video' as const,
      src: video.src,
      poster: video.poster,
      alt: `${title} — video ${i + 1}`,
    }))
    return [...images, ...videos]
  }, [project, lang])

  if (loading) {
    return (
      <div className="page-loading">
        <Header />
        <p>…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="page-loading">
        <Header />
        <p>{error || 'No data'}</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="page">
        <Header />
        <main className="project-detail">
          <p>{ui.noResults}</p>
          <Link to="/">{ui.projects}</Link>
        </main>
        <SearchOverlay data={data} />
      </div>
    )
  }

  const title = projectTitle(project, lang)
  const city = projectCity(project, lang)
  const description = projectDescription(project, lang)
  const videos = project.videos ?? []
  const hasMedia = project.images.length > 0 || videos.length > 0
  const imageCount = project.images.length

  return (
    <div className="page project-page">
      <Header />
      <main className="project-detail">
        <header className="project-detail__header">
          <p className="project-detail__eyebrow">
            {lang === 'ru' ? project.categoryRu : project.categoryEn}
            {project.year ? ` · ${project.year}` : ''}
          </p>
          <h1>{title}</h1>
          <p className="project-detail__lead">{description}</p>
          <dl className="project-detail__facts">
            {city ? (
              <div>
                <dt>{ui.city}</dt>
                <dd>{city}</dd>
              </div>
            ) : null}
            {project.year ? (
              <div>
                <dt>{ui.year}</dt>
                <dd>{project.year}</dd>
              </div>
            ) : null}
            {project.website ? (
              <div>
                <dt>{ui.website}</dt>
                <dd>
                  <a href={project.website} target="_blank" rel="noopener noreferrer">
                    {project.website.replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="project-detail__tags">
            <span className="project-detail__tags-label">{ui.materials}</span>
            <ul>
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </header>

        {hasMedia ? (
          <div className="project-gallery">
            {project.images.map((img, i) => (
              <button
                key={img.full}
                type="button"
                className="project-gallery__item project-gallery__trigger"
                onClick={() => setLightboxIndex(i)}
                aria-label={`${title} — ${i + 1}`}
              >
                <LazyImage
                  src={img.full}
                  webp={img.fullWebp}
                  alt={`${title} — ${i + 1}`}
                  priority={i === 0}
                  sizes="(max-width: 920px) 100vw, 920px"
                />
              </button>
            ))}
            {videos.map((video, i) => (
              <button
                key={video.src}
                type="button"
                className="project-gallery__item project-gallery__video project-gallery__trigger"
                onClick={() => setLightboxIndex(imageCount + i)}
                aria-label={`${title} — video ${i + 1}`}
              >
                <LazyVideo
                  src={video.src}
                  poster={video.poster}
                  posterWebp={video.posterWebp}
                  title={`${title} — video ${i + 1}`}
                  preview
                />
                <span className="project-gallery__play" aria-hidden>
                  ▶
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="project-gallery-empty">{ui.galleryEmpty}</p>
        )}

        {nextProject && nextProject.slug !== project.slug ? (
          <footer className="project-next">
            <span>{ui.next}</span>
            <Link to={`/project/${nextProject.slug}`}>
              {projectTitle(nextProject, lang)}
            </Link>
          </footer>
        ) : null}
      </main>

      {lightboxIndex != null ? (
        <MediaLightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      ) : null}

      <ContactButton />
      <SearchOverlay data={data} />
    </div>
  )
}
