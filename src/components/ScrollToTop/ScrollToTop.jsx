import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '../SmoothScroll/lenisInstance'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    // Jump (not glide) to the top; go through the smooth scroller when it runs
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
