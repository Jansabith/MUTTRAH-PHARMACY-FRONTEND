import { getSlideSources, MOBILE_QUERY, TABLET_QUERY } from './heroSlideSources'

// Keeps the chosen part of the image in view, and zooms from that same point
const FOCUS_CLASSES = {
  top: 'object-top origin-top',
  center: 'object-center origin-center',
  bottom: 'object-bottom origin-bottom',
}

// Every slide image is mounted once and kept, so switching slides never
// re-creates or re-decodes an image mid-fade. The slow zoom restarts simply
// because the "hero-slide-zoom" class is removed and re-added.
function SlidePicture({ sources, alt, className, priority }) {
  return (
    <picture>
      <source media={MOBILE_QUERY} srcSet={sources.mobile} />
      <source media={TABLET_QUERY} srcSet={sources.tablet} />
      <img
        src={sources.desktop}
        alt={alt}
        className={className}
        loading="eager"
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  )
}

export function HeroSlides({ slider }) {
  const { slides, total, activeIndex, previousIndex } = slider

  return (
    // "isolate" keeps the slides' z-index layering inside this box, so the dark
    // text-readability overlay in HeroSection always stays on top of the images
    <div className="absolute inset-0 isolate" aria-roledescription="carousel" aria-label="Featured images">
      {slides.map((slide, index) => {
        const isActive = index === activeIndex
        const isPrevious = index === previousIndex
        const sources = getSlideSources(slide)
        // The outgoing slide keeps its (settled) zoom so it doesn't snap under the fade
        const zoom = isActive || isPrevious ? 'hero-slide-zoom' : ''

        // Active slide fades in on top; the previous one stays opaque beneath it
        let layer = 'z-0 opacity-0'
        if (isActive) layer = 'z-10 opacity-100'
        else if (isPrevious) layer = 'z-0 opacity-100'

        return (
          <div
            key={slide.id}
            className={[
              'absolute inset-0 overflow-hidden transform-gpu transition-opacity duration-1000 ease-in-out will-change-[opacity]',
              layer,
            ].join(' ')}
            aria-hidden={!isActive}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${total}`}
          >
            {slide.display === 'contain' ? (
              <>
                {/* Blurred copy fills the hero behind the uncropped image */}
                <SlidePicture
                  sources={sources}
                  alt=""
                  className="h-full w-full scale-110 transform-gpu object-cover blur-2xl brightness-[0.45] saturate-125"
                  priority={index === 0}
                />
                <div className="hero-slide-fade-left absolute inset-0 py-6 lg:left-auto lg:w-[62%]">
                  <SlidePicture
                    sources={sources}
                    alt={slide.alt_text || ''}
                    className={[
                      'h-full w-full object-contain object-center origin-center will-change-transform lg:object-right lg:origin-right',
                      zoom,
                    ].join(' ')}
                    priority={index === 0}
                  />
                </div>
              </>
            ) : (
              <SlidePicture
                sources={sources}
                alt={slide.alt_text || ''}
                className={[
                  'h-full w-full object-cover will-change-transform',
                  FOCUS_CLASSES[slide.focus] || FOCUS_CLASSES.bottom,
                  zoom,
                ].join(' ')}
                priority={index === 0}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
