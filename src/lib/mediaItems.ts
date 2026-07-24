import { projectTitle } from '../i18n'
import type { Lang, Project } from '../types'
import type { LightboxItem } from '../components/MediaLightbox'

export function buildAllMediaItems(
  projects: Project[],
  lang: Lang,
): LightboxItem[] {
  const items: LightboxItem[] = []

  for (const project of projects) {
    const title = projectTitle(project, lang)
    project.images.forEach((img, i) => {
      items.push({
        type: 'image',
        src: img.full,
        webp: img.fullWebp,
        alt: `${title} — ${i + 1}`,
      })
    })
    ;(project.videos ?? []).forEach((video, i) => {
      items.push({
        type: 'video',
        src: video.src,
        poster: video.poster,
        alt: `${title} — video ${i + 1}`,
      })
    })
  }

  return items
}
