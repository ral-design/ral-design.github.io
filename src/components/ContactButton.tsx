import { useApp } from '../context/AppContext'

const TELEGRAM = 'https://t.me/Shiva69om'

export function ContactButton() {
  const { ui } = useApp()

  return (
    <a
      className="contact-fab"
      href={TELEGRAM}
      target="_blank"
      rel="noopener noreferrer"
    >
      {ui.contact}
    </a>
  )
}
