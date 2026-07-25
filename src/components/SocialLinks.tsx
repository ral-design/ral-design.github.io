const SOCIAL = [
  {
    name: 'Telegram',
    href: 'https://t.me/Shiva69om',
    className: 'social-icon--telegram',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M21.5 3.5 2.9 10.7c-1.3.5-1.3 1.2-.2 1.5l4.7 1.5 1.8 5.5c.2.7.4.9.9.9.5 0 .7-.2 1-.6l2.3-2.3 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.5-1.5Zm-3.1 3.7-8.8 7.7-.3 3.5-1.5-4.9 10.6-6.3Z"
        />
      </svg>
    ),
  },
  {
    name: 'VK',
    href: 'https://vk.ru/chikibriki88',
    className: 'social-icon--vk',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M12.78 18.25h1.55s.47-.05.71-.31c.22-.24.21-.69.21-.69s-.03-2.1.95-2.41c.96-.3 2.2 2.03 3.51 2.93.99.68 1.74.53 1.74.53l3.5-.05s1.83-.11.96-1.55c-.07-.12-.51-1.07-2.62-3.03-2.21-2.05-1.91-1.72.75-5.27 1.62-2.16 2.27-3.48 2.07-4.04-.19-.53-1.37-.39-1.37-.39h-3.93s-.29-.04-.51.1c-.21.13-.35.44-.35.44s-.62 1.65-1.45 3.05c-1.74 2.96-2.44 3.12-2.73 2.93-.66-.42-.5-1.7-.5-2.61 0-2.83.43-4.01-.83-4.32-.42-.1-.73-.17-1.81-.18-1.39-.02-2.56 0-3.22.32-.44.21-.78.69-.57.72.26.03.84.16 1.15.58.4.55.39 1.77.39 1.77s.23 3.39-.54 3.81c-.53.29-1.25-.3-2.81-2.99-.79-1.38-1.39-2.91-1.39-2.91s-.12-.28-.32-.43c-.25-.18-.6-.24-.6-.24H.79S.24 6.5.5 6.75c.37.37 1.74 2.04 3.67 4.36 2.54 3.06 5.04 5.14 8.61 5.14Z"
        />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/andriy_ra',
    className: 'social-icon--instagram',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        />
      </svg>
    ),
  },
] as const

export function SocialLinks() {
  return (
    <section className="social-bar" aria-label="Social">
      <ul className="social-bar__list">
        {SOCIAL.map((item) => (
          <li key={item.href}>
            <a
              className={`social-icon ${item.className}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              title={item.name}
            >
              {item.icon}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
