import { useEffect, useState } from 'react'
import type { PortfolioData } from '../types'

let cache: PortfolioData | null = null

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cache) return
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/projects.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load projects: ${r.status}`)
        return r.json()
      })
      .then((json: PortfolioData) => {
        cache = json
        if (!cancelled) setData(json)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error, loading: !data && !error }
}

export function assetUrl(rel: string | null | undefined) {
  if (!rel) return ''
  if (rel.startsWith('http')) return rel
  return `${import.meta.env.BASE_URL}${rel.replace(/^\//, '')}`
}
