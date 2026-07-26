import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset window scroll on client-side route changes (SPA has no native reload). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
