import type { Project } from '../types'

/** Lower number = higher priority. Everything else sorts by year desc. */
const PRIORITY_SLUGS = new Map<string, number>([
  ['paintings', 1],
  ['russkoe-kartonnoe-2023', 2],
  ['torgovyi-tsentr-uspenskii-2020', 3],
  ['restoran-soika-2023', 4],
  ['restoran-brodvei-2020', 5],
  ['restoran-barbara-2020', 6],
  ['podezd-zhk-repina-2022', 7],
  ['restoran-brodskii-2020', 8],
  ['set-kafe-engels-2020', 9],
  ['ofis-logisticheskoi-kompanii-transportnye-traditsii-2023', 10],
  ['kafe-lo-vegano-2023', 11],
])

export function compareProjects(a: Project, b: Project): number {
  const pa = PRIORITY_SLUGS.get(a.slug) ?? Number.POSITIVE_INFINITY
  const pb = PRIORITY_SLUGS.get(b.slug) ?? Number.POSITIVE_INFINITY
  if (pa !== pb) return pa - pb

  const y = (b.year || 0) - (a.year || 0)
  if (y !== 0) return y
  return a.titleRu.localeCompare(b.titleRu, 'ru')
}

export function sortProjects<T extends Project>(projects: T[]): T[] {
  return [...projects].sort(compareProjects)
}
