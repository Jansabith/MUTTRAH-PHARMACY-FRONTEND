import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { setLenis } from './lenisInstance'

// Site-wide smooth scrolling for mouse wheels and trackpads. Phones keep
// their native touch scrolling, which already glides. Scroll areas inside
// the page (menus, panels) opt out with the data-lenis-prevent attribute.
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085, // lower = smoother and longer glide
      wheelMultiplier: 1,
      smoothWheel: true,
      anchors: true,
      autoRaf: true,
    })
    setLenis(lenis)

    // Menus, the search panel, filters and the image viewer lock the page by
    // setting body overflow to hidden; pause smooth scrolling while they do
    const syncWithBodyLock = () => {
      if (document.body.style.overflow === 'hidden') lenis.stop()
      else lenis.start()
    }
    syncWithBodyLock()
    const observer = new MutationObserver(syncWithBodyLock)
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })

    return () => {
      observer.disconnect()
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return null
}
