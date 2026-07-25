import { useMemo } from 'react'
import { ProjectCard } from './ProjectCard'
import { getCardSizes } from '../lib/cardLayout'
import type { Project } from '../types'

interface Props {
  projects: Project[]
}

export function ProjectGrid({ projects }: Props) {
  const sizes = useMemo(() => getCardSizes(projects), [projects])

  return (
    <section className="project-grid" aria-live="polite">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          size={sizes[index] ?? 'normal'}
          priority={index < 4}
        />
      ))}
    </section>
  )
}
