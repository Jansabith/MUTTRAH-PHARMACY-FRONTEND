// Google Analytics 4. Does nothing unless VITE_GA_MEASUREMENT_ID is set,
// so local development never sends data to the live GA property.
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

let initialized = false

export function initAnalytics() {
  if (initialized || !MEASUREMENT_ID || typeof window === 'undefined') return
  initialized = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // Page views are sent manually on every route change (see trackPageView)
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false })
}

export function trackPageView(path) {
  if (!initialized) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function trackEvent(name, params = {}) {
  if (!initialized) return
  window.gtag('event', name, params)
}
