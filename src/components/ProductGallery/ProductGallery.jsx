import { useRef, useState } from 'react'
import ImageLightbox from './ImageLightbox'

// Swipeable product gallery: the full image is always shown (never cropped),
// tapping an image opens it full screen, and the YouTube video is the last slide.
export default function ProductGallery({ images, youtubeId, productName }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const trackRef = useRef(null)

  const slides = [
    ...images.map((image) => ({ type: 'image', ...image })),
    ...(youtubeId ? [{ type: 'video' }] : []),
  ]
  const total = slides.length

  function scrollToSlide(index) {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    if (index !== activeIndex) {
      setActiveIndex(index)
      // Stop the video when swiping away from it
      if (slides[index]?.type !== 'video') setVideoPlaying(false)
    }
  }

  if (total === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#f8f5ee] lg:aspect-[5/4]">
        <div className="text-center">
          <p className="display-serif text-4xl leading-none text-stone-300 sm:text-5xl">MP</p>
          <p className="mt-3 text-xs font-bold uppercase text-stone-400">Product image</p>
        </div>
      </div>
    )
  }

  const arrowClass =
    'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ded8cc] bg-white/90 text-stone-800 shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 lg:flex'

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.type === 'image' ? slide.src : 'video'}
              className="flex aspect-square w-full shrink-0 snap-center items-center justify-center lg:aspect-[5/4]"
            >
              {slide.type === 'image' ? (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`View image ${index + 1} full screen`}
                  className="flex h-full w-full cursor-zoom-in items-center justify-center"
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="max-h-full max-w-full rounded-2xl object-contain"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </button>
              ) : videoPlaying ? (
                <iframe
                  className="aspect-video w-full rounded-2xl bg-black"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={`${productName} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setVideoPlaying(true)}
                  aria-label={`Play ${productName} video`}
                  className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
                >
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover opacity-85"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
                      <svg className="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {total > 1 ? (
          <>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-stone-950/70 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white">
              {activeIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous image"
              className={`${arrowClass} left-3`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex + 1)}
              disabled={activeIndex === total - 1}
              aria-label="Next image"
              className={`${arrowClass} right-3`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        ) : null}

        {slides[activeIndex]?.type === 'image' ? (
          <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
            </svg>
          </span>
        ) : null}
      </div>

      {total > 1 ? (
        <>
          {/* Thumbnails of every image (and the video) under the main image */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slides.map((slide, index) => (
              <button
                key={slide.type === 'image' ? slide.src : 'video'}
                type="button"
                onClick={() => scrollToSlide(index)}
                aria-label={slide.type === 'video' ? 'Show video' : `Show image ${index + 1}`}
                className={[
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition sm:h-20 sm:w-20',
                  index === activeIndex
                    ? 'border-stone-900 ring-2 ring-stone-900/10'
                    : 'border-[#ded8cc] opacity-70 hover:opacity-100',
                ].join(' ')}
              >
                {slide.type === 'image' ? (
                  <img src={slide.src} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
                ) : (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white">
                        <svg className="ml-0.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {lightboxIndex !== null ? (
        <ImageLightbox
          images={images}
          startIndex={lightboxIndex}
          productName={productName}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  )
}
