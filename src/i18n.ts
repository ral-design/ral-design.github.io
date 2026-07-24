import type { Lang, Project } from './types'

export const UI = {
  ru: {
    langSwitch: 'EN',
    search: 'Поиск',
    bySections: 'По разделам',
    close: 'Закрыть',
    all: 'Все',
    contact: 'Связаться',
    about: 'Обо мне',
    education: 'Образование',
    career: 'Карьера',
    social: 'Соцсети',
    downloadResume: 'Скачать резюме',
    gallery: 'Галерея',
    projects: 'Проекты',
    year: 'Год',
    city: 'Город',
    materials: 'Материалы и темы',
    next: 'Далее',
    website: 'Сайт',
    noResults: 'Ничего не найдено',
    searchHint: 'Теги из проектов и резюме',
    galleryEmpty: 'Фотографии скоро появятся',
  },
  en: {
    langSwitch: 'RU',
    search: 'Search',
    bySections: 'By sections',
    close: 'Close',
    all: 'All',
    contact: 'Contact',
    about: 'About',
    education: 'Education',
    career: 'Career',
    social: 'Social',
    downloadResume: 'Download resume',
    gallery: 'Gallery',
    projects: 'Projects',
    year: 'Year',
    city: 'City',
    materials: 'Materials & topics',
    next: 'Next',
    website: 'Website',
    noResults: 'No results',
    searchHint: 'Tags from projects and resume',
    galleryEmpty: 'Photos coming soon',
  },
} as const

export function t(lang: Lang) {
  return UI[lang]
}

export function projectTitle(project: Project, lang: Lang) {
  return lang === 'ru' ? project.titleRu : project.titleEn
}

export function projectCity(project: Project, lang: Lang) {
  return lang === 'ru' ? project.cityRu : project.cityEn
}

export function projectDescription(project: Project, lang: Lang) {
  return lang === 'ru' ? project.descriptionRu : project.descriptionEn
}

export function categoryTitle(
  category: { titleRu: string; titleEn: string },
  lang: Lang,
) {
  return lang === 'ru' ? category.titleRu : category.titleEn
}
