import { Link } from 'react-router-dom'
import { getMediaUrl, urlName } from '../../services/api'
import useMarquee from '../../hooks/useMarquee'

const AUTO_SPEED = 40 // px per second

function ArrowButton({ direction, onClick }) {
  const isPrev = direction === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? 'Previous brands' : 'Next brands'}
      className={[
        'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2d6c7] bg-[#fffdf8] text-stone-800 shadow-md transition-all duration-300 hover:scale-110 hover:border-[#70443d] hover:bg-[#70443d] hover:text-[#fffdf8] active:scale-95 sm:h-12 sm:w-12',
        isPrev ? 'left-1 sm:-left-2' : 'right-1 sm:-right-2',
      ].join(' ')}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-5 w-5"
      >
        {isPrev ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  )
}

function BrandCard({ company, isClone }) {
  const logoUrl = getMediaUrl(company.logo)
  return (
    <div
      data-marquee-item
      className="w-[290px] shrink-0 pr-4 sm:w-[340px] sm:pr-5"
      aria-hidden={isClone || undefined}
    >
      <Link
        to={`/products?company=${urlName(company)}`}
        tabIndex={isClone ? -1 : undefined}
        className="group flex h-full flex-col rounded-2xl border border-[#ece4d8] bg-[#fffdf8] p-5 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#c9a184] hover:shadow-[0_18px_40px_-18px_rgba(112,68,61,0.35)] sm:p-6"
      >
        {/* Logo from the Company admin; the name shows instead until one is uploaded */}
        <div className="flex h-28 items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={company.name}
              loading="lazy"
              className="max-h-full max-w-[85%] object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <span className="display-serif text-center text-2xl font-semibold leading-tight tracking-wide text-stone-900 transition-colors duration-500 group-hover:text-[#70443d]">
              {company.name}
            </span>
          )}
        </div>
        {logoUrl ? (
          <h3 className="mt-3 text-center text-sm font-bold uppercase tracking-wider text-stone-800">
            {company.name}
          </h3>
        ) : null}
        {company.description ? (
          <p className="mt-4 line-clamp-3 border-t border-[#ece4d8] pt-4 text-center text-[15px] font-medium leading-7 text-stone-700">
            {company.description}
          </p>
        ) : null}
      </Link>
    </div>
  )
}

// Endless right-to-left strip of brand cards. It scrolls on its own, pauses
// while hovered or focused, and the arrows glide it one card either way.
export default function BrandMarquee({ companies }) {
  const { trackRef, slideBy, pauseProps } = useMarquee({ speed: AUTO_SPEED, direction: 'left' })

  return (
    <div className="relative" {...pauseProps}>
      <ArrowButton direction="prev" onClick={() => slideBy(-1)} />
      <div className="marquee-fade overflow-hidden py-3">
        <div ref={trackRef} className="flex w-max items-stretch will-change-transform">
          {[0, 1].map((copy) =>
            companies.map((company) => (
              <BrandCard key={`${copy}-${company.id}`} company={company} isClone={copy === 1} />
            )),
          )}
        </div>
      </div>
      <ArrowButton direction="next" onClick={() => slideBy(1)} />
    </div>
  )
}
