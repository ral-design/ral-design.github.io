const BASE = import.meta.env.BASE_URL

const FIGURES = [
  'figures/figure-01.png',
  'figures/figure-02.png',
  'figures/figure-03.png',
  'figures/figure-04.png',
] as const

/** Decorative cardboard totems — fixed bottom-left on every page. */
export function CornerFigures() {
  return (
    <div className="corner-figures" aria-hidden>
      {FIGURES.map((src) => (
        <img
          key={src}
          className="corner-figures__item"
          src={`${BASE}${src}`}
          alt=""
          decoding="async"
          loading="lazy"
          draggable={false}
        />
      ))}
    </div>
  )
}
