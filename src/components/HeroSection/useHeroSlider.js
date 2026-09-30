import { useEffect, useState } from 'react'
import { getSlideSourceForViewport } from './heroSlideSources'

const SLIDE_DURATION_MS = 3000
// Must match the fade duration on the slide layers (duration-1000)
const FADE_DURATION_MS = 1000

// Advances the hero slides automatically; there are no manual controls.
export function useHeroSlider(slides) {
  const [activeIndex, setActiveIndex] = useState(0)
  // The slide being faded over stays fully visible underneath until the fade
  // ends, so the dark background never shows through mid-transition.
  const [previousIndex, setPreviousIndex] = useState(null)
  const [tabHidden, setTabHidden] = useState(false)

  const total = slides.length

  useEffect(() => {
    function handleVisibility() {
      setTabHidden(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Pauses while the browser tab is hidden, so visitors return to a fresh slide
  useEffect(() => {
    if (total < 2 || tabHidden) return undefined
    const timer = window.setTimeout(() => {
      setPreviousIndex(activeIndex)
      setActiveIndex((activeIndex + 1) % total)
    }, SLIDE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [activeIndex, total, tabHidden])

  useEffect(() => {
    if (previousIndex === null) return undefined
    const timer = window.setTimeout(() => setPreviousIndex(null), FADE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [previousIndex])

  // Warm the cache for the next slide so the crossfade never shows a blank frame
  useEffect(() => {
    if (total < 2) return
    const next = slides[(activeIndex + 1) % total]
    const preload = new Image()
    preload.src = getSlideSourceForViewport(next)
  }, [activeIndex, slides, total])

  return { slides, total, activeIndex, previousIndex }
}
