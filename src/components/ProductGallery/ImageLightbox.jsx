import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SWIPE_THRESHOLD_PX = 50
const ZOOM_SCALE = 2.5

// Full-screen image viewer: swipe/arrow keys to move between images,
// double-tap (or double-click) to zoom in and drag/scroll around.
export default function ImageLightbox({ images, startIndex, productName, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef(null)
  const scrollerRef = useRef(null)

  const total = images.length
  const goTo = (next) => {
    setZoomed(false)
    setIndex((next + total) % total)
  }

  // Lock page scroll only while the viewer is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') goTo(index + 1)
      if (event.key === 'ArrowLeft') goTo(index - 1)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  })

  // Phones don't reliably fire dblclick, so detect two quick taps ourselves
  const lastTap = useRef(0)
  function handleTap(event) {
    const now = event.timeStamp
    if (now - lastTap.current < 300) {
      lastTap.current = 0
      toggleZoom(event)
    } else {
      lastTap.current = now
    }
  }

  function toggleZoom(event) {
    const scroller = scrollerRef.current
    if (zoomed || !scroller) {
      setZoomed(false)
      return
    }
    // Zoom in around the point that was tapped
    const rect = scroller.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    setZoomed(true)
    requestAnimationFrame(() => {
      scroller.scrollLeft = x * scroller.scrollWidth - rect.width / 2
      scroller.scrollTop = y * scroller.scrollHeight - rect.height / 2
    })
  }

  function handleTouchStart(event) {
    touchStartX.current = zoomed ? null : event.touches[0].clientX
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null || total < 2) return
    const delta = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    goTo(delta < 0 ? index + 1 : index - 1)
  }

  const arrowClass =
    'absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:flex'

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} images`}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-sm font-semibold tabular-nums text-white/80">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="relative min-h-0 flex-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div
          ref={scrollerRef}
          className={['h-full w-full', zoomed ? 'overflow-auto' : 'overflow-hidden'].join(' ')}
        >
          <div
            className="flex items-center justify-center"
            style={zoomed ? { width: `${ZOOM_SCALE * 100}%`, height: `${ZOOM_SCALE * 100}%` } : { width: '100%', height: '100%' }}
          >
            <img
              key={images[index]}
              src={images[index]}
              alt={`${productName} – image ${index + 1}`}
              onClick={handleTap}
              className={[
                'max-h-full max-w-full touch-manipulation select-none object-contain',
                zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
              ].join(' ')}
              draggable={false}
            />
          </div>
        </div>

        {total > 1 && !zoomed ? (
          <>
            <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous image" className={`${arrowClass} left-4`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button type="button" onClick={() => goTo(index + 1)} aria-label="Next image" className={`${arrowClass} right-4`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      <p className="px-4 py-4 text-center text-xs text-white/60">
        {zoomed ? 'Drag to look around · double-tap to zoom out' : `Double-tap to zoom${total > 1 ? ' · swipe for more' : ''}`}
      </p>
    </div>,
    document.body,
  )
}
