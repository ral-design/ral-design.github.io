import { useMemo, useState } from 'react'
import { CategoryFilters } from '../components/CategoryFilters'
import { ContactButton } from '../components/ContactButton'
import { Header } from '../components/Header'
import { MediaLightbox } from '../components/MediaLightbox'
import { ProjectGrid } from '../components/ProjectGrid'
import { SearchOverlay } from '../components/SearchOverlay'
import { useApp } from '../context/AppContext'
import { usePortfolio } from '../hooks/usePortfolio'
import { buildAllMediaItems } from '../lib/mediaItems'

const SOCIAL = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/andriy_ra',
    label: '@andriy_ra',
  },
]

const RESUME_HREF = `${import.meta.env.BASE_URL}files/resume.pdf`

const ABOUT = {
  ru: 'Художник-декоратор с художественным образованием и опытом работы с 2015 года. Специализируюсь на нанесении декоративной штукатурки (венецианская, травертин, микроцемент, тонкослойные и фактурные покрытия) и художественной росписи. Работаю с объектами различного масштаба: рестораны и кафе, коммерческие пространства, коттеджи, квартиры, входные группы и подъезды. С 2020 года активно работаю с жилыми и частными интерьерами — от отдельных зон до отделки «под ключ». Реализованы проекты в Екатеринбурге, Перми, Сочи, а также в Дубае.',
  en: 'Decorative artist with a fine-arts education and professional experience since 2015. I specialize in decorative plaster (Venetian, travertine, microcement, thin-layer and textured finishes) and mural painting. I work across scales: restaurants and cafés, commercial spaces, cottages, apartments, entrances and residential lobbies. Since 2020 I have been actively working on residential and private interiors — from individual zones to turnkey finishes. Projects completed in Yekaterinburg, Perm, Sochi, and Dubai.',
}

export function HomePage() {
  const { data, error, loading } = usePortfolio()
  const { lang, ui } = useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const galleryProjects = useMemo(
    () =>
      (data?.projects ?? []).filter(
        (p) => p.hasGallery || (p.images?.length ?? 0) > 0 || (p.videos?.length ?? 0) > 0,
      ),
    [data],
  )

  const allMediaItems = useMemo(
    () => buildAllMediaItems(galleryProjects, lang),
    [galleryProjects, lang],
  )

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return galleryProjects
    return galleryProjects.filter((p) => p.category === activeCategory)
  }, [galleryProjects, activeCategory])

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

  const resumeRole = lang === 'ru' ? data.resume.roleRu : data.resume.roleEn
  const resumeAbout = ABOUT[lang]

  return (
    <div className="page home-page">
      <Header />
      <CategoryFilters
        categories={data.categories}
        total={galleryProjects.length}
        active={activeCategory}
        onChange={setActiveCategory}
        onGallery={() => {
          if (allMediaItems.length === 0) return
          setGalleryIndex(0)
          setGalleryOpen(true)
        }}
      />

      <ProjectGrid projects={filtered} />

      <section className="about-strip" id="about">
        <p className="about-strip__role">{resumeRole}</p>
        <p className="about-strip__text">{resumeAbout}</p>
        <div className="about-strip__actions">
          <a
            className="resume-download"
            href={RESUME_HREF}
            download="Rezyume_Hudozhnik-dekorator.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ui.downloadResume}
          </a>
          <div className="about-strip__social-block">
            <h3>{ui.social}</h3>
            <ul className="about-strip__social">
              {SOCIAL.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <span className="about-strip__social-name">{item.name}</span>
                    <span className="about-strip__social-handle">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {galleryOpen && allMediaItems.length > 0 ? (
        <MediaLightbox
          items={allMediaItems}
          index={galleryIndex}
          onClose={() => setGalleryOpen(false)}
          onChange={setGalleryIndex}
        />
      ) : null}

      <ContactButton />
      <SearchOverlay data={data} />
    </div>
  )
}
