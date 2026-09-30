import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../services/analytics'

function ShareIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
}

export default function ShareButton({ product, variant = 'full', className = '' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapperRef = useRef(null)

  const url = `${window.location.origin}/products/${product.slug}`
  const text = `Check out ${product.name} at Muttrah Pharmacy`

  useEffect(() => {
    if (!open) return undefined

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false)
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  // GA4's recommended "share" event
  function trackShare(method) {
    trackEvent('share', { method, content_type: 'product', item_id: product.slug })
  }

  async function handleShare() {
    // Use the phone's native share sheet when available
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url })
        trackShare('native')
      } catch {
        // User cancelled the share sheet
      }
      return
    }
    setOpen((current) => !current)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link:', url)
    }
    trackShare('copy_link')
    setCopied(true)
    window.setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, 1500)
  }

  const shareLinks = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
    },
  ]

  const buttonClass =
    variant === 'icon'
      ? 'inline-flex h-full min-h-11 w-12 items-center justify-center rounded-full border border-[#ded8cc] text-stone-700 transition hover:border-stone-950 hover:bg-stone-950 hover:text-[#fffdf8]'
      : 'inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-950 bg-transparent px-5 py-2.5 !text-xs !font-bold uppercase text-stone-950 transition hover:bg-stone-950 hover:text-[#fffdf8] sm:w-auto'

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleShare}
        className={buttonClass}
        aria-label={`Share ${product.name}`}
        aria-expanded={open}
      >
        <ShareIcon />
        {variant === 'full' ? 'Share' : null}
      </button>

      {open ? (
        <div className="absolute bottom-full right-0 z-30 mb-2 w-48 overflow-hidden rounded-2xl border border-[#ded8cc] bg-[#fffdf8] py-1 shadow-xl">
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackShare(link.label)
                setOpen(false)
              }}
              className="block px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-[#f8f5ee] hover:text-stone-950"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleCopy}
            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-stone-700 transition hover:bg-[#f8f5ee] hover:text-stone-950"
          >
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
