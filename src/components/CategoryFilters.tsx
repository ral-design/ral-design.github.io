import { Link, useLocation } from 'react-router-dom'
import { categoryTitle } from '../i18n'
import { useApp } from '../context/AppContext'
import type { Category } from '../types'

interface Props {
  categories: Category[]
  total: number
  active: string
  onChange: (slug: string) => void
  onGallery: () => void
}

export function CategoryFilters({
  categories,
  total,
  active,
  onChange,
  onGallery,
}: Props) {
  const { lang, ui } = useApp()
  const { pathname } = useLocation()
  const visible = categories.filter((c) => c.count > 0)

  return (
    <nav className="category-filters" aria-label={ui.projects}>
      <Link
        to="/about"
        className={`filter-pill filter-pill--artist ${pathname === '/about' ? 'is-active' : ''}`}
      >
        {ui.artistPage}
      </Link>
      <button
        type="button"
        className="filter-pill filter-pill--gallery"
        onClick={onGallery}
      >
        {ui.gallery}
      </button>
      <button
        type="button"
        className={`filter-pill ${active === 'all' ? 'is-active' : ''}`}
        onClick={() => onChange('all')}
      >
        {ui.all} <span className="filter-pill__count">{total}</span>
      </button>
      {visible.map((cat) => (
        <button
          key={cat.slug}
          type="button"
          className={`filter-pill ${active === cat.slug ? 'is-active' : ''}`}
          onClick={() => onChange(cat.slug)}
        >
          {categoryTitle(cat, lang)}{' '}
          <span className="filter-pill__count">{cat.count}</span>
        </button>
      ))}
    </nav>
  )
}
