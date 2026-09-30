import { getMediaUrl } from '../../services/api'

// Breakpoints match the help text on the Django admin fields
export const MOBILE_QUERY = '(max-width: 767px)'
export const TABLET_QUERY = '(max-width: 1279px)'

// Each size falls back to the next larger one when it was not uploaded
export function getSlideSources(slide) {
  const desktop = getMediaUrl(slide.image)
  const tablet = getMediaUrl(slide.tablet_image) || desktop
  const mobile = getMediaUrl(slide.mobile_image) || tablet
  return { desktop, tablet, mobile }
}

export function getSlideSourceForViewport(slide) {
  const { desktop, tablet, mobile } = getSlideSources(slide)
  if (window.matchMedia(MOBILE_QUERY).matches) return mobile
  if (window.matchMedia(TABLET_QUERY).matches) return tablet
  return desktop
}
