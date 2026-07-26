import { useCallback, useRef, useState } from 'react'

interface Options {
  rootMargin?: string
  once?: boolean
}

/** Activates when the element nears the viewport — used for lazy media. */
export function useInView<T extends HTMLElement>({
  rootMargin = '300px 0px',
  once = true,
}: Options = {}) {
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const nodeRef = useRef<T | null>(null)
  const optionsRef = useRef({ rootMargin, once })
  optionsRef.current = { rootMargin, once }

  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    nodeRef.current = node
    if (!node || inView) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const { rootMargin: margin, once: observeOnce } = optionsRef.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setInView(true)
        if (observeOnce) io.disconnect()
      },
      { rootMargin: margin, threshold: 0 },
    )
    observerRef.current = io
    io.observe(node)
  }, [inView])

  return { ref, inView }
}
