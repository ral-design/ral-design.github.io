import { Link } from 'react-router-dom'
import { projectTitle } from '../i18n'
import { useApp } from '../context/AppContext'
import type { Project } from '../types'
import { LazyImage } from './LazyImage'

interface Props {
  project: Project
  variant?: 'grid' | 'masonry'
  priority?: boolean
}

export function ProjectCard({ project, variant = 'grid', priority = false }: Props) {
  const { lang } = useApp()
  const title = projectTitle(project, lang)
  const cover = project.cover || project.images[0]?.thumb || project.videos[0]?.poster
  const coverWebp =
    project.coverWebp || project.images[0]?.thumbWebp || project.videos[0]?.posterWebp

  return (
    <Link
      to={`/project/${project.slug}`}
      className={`project-card project-card--${variant}`}
    >
      <div className="project-card__media">
        {cover ? (
          <LazyImage
            src={cover}
            webp={coverWebp}
            alt={title}
            priority={priority}
            sizes="(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 20vw"
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
