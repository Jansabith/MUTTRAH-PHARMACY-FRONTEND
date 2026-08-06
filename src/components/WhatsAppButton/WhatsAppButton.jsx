import { useState, useEffect } from 'react'
import useWhatsAppNumber from '../../hooks/useWhatsAppNumber'

export default function WhatsAppButton() {
  const [showBubble, setShowBubble] = useState(false)
  const whatsappNumber = useWhatsAppNumber()

  useEffect(() => {
    // Show the interactive pop-up message after 1.5 seconds
    const timer = setTimeout(() => {
      setShowBubble(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const whatsappMessage = 'Hello Muttrah Pharmacy, I would like to know more about your products and services.'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="fixed bottom-20 right-6 z-[60] flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      {/* Premium Glassmorphic Notification Bubble */}
      <div
        className={`glass-panel flex w-[280px] items-start gap-3 rounded-2xl p-4 shadow-xl transition-all duration-500 ease-out sm:w-[320px] ${
          showBubble
            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
            : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Pulsing online status indicator with placeholder avatar */}
        <div className="relative flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--line)] text-[var(--ink)]">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="absolute bottom-0 right-0 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-[var(--paper)]"></span>
          </span>
        </div>

        {/* Content Details */}
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-1.5">
            <span className="micro-copy !text-[10px] text-[var(--muted)] font-semibold">Live Chat Support</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--ink)] leading-snug">
            We are online and ready to help. Chat with us now!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setShowBubble(false)}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Start Chat
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowBubble(false)}
          className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors p-0.5"
          aria-label="Close notification"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Trigger Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Muttrah Pharmacy on WhatsApp"
        onClick={() => setShowBubble(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
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

