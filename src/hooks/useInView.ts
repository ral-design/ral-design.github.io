import { useEffect, useRef, useState } from 'react'

interface Options {
  rootMargin?: string
  once?: boolean
}

/** Activates when the element nears the viewport — used for lazy media. */
export function useInView<T extends HTMLElement>({
  rootMargin = '300px 0px',
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || inView) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setInView(true)
        if (once) io.disconnect()
      },
      { rootMargin },
    )

    io.observe(node)
    return () => io.disconnect()
  }, [inView, once, rootMargin])

  return { ref, inView }
}
