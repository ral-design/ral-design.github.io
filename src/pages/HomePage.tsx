import { useMemo, useState } from 'react'
import { CategoryFilters } from '../components/CategoryFilters'
import { ContactButton } from '../components/ContactButton'
import { Header } from '../components/Header'
import { MediaLightbox } from '../components/MediaLightbox'
import { ProjectGrid } from '../components/ProjectGrid'
import { SearchOverlay } from '../components/SearchOverlay'
import { SocialLinks } from '../components/SocialLinks'
import { useApp } from '../context/AppContext'
import { usePortfolio } from '../hooks/usePortfolio'
import { buildAllMediaItems } from '../lib/mediaItems'
import { sortProjects } from '../lib/projectSort'

export function HomePage() {
  const { data, error, loading } = usePortfolio()
  const { lang } = useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const galleryProjects = useMemo(
    () =>
      sortProjects(
        (data?.projects ?? []).filter(
          (p) =>
            p.hasGallery ||
            (p.images?.length ?? 0) > 0 ||
            (p.videos?.length ?? 0) > 0,
        ),
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

      <SocialLinks />

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
