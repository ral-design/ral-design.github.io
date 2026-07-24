export type Lang = 'ru' | 'en'

export interface ProjectImage {
  full: string
  fullWebp?: string | null
  thumb: string
  thumbWebp?: string | null
  width?: number
  height?: number
}

export interface ProjectVideo {
  src: string
  poster: string | null
  posterWebp?: string | null
  width?: number
  height?: number
}

export interface Project {
  slug: string
  category: string
  categoryRu: string
  categoryEn: string
  year: number | null
  titleRu: string
  titleEn: string
  cityRu: string
  cityEn: string
  website: string | null
  tags: string[]
  descriptionRu: string
  descriptionEn: string
  cover: string | null
  coverWebp?: string | null
  images: ProjectImage[]
  videos: ProjectVideo[]
  hasGallery: boolean
  virtual: boolean
}

export interface Category {
  slug: string
  titleRu: string
  titleEn: string
  count: number
}

export interface SearchTag {
  name: string
  count: number
}

export interface Resume {
  aboutRu: string
  aboutEn: string
  roleRu: string
  roleEn: string
  education: { ru: string; en: string }[]
  career: { years: string; ru: string; en: string }[]
}

export interface PortfolioData {
  generatedAt: string
  resume: Resume
  categories: Category[]
  tags: SearchTag[]
  projects: Project[]
}
