import { Link } from 'react-router-dom'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Home">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 360"
        width="40"
        height="120"
        role="img"
        aria-label="Logo"
      >
        <rect width="120" height="360" fill="#A12D1C" />
        <path
          fill="#D89137"
          fillRule="evenodd"
          d="M 10 22 L 78 10 L 108 22 L 36 98 L 102 168 L 96 348 L 10 348 Z M 32 252 H 72 V 348 H 32 Z"
        />
      </svg>
    </Link>
  )
}
