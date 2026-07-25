import { Link } from 'react-router-dom'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Home">
      <img
        className="logo__img"
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="Логотип"
        width={56}
        height={56}
      />
    </Link>
  )
}
