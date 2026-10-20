import { useEffect } from 'react'

const ELFSIGHT_SCRIPT_SRC = 'https://elfsightcdn.com/platform.js'
const WIDGET_CLASS = 'elfsight-app-9de27413-36cf-4371-a201-544952397457'

export default function GoogleReviewsBadge() {
  useEffect(() => {
    // 1. Load the Elfsight platform script
    let script = document.querySelector(`script[src="${ELFSIGHT_SCRIPT_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = ELFSIGHT_SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    } else if (window.eapps && typeof window.eapps.init === 'function') {
      window.eapps.init()
    }

    // 2. Actively remove the "Free Google Reviews Widget by Elfsight" branding from DOM
    const removeBranding = () => {
      // Find all links pointing to Elfsight anywhere on the page
      const elfsightLinks = document.querySelectorAll(
        'a[href*="elfsight.com"], a[href*="dash.elfsight.com"]'
      )
      elfsightLinks.forEach((link) => {
        const parent = link.parentElement
        link.remove()
        // If parent has no other real content or contains branding text, remove parent as well
        if (
          parent &&
          parent.textContent &&
          (parent.textContent.includes('Free Google') ||
            parent.textContent.includes('Remove Branding') ||
            parent.textContent.includes('Elfsight'))
        ) {
          parent.remove()
        }
      })

      // Also clean up by text content
      const elementsWithBranding = document.querySelectorAll(
        'div, p, span, a, small'
      )
      elementsWithBranding.forEach((el) => {
        if (
          el.children.length === 0 &&
          (el.textContent?.includes('Free Google Reviews') ||
            el.textContent?.includes('Remove Branding'))
        ) {
          el.parentElement?.remove() || el.remove()
        }
      })
    }

    removeBranding()
    const observer = new MutationObserver(removeBranding)
    observer.observe(document.body, { childList: true, subtree: true })

    const interval = setInterval(removeBranding, 400)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      <style>{`
        /* Make Google Reviews floating badge compact, sleek and unobtrusive */
        .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="BadgeContainer"],
        .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="Sticker"],
        .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="TagSticker"],
        .elfsight-app-9de27413-36cf-4371-a201-544952397457 > div:not([class*="Popup"]):not([class*="Modal"]):not([role="dialog"]),
        [class*="elfsight-app"] > div:not([class*="Popup"]):not([class*="Modal"]):not([role="dialog"]) {
          transform: scale(0.62) !important;
          transform-origin: bottom left !important;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.12)) !important;
        }

        .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="BadgeContainer"]:hover,
        .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="Sticker"]:hover,
        .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="TagSticker"]:hover,
        .elfsight-app-9de27413-36cf-4371-a201-544952397457 > div:not([class*="Popup"]):not([class*="Modal"]):not([role="dialog"]):hover,
        [class*="elfsight-app"] > div:not([class*="Popup"]):not([class*="Modal"]):not([role="dialog"]):hover {
          transform: scale(0.68) !important;
        }

        /* Universally hide any Elfsight free branding anywhere on the page */
        a[href*="elfsight.com"],
        a[href*="dash.elfsight.com"],
        [class*="FreeLink"],
        [class*="free-link"],
        [class*="free_link"],
        [class*="es-badge-branding"],
        div:has(> a[href*="elfsight.com"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Mobile specific sizing */
        @media (max-width: 640px) {
          .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="BadgeContainer"],
          .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="Sticker"],
          .elfsight-app-9de27413-36cf-4371-a201-544952397457 [class*="TagSticker"],
          .elfsight-app-9de27413-36cf-4371-a201-544952397457 > div:not([class*="Popup"]):not([class*="Modal"]):not([role="dialog"]),
          [class*="elfsight-app"] > div:not([class*="Popup"]):not([class*="Modal"]):not([role="dialog"]) {
            transform: scale(0.52) !important;
            transform-origin: bottom left !important;
          }
        }
      `}</style>
      <div
        id="google-reviews-sticker"
        className="google-reviews-floating-container pointer-events-auto relative z-40"
        aria-label="Google Customer Reviews for Muttrah Pharmacy"
      >
        <div className={WIDGET_CLASS} data-elfsight-app-lazy />
      </div>
    </>
  )
}
