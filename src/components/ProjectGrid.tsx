import { ProjectCard } from './ProjectCard'
import type { Project } from '../types'

interface Props {
  projects: Project[]
}

export function ProjectGrid({ projects }: Props) {
  return (
    <section className="project-grid" aria-live="polite">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          priority={index < 4}
        />
      ))}
    </section>
  )
}
