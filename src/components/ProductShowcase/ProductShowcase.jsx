import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { getMediaUrl, websiteAPI } from '../../services/api'
import useMarquee from '../../hooks/useMarquee'

// Opens first when it has products, matching the design
const DEFAULT_TAB = 'featured'
const AUTO_SPEED = 35 // px per second
// 'right' = cards travel left to right; 'left' = right to left
const AUTO_DIRECTION = 'right'
const GAP = 20 // px between cards
const MIN_CARD_WIDTH = 230 // px; wider screens fit more cards instead of bigger ones
const IMAGE_RATIO = 0.8 // image height / image width (aspect 5:4)
const IMAGE_INSET = 10 // px around the image panel inside a card (m-2.5)
const TRACK_PADDING = 12 // px above the cards (py-3 on the track)

// Cards visible at once; with more products than this the row auto-scrolls.
// Phones show one and a half cards so it's clear there's more to see.
const cardsPerView = (width) => {
  if (width < 520) return 1.5
  return Math.max(2, Math.floor((width + GAP) / (MIN_CARD_WIDTH + GAP)))
}

function ArrowIcon({ direction = 'next', className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {direction === 'prev' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  )
}

// Arrows sit inside the strip (outside it they were cut off on some widths),
// centred on the product images
function ArrowButton({ direction, top, onClick }) {
  const isPrev = direction === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? 'Previous products' : 'Next products'}
      style={{ top }}
      className={[
        'absolute z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#b7774f] hover:bg-[#b7774f] active:scale-95 sm:h-11 sm:w-11',
        isPrev ? 'left-2' : 'right-2',
      ].join(' ')}
    >
      <ArrowIcon direction={direction} className="h-5 w-5" />
    </button>
  )
}

function ShowcaseCard({ product, isNew, isClone }) {
  const imageUrl = getMediaUrl(product.image)
  return (
    <Link
      to={`/products/${product.slug}`}
      // The looping copy is decorative: keep it out of the tab order
      tabIndex={isClone ? -1 : undefined}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#1b1917] to-[#111010] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#b7774f]/60 hover:shadow-[0_24px_50px_-22px_rgba(183,119,79,0.55)]"
    >
      {/* Warm panel; white image backgrounds blend into it */}
      <div className="relative m-2.5 mb-0 aspect-[5/4] overflow-hidden rounded-xl bg-[#f4f1ec]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.image_alt || product.name}
            loading="eager"
            className="h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="display-serif text-3xl text-stone-300">MP</span>
          </div>
        )}
        {isNew ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#70443d] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            New
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        {product.company_name ? (
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#d7b08d]">
            {product.company_name}
          </p>
        ) : null}
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-[#f1d1b8]">
          {product.name}
        </h3>
        {product.category_name ? (
          <p className="mt-1 truncate text-xs text-stone-400">{product.category_name}</p>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-300 transition-colors group-hover:text-white">
              View details
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-500 group-hover:translate-x-0.5 group-hover:border-[#b7774f] group-hover:bg-[#b7774f]">
              <ArrowIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Home page section with Best Sellers / Featured / New Launches tabs.
// Tabs, products and their order are managed in Django admin under
// Website > Home product showcase.
export default function ProductShowcase() {
  const [tabs, setTabs] = useState([])
  const [activeKey, setActiveKey] = useState(DEFAULT_TAB)
  const [layout, setLayout] = useState({ cardWidth: 0, perView: 4 })
  const viewportRef = useRef(null)

  useEffect(() => {
    let active = true
    websiteAPI
      .getShowcase()
      .then((data) => {
        if (active) setTabs(data)
      })
      .catch(() => {
        if (active) setTabs([])
      })
    return () => {
      active = false
    }
  }, [])

  // Fall back to the first tab if the default one is hidden or empty
  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0]
  const hasTabs = Boolean(activeTab)

  // Size the cards from the visible width so a whole number of them fits
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined
    const measure = () => {
      const perView = cardsPerView(viewport.clientWidth)
      const cardWidth = (viewport.clientWidth - GAP * (perView - 1)) / perView
      setLayout({ cardWidth, perView })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [hasTabs])

  // Only scroll when the tab has more products than fit on screen
  const isLooping = hasTabs && layout.cardWidth > 0 && activeTab.products.length > layout.perView
  const { trackRef, slideBy, reset, pauseProps } = useMarquee({
    speed: AUTO_SPEED,
    direction: AUTO_DIRECTION,
    enabled: isLooping,
  })
  const imageHeight = (layout.cardWidth - IMAGE_INSET * 2) * IMAGE_RATIO
  const arrowTop = TRACK_PADDING + IMAGE_INSET + imageHeight / 2

  // Nothing chosen in the admin yet: leave the section out entirely
  if (!activeTab) return null

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#0b0b0b] py-10 text-white sm:py-12 lg:py-14">
      {/* Soft copper glow from the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(183,119,79,0.18),transparent_70%)]"
      />

      <div className="container-shell">
        <div className="mb-7 flex flex-col items-center gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="text-center lg:text-left">
            <span aria-hidden="true" className="mx-auto mb-5 block h-px w-12 bg-[#b7774f] lg:mx-0" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="display-serif text-[2rem] leading-[1.1] text-white sm:text-[2.5rem] xl:text-[2.85rem]">
                  {activeTab.name}
                </h2>
                {activeTab.subtitle ? (
                  <p className="mt-3 text-[17px] font-medium leading-8 text-stone-300 sm:text-lg">
                    {activeTab.subtitle}
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {tabs.length > 1 ? (
            <div
              role="tablist"
              className="flex max-w-full shrink-0 rounded-full border border-white/15 bg-white/[0.04] p-1 backdrop-blur"
            >
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveKey(tab.key)}
                    className={[
                      'relative whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-300 sm:px-6',
                      isActive ? 'text-black' : 'text-stone-300 hover:text-white',
                    ].join(' ')}
                  >
                    {/* The white pill glides to the selected tab */}
                    {isActive ? (
                      <motion.span
                        layoutId="showcase-tab-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-white shadow-[0_6px_20px_rgba(255,255,255,0.15)]"
                      />
                    ) : null}
                    <span className="relative">{tab.name}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="relative" {...pauseProps}>
          {isLooping ? <ArrowButton direction="prev" top={arrowTop} onClick={() => slideBy(-1)} /> : null}
          <div
            ref={viewportRef}
            className={['overflow-hidden', isLooping ? 'marquee-fade' : ''].join(' ')}
          >
            <AnimatePresence mode="wait" onExitComplete={reset}>
              <motion.div
                key={activeTab.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                role="tabpanel"
                className={['flex', isLooping ? '' : 'justify-center'].join(' ')}
              >
                {/* Rendered twice while looping so the strip never shows a gap */}
                <div
                  ref={trackRef}
                  className="flex w-max items-stretch py-3 will-change-transform"
                  style={{ visibility: layout.cardWidth ? 'visible' : 'hidden' }}
                >
                  {(isLooping ? [0, 1] : [0]).map((copy) =>
                    activeTab.products.map((product, index) => {
                      const isLast = !isLooping && index === activeTab.products.length - 1
                      return (
                        <div
                          key={`${copy}-${product.id}`}
                          data-marquee-item
                          aria-hidden={copy === 1 || undefined}
                          className="shrink-0"
                          style={{
                            width: layout.cardWidth + (isLast ? 0 : GAP),
                            paddingRight: isLast ? 0 : GAP,
                          }}
                        >
                          <ShowcaseCard
                            product={product}
                            isNew={activeTab.key === 'new_launches'}
                            isClone={copy === 1}
                          />
                        </div>
                      )
                    }),
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          {isLooping ? <ArrowButton direction="next" top={arrowTop} onClick={() => slideBy(1)} /> : null}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
          >
            View all products
            <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
