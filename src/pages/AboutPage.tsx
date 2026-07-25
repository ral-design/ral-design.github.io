import { ContactButton } from '../components/ContactButton'
import { Header } from '../components/Header'
import { SearchOverlay } from '../components/SearchOverlay'
import { SocialLinks } from '../components/SocialLinks'
import { ABOUT, RESUME_HREF } from '../content/about'
import { useApp } from '../context/AppContext'
import { usePortfolio } from '../hooks/usePortfolio'

export function AboutPage() {
  const { data, error, loading } = usePortfolio()
  const { lang, ui } = useApp()

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
    <div className="page about-page">
      <Header />
      <main className="about-page__main">
        <h1 className="about-strip__role">
          {lang === 'ru' ? ABOUT.roleRu : ABOUT.roleEn}
        </h1>
        <p className="about-strip__name">
          {lang === 'ru' ? ABOUT.nameRu : ABOUT.nameEn}
        </p>
        <p className="about-strip__text about-page__text">
          {lang === 'ru' ? ABOUT.textRu : ABOUT.textEn}
        </p>
        <a
          className="resume-download"
          href={RESUME_HREF}
          download="Rezyume_Hudozhnik-dekorator.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          {ui.downloadResume}
        </a>
      </main>
      <SocialLinks />
      <ContactButton />
      <SearchOverlay data={data} />
    </div>
  )
}
