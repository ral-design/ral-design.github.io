import type { Project } from '../types'

export type CardSize = 'normal' | 'wide'

/** Projects that should span 2 columns (landscape / showcase covers). */
const WIDE_SLUGS = new Set([
  'kvartira-ekaterinburg-akadem-gorodok-2025',
  'restoran-armyanskii-restoran-2024',
  'pentkhaus-ekaterinburg-2024',
  'restoran-brodvei-2020',
  'restoran-brodskii-2020',
  'paintings',
  'restoran-borsh-2018',
  'torgovyi-tsentr-uspenskii-2020',
  'ofis-logisticheskoi-kompanii-transportnye-traditsii-2023',
  'set-kafe-engels-2020',
])

/**
 * Assign wide (2-col) vs normal (1-col) cards.
 * Only explicitly listed showcase projects are wide — not every video card.
 */
export function getCardSizes(projects: Project[]): CardSize[] {
  return projects.map((p) => (WIDE_SLUGS.has(p.slug) ? 'wide' : 'normal'))
}
