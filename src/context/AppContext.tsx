import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang } from '../types'
import { t } from '../i18n'

interface AppContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  ui: ReturnType<typeof t>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang')
    return saved === 'en' ? 'en' : 'ru'
  })
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    document.body.style.overflow = searchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [searchOpen])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((prev) => (prev === 'ru' ? 'en' : 'ru')),
      searchOpen,
      setSearchOpen,
      ui: t(lang),
    }),
    [lang, searchOpen],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
