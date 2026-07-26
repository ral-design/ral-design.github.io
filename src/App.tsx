import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { CornerFigures } from './components/CornerFigures'
import { ScrollToTop } from './components/ScrollToTop'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { ProjectPage } from './pages/ProjectPage'

/** Empty string for site root (`base: '/'`); never pass bare `"/"`. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={basename || undefined}>
        <div className="app-shell">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/project/:slug" element={<ProjectPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CornerFigures />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
