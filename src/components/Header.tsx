import { Logo } from './Logo'
import { useApp } from '../context/AppContext'

export function Header() {
  const { ui, toggleLang, setSearchOpen } = useApp()

  return (
    <header className="site-header">
      <div className="header-left">
        <button type="button" className="header-lang" onClick={toggleLang}>
          {ui.langSwitch}
        </button>
      </div>

      <Logo />

      <div className="header-actions">
        <button
          type="button"
          className="header-search"
          onClick={() => setSearchOpen(true)}
          aria-label={ui.search}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M16.5 16.5L21 21"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
