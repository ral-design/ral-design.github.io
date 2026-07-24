import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ProjectCard } from './ProjectCard'
import { useApp } from '../context/AppContext'
import {
  projectCity,
  projectDescription,
  projectTitle,
} from '../i18n'
import type { PortfolioData, Project } from '../types'

type Mode = 'tags' | 'results'

interface Props {
  data: PortfolioData
}

function matchesQuery(project: Project, query: string, lang: 'ru' | 'en') {
  const q = query.trim().toLowerCase()
  if (!q) return false
  const hay = [
    projectTitle(project, lang),
    projectCity(project, lang),
    projectDescription(project, lang),
    project.categoryRu,
    project.categoryEn,
    String(project.year ?? ''),
    ...project.tags,
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

export function SearchOverlay({ data }: Props) {
  const { lang, ui, searchOpen, setSearchOpen } = useApp()
  const [mode, setMode] = useState<Mode>('tags')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()

  useEffect(() => {
    if (!searchOpen) return
    setMode('tags')
    setQuery('')
    const id = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [searchOpen])

  useEffect(() => {
    setSearchOpen(false)
  }, [location.pathname, setSearchOpen])

  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, setSearchOpen])

  const results = useMemo(() => {
    if (!query.trim()) return []
    return data.projects.filter((p) => matchesQuery(p, query, lang))
  }, [data.projects, query, lang])

  if (!searchOpen) return null

  const runTag = (tag: string) => {
    setQuery(tag)
    setMode('results')
  }

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={ui.search}>
      <div className="search-overlay__top">
        <div className="search-mode-toggle" role="group" aria-label="Search mode">
          <button
            type="button"
            className={mode === 'results' ? 'is-active' : ''}
            onClick={() => setMode('results')}
          >
            {ui.search}
          </button>
          <button
            type="button"
            className={mode === 'tags' ? 'is-active' : ''}
            onClick={() => setMode('tags')}
          >
            {ui.bySections}
          </button>
        </div>
        <button
          type="button"
          className="search-close"
          onClick={() => setSearchOpen(false)}
          aria-label={ui.close}
        >
          ×
        </button>
      </div>

      <div className="search-overlay__heading">
        {mode === 'results' && query.trim() ? (
          <h2>{query}</h2>
        ) : (
          <label className="search-input-wrap">
            <span className="visually-hidden">{ui.search}</span>
            <input
              ref={inputRef}
              className="search-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (e.target.value.trim()) setMode('results')
              }}
              onFocus={() => {
                if (query.trim()) setMode('results')
              }}
              placeholder={ui.search}
            />
          </label>
        )}
        <div className="search-rule" />
      </div>

      {mode === 'tags' ? (
        <div className="search-tags">
          <p className="search-hint">{ui.searchHint}</p>
          <div className="search-tags__cloud">
            {data.tags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                className="search-tag"
                onClick={() => runTag(tag.name)}
              >
                {tag.name}
                <span>{tag.count}</span>
              </button>
            ))}
            {data.categories
              .filter((c) => c.count > 0)
              .map((cat) => (
                <button
                  key={`cat-${cat.slug}`}
                  type="button"
                  className="search-tag"
                  onClick={() => runTag(lang === 'ru' ? cat.titleRu : cat.titleEn)}
                >
                  {lang === 'ru' ? cat.titleRu : cat.titleEn}
                  <span>{cat.count}</span>
                </button>
              ))}
          </div>
        </div>
      ) : (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="search-empty">{ui.noResults}</p>
          ) : (
            <div className="search-masonry">
              {results.map((project) => (
                <div key={project.slug} className="search-result-item">
                  <ProjectCard project={project} variant="masonry" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
