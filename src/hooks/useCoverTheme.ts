import { useEffect, useState } from 'react'

export interface CoverTheme {
  text: string
  gradient: string
}

const DEFAULT_THEME: CoverTheme = {
  text: '#ffffff',
  gradient: 'rgb(20, 20, 20)',
}

function sampleTheme(img: HTMLImageElement): CoverTheme {
  const canvas = document.createElement('canvas')
  const size = 48
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return DEFAULT_THEME

  ctx.drawImage(img, 0, 0, size, size)

  // Bottom band — matches title/gradient area
  const y0 = Math.floor(size * 0.55)
  const h = size - y0
  const { data } = ctx.getImageData(0, y0, size, h)

  let r = 0
  let g = 0
  let b = 0
  let n = 0
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    n += 1
  }
  if (!n) return DEFAULT_THEME

  r = Math.round(r / n)
  g = Math.round(g / n)
  b = Math.round(b / n)

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  const text = luminance > 165 ? '#1a1a1a' : '#ffffff'

  // Slightly deepen for a solid footer like the reference
  const deepen = (c: number) => Math.max(0, Math.round(c * 0.82))
  const gradient = `rgb(${deepen(r)}, ${deepen(g)}, ${deepen(b)})`

  return { text, gradient }
}

/** Derives title/gradient colors from a cover image URL. */
export function useCoverTheme(src: string | null | undefined) {
  const [theme, setTheme] = useState<CoverTheme>(DEFAULT_THEME)

  useEffect(() => {
    if (!src) {
      setTheme(DEFAULT_THEME)
      return
    }

    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (cancelled) return
      try {
        setTheme(sampleTheme(img))
      } catch {
        setTheme(DEFAULT_THEME)
      }
    }
    img.onerror = () => {
      if (!cancelled) setTheme(DEFAULT_THEME)
    }
    img.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  return theme
}
