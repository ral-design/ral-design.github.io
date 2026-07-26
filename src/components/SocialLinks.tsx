const BASE = import.meta.env.BASE_URL

const SOCIAL = [
  {
    name: 'Telegram',
    href: 'https://t.me/Shiva69om',
    className: 'social-icon--telegram',
    src: `${BASE}social-telegram.png`,
  },
  {
    name: 'VK',
    href: 'https://vk.ru/chikibriki88',
    className: 'social-icon--vk',
    src: `${BASE}social-vk.png`,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/andriy_ra',
    className: 'social-icon--instagram',
    src: `${BASE}social-instagram.png`,
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
              <img
                src={item.src}
                alt=""
                width={48}
                height={48}
                decoding="async"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
