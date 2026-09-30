import useWhatsAppNumber from '../../hooks/useWhatsAppNumber'
import { trackEvent } from '../../services/analytics'

export default function WhatsAppButton() {
  const whatsappNumber = useWhatsAppNumber()

  const whatsappMessage = 'Hello Muttrah Pharmacy, I would like to know more about your products and services.'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 sm:bottom-8 sm:right-8 pointer-events-none">
      {/* Main Trigger Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Muttrah Pharmacy on WhatsApp"
        onClick={() => trackEvent('whatsapp_click', { location: 'floating_button' })}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-emerald-500/20 pointer-events-auto"
      >
        {/* Pulsing outer ring */}
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-[var(--paper)]"></span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="h-7 w-7 transition-transform group-hover:rotate-12"
          fill="currentColor"
        >
          <path d="M16.04 4.01A11.86 11.86 0 0 0 5.92 22.05L4 29.03l7.15-1.88A11.86 11.86 0 1 0 16.04 4.01Zm0 21.67c-1.87 0-3.67-.53-5.22-1.52l-.37-.23-4.24 1.11 1.13-4.13-.24-.39a9.8 9.8 0 1 1 8.94 5.16Zm5.56-7.34c-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.68.15-.2.3-.78.99-.95 1.19-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.89-.8-1.5-1.79-1.67-2.09-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.64-.93-2.25-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.8-.74 2.05-1.45.25-.71.25-1.32.18-1.45-.08-.13-.28-.2-.58-.35Z" />
        </svg>
      </a>
    </div>
  )
}
