import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const DARK_BELOW = 0.6 // perceived lightness (0 black - 1 white) under which a background counts as dark

// Perceived lightness (0-1) of a computed CSS colour, or null when it is
// (mostly) transparent. Handles rgb()/rgba() and the oklch()/oklab() colours
// Tailwind uses for its palette.
function lightnessOf(color) {
  const match = color.match(/^(rgba?|oklch|oklab)\(([^)]+)\)/)
  if (!match) return null
  const [space, body] = [match[1], match[2]]
  const [channels, slashAlpha] = body.split('/')
  const values = channels.split(/[\s,]+/).filter(Boolean)
  const alphaText = slashAlpha ?? (space === 'rgba' ? values[3] : undefined)
  const alpha = alphaText === undefined ? 1 : parseFloat(alphaText) / (alphaText.includes('%') ? 100 : 1)
  if (alpha < 0.5) return null

  if (space.startsWith('ok')) {
    const lightness = parseFloat(values[0])
    return values[0].includes('%') ? lightness / 100 : lightness
  }
  // sRGB -> relative luminance -> OKLab-like lightness (cube root)
  const linear = values.slice(0, 3).map((value) => {
    const channel = parseFloat(value) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
  return Math.cbrt(luminance)
}

// Theme of the page section behind a point: a data-nav-theme attribute wins,
// otherwise the first solid background colour walking up from the section.
// Starting from the section (not the exact element) keeps cards and images
// passing under the navbar from flipping it back and forth.
function themeOf(node) {
  let current = node?.closest?.('[data-nav-theme], section, footer') || node
  while (current && current !== document.documentElement) {
    if (current.dataset?.navTheme) return current.dataset.navTheme
    const lightness = lightnessOf(getComputedStyle(current).backgroundColor)
    if (lightness !== null) return lightness < DARK_BELOW ? 'dark' : 'light'
    current = current.parentElement
  }
  return 'light'
}

// 'dark' or 'light': what the page looks like right behind `ref` (the navbar),
// so its text can switch to white over dark sections and dark over light ones
export default function useBackdropTheme(ref) {
  const { pathname } = useLocation()
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    let frame = 0
    const detect = () => {
      frame = 0
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      // While the navbar is slid away on scroll, look where it will reappear
      const y = rect.bottom > 0 ? rect.top + rect.height / 2 : 40
      const x = rect.left + rect.width / 2
      const below = document.elementsFromPoint(x, y).find((node) => !element.contains(node))
      setTheme(themeOf(below))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(detect)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Pages load their content after the route changes; re-check as they grow
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(document.body)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resizeObserver.disconnect()
    }
  }, [ref, pathname])

  return theme
}
