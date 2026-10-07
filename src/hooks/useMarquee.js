import { useCallback, useEffect, useMemo, useRef } from 'react'

const SLIDE_DURATION = 650 // ms for an arrow click or the glide after a swipe
const DRAG_THRESHOLD = 8 // px a finger must move sideways before the strip follows it
const RESUME_AFTER_SWIPE = 3000 // ms before auto-scrolling starts again
const GLIDE_FACTOR = 250 // how far a swipe glides on: release speed (px/ms) x this

const easeOutCubic = (t) => 1 - (1 - t) ** 3

// Drives an endless, auto-scrolling strip. Render the items twice inside the
// element given `trackRef` (mark each item with data-marquee-item) and the
// strip loops seamlessly. It pauses while hovered or focused, and slideBy()
// glides it one item either way for arrow buttons. Spread `swipeProps` on the
// strip's visible area so a finger can drag it on touch screens.
//
//   direction: 'left'  - items travel right to left
//              'right' - items travel left to right
export default function useMarquee({ speed = 40, direction = 'left', enabled = true } = {}) {
  const trackRef = useRef(null)
  const offsetRef = useRef(0)
  const pausedRef = useRef(false)
  const slideRef = useRef(null)
  const enabledRef = useRef(enabled)
  const dragRef = useRef(null)
  const resumeAtRef = useRef(0)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    enabledRef.current = enabled
    if (!enabled) {
      offsetRef.current = 0
      slideRef.current = null
      if (trackRef.current) trackRef.current.style.transform = ''
    }
  }, [enabled])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const step = (reduceMotion ? speed / 3 : speed) * (direction === 'left' ? 1 : -1)
    let frame
    let last = performance.now()

    const tick = (now) => {
      // Clamp so a background tab doesn't jump the strip when it returns
      const dt = Math.min(now - last, 64)
      last = now

      // Read the ref every frame: the track element changes when tabs switch
      const track = trackRef.current
      if (track && enabledRef.current) {
        const slide = slideRef.current
        if (slide) {
          const progress = Math.min((now - slide.start) / SLIDE_DURATION, 1)
          offsetRef.current = slide.from + (slide.to - slide.from) * easeOutCubic(progress)
          if (progress === 1) slideRef.current = null
        } else if (!pausedRef.current && !dragRef.current?.active && now >= resumeAtRef.current) {
          offsetRef.current += (step * dt) / 1000
        }

        // The items are rendered twice, so wrapping at half the width is seamless
        const loopWidth = track.scrollWidth / 2
        if (loopWidth > 0) {
          const wrapped = ((offsetRef.current % loopWidth) + loopWidth) % loopWidth
          track.style.transform = `translate3d(${-wrapped}px, 0, 0)`
        }
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [speed, direction])

  // +1 brings in the next item from the right, -1 the previous one from the left
  const slideBy = useCallback((dir) => {
    const item = trackRef.current?.querySelector('[data-marquee-item]')
    const width = item ? item.offsetWidth : 320
    // Chain from the current target so quick repeat clicks keep adding an item
    const from = offsetRef.current
    const base = slideRef.current ? slideRef.current.to : from
    slideRef.current = { from, to: base + dir * width, start: performance.now() }
  }, [])

  // Start again from the first item, e.g. after switching tabs
  const reset = useCallback(() => {
    offsetRef.current = 0
    slideRef.current = null
  }, [])

  const pauseProps = useMemo(() => {
    const pause = () => {
      pausedRef.current = true
    }
    const resume = () => {
      pausedRef.current = false
    }
    return { onMouseEnter: pause, onMouseLeave: resume, onFocus: pause, onBlur: resume }
  }, [])

  // Finger dragging (touch and pen only; mouse users have the arrows). The
  // element needs `touch-action: pan-y` so the page still scrolls up and down
  // and only sideways drags come here.
  const swipeProps = useMemo(() => {
    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' || !enabledRef.current) return
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startOffset: offsetRef.current,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        velocity: 0,
        active: false,
      }
    }
    const onPointerMove = (event) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      const dx = event.clientX - drag.startX
      if (!drag.active) {
        if (Math.abs(dx) < DRAG_THRESHOLD || Math.abs(dx) < Math.abs(event.clientY - drag.startY)) return
        drag.active = true
        slideRef.current = null
        event.currentTarget.setPointerCapture?.(event.pointerId)
      }
      const elapsed = event.timeStamp - drag.lastTime
      if (elapsed > 0) drag.velocity = (event.clientX - drag.lastX) / elapsed
      drag.lastX = event.clientX
      drag.lastTime = event.timeStamp
      // Finger moving left pulls the items left
      offsetRef.current = drag.startOffset - dx
    }
    const onPointerEnd = (event) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      dragRef.current = null
      if (!drag.active) return
      // The finger lifted on a card: that's the end of a swipe, not a tap.
      // The flag expires so a later real tap is never swallowed.
      suppressClickRef.current = true
      setTimeout(() => {
        suppressClickRef.current = false
      }, 400)
      const from = offsetRef.current
      slideRef.current = { from, to: from - drag.velocity * GLIDE_FACTOR, start: performance.now() }
      resumeAtRef.current = performance.now() + RESUME_AFTER_SWIPE
    }
    const onClickCapture = (event) => {
      if (!suppressClickRef.current) return
      suppressClickRef.current = false
      event.preventDefault()
      event.stopPropagation()
    }
    return {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    }
  }, [])

  return { trackRef, slideBy, reset, pauseProps, swipeProps }
}
