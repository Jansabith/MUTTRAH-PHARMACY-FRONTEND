import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initAnalytics, trackPageView } from '../../services/analytics'

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    // Wait for the page's SEO component to set document.title first
    const timer = window.setTimeout(() => {
      trackPageView(location.pathname + location.search)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [location.pathname, location.search])

  return null
}
