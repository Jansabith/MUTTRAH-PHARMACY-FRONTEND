import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { companiesAPI, getMediaUrl, productsAPI } from '../../services/api'

const MIN_LENGTH = 2
const DEBOUNCE_MS = 200

// Answers already fetched this visit, so going back over a word is instant
const resultCache = new Map()

const normalize = (value) => value.trim().replace(/\s+/g, ' ')

// Small thumbnails: on Cloudinary ask for a resized copy instead of the full image
const thumbUrl = (path) => {
  const url = getMediaUrl(path)
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/c_fit,w_160,h_160,q_auto,f_auto/')
  }
  return url
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Wraps the searched words in the text with a copper highlight
function Highlight({ text, query }) {
  const terms = query.split(' ').filter(Boolean).map(escapeRegExp)
  if (!terms.length) return text
  const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'))
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="bg-transparent font-bold text-[#b7774f]">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  )
}

function ArrowIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function GroupTitle({ children }) {
  return (
    <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#70443d]">
      {children}
    </p>
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-1.5 p-2.5" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-4 rounded-2xl p-2.5">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-[#efe9df]" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-[#efe9df]" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-[#efe9df]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Navbar search: a panel over the page with live product suggestions.
// It is loaded only when first opened, then kept mounted (hidden) so it
// reopens instantly.
export default function SearchPanel({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState({ query: '', data: null, error: false })
  const [activeIndex, setActiveIndex] = useState(-1)
  const [brands, setBrands] = useState([])

  const term = normalize(query)
  const isSearching = term.length >= MIN_LENGTH
  const data = isSearching && result.query === term ? result.data : null
  const isLoading = isSearching && result.query !== term
  const products = data?.products || []

  // Fade in on the next frame so the opening transition plays
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(open))
    return () => cancelAnimationFrame(frame)
  }, [open])

  // While open: focus the box, lock the page scroll, close on Escape
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 60)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  // Brand shortcuts for the empty state (already cached by the navbar)
  useEffect(() => {
    let active = true
    companiesAPI
      .getAll()
      .then((list) => {
        if (active) setBrands(list)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Live results: wait for a short pause in typing, cancel outdated requests
  useEffect(() => {
    if (term.length < MIN_LENGTH) return undefined
    if (resultCache.has(term)) {
      const frame = requestAnimationFrame(() =>
        setResult({ query: term, data: resultCache.get(term), error: false }),
      )
      return () => cancelAnimationFrame(frame)
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await productsAPI.suggest(term, controller.signal)
        resultCache.set(term, response)
        setResult({ query: term, data: response, error: false })
      } catch (error) {
        if (error?.name !== 'CanceledError' && error?.name !== 'AbortError') {
          setResult({ query: term, data: null, error: true })
        }
      }
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [term])

  const goToAllResults = () => {
    if (!term) return
    onClose()
    navigate(`/products?search=${encodeURIComponent(term)}`, { state: { search: term } })
  }

  const onInputKeyDown = (event) => {
    if (event.key === 'ArrowDown' && products.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % products.length)
    } else if (event.key === 'ArrowUp' && products.length) {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? products.length - 1 : index - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const product = products[activeIndex]
      if (product) {
        onClose()
        navigate(`/products/${product.slug}`)
      } else {
        goToAllResults()
      }
    }
  }

  const hasSideGroups = Boolean(data?.brands?.length || data?.categories?.length)

  return createPortal(
    <div
      className={[
        'fixed inset-0 z-[120] flex items-start justify-center px-3 pt-3 sm:px-6 sm:pt-20',
        open ? '' : 'pointer-events-none invisible',
      ].join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      aria-hidden={!open}
    >
      <div
        className={[
          'absolute inset-0 bg-stone-950/45 backdrop-blur-sm transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={[
          'relative flex max-h-[calc(100svh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-[#ded8cc] bg-[#fffdf8] shadow-[0_40px_120px_rgba(17,16,14,0.35)] transition-all duration-300 ease-out sm:max-h-[min(78vh,640px)]',
          visible ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-3 scale-[0.98] opacity-0',
        ].join(' ')}
      >
        {/* Search box */}
        <div className="flex items-center gap-3 border-b border-[#ece4d8] px-4 py-3.5 sm:px-6 sm:py-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#b7774f]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(-1)
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search products, brands, categories..."
            aria-label="Search products, brands, categories"
            autoComplete="off"
            spellCheck="false"
            className="min-w-0 flex-1 bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-400 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-stone-400 transition hover:bg-[#f3eee6] hover:text-stone-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-[#ded8cc] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-500 transition hover:border-stone-400 hover:text-stone-900"
          >
            <span className="hidden sm:inline">Esc</span>
            <span className="sm:hidden">Close</span>
          </button>
        </div>

        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Before typing: brand shortcuts */}
          {!isSearching ? (
            <div className="p-4 sm:p-6">
              <GroupTitle>Browse by brand</GroupTitle>
              <div className="flex flex-wrap gap-2 px-2.5">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/products?company=${brand.id}`}
                    onClick={onClose}
                    className="rounded-full border border-[#e4dacb] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 transition hover:border-[#b7774f] hover:bg-[#b7774f] hover:text-white"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {isLoading ? <SkeletonRows /> : null}

          {isSearching && !isLoading && result.error ? (
            <p className="p-6 text-center text-sm text-stone-500">
              Search is unavailable right now. Please try again.
            </p>
          ) : null}

          {data && !data.count && !hasSideGroups ? (
            <div className="px-6 py-10 text-center">
              <p className="display-serif text-2xl text-stone-900">No matches for &ldquo;{term}&rdquo;</p>
              <p className="mt-2 text-sm text-stone-500">
                Try a product name, a brand or a category.
              </p>
              <Link
                to="/products"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-900 transition hover:bg-stone-900 hover:text-white"
              >
                Browse all products
              </Link>
            </div>
          ) : null}

          {data && (data.count || hasSideGroups) ? (
            <div className={hasSideGroups ? 'grid md:grid-cols-[1fr_15rem]' : ''}>
              <div className="p-2.5 sm:p-4">
                {products.length ? (
                  <>
                    <GroupTitle>
                      Products
                      <span className="ml-2 font-semibold normal-case tracking-normal text-stone-400">
                        {data.count} {data.count === 1 ? 'result' : 'results'}
                      </span>
                    </GroupTitle>
                    <ul role="listbox" aria-label="Matching products" className="space-y-0.5">
                      {products.map((product, index) => {
                        const isActive = index === activeIndex
                        return (
                          <li key={product.id} role="option" aria-selected={isActive}>
                            <Link
                              to={`/products/${product.slug}`}
                              onClick={onClose}
                              onMouseEnter={() => setActiveIndex(index)}
                              className={[
                                'group flex items-center gap-4 rounded-2xl p-2.5 transition-colors',
                                isActive ? 'bg-[#f4eee5]' : 'hover:bg-[#f4eee5]',
                              ].join(' ')}
                            >
                              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#ece4d8] bg-white">
                                {product.image ? (
                                  <img
                                    src={thumbUrl(product.image)}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-contain p-1 mix-blend-multiply"
                                  />
                                ) : (
                                  <span className="display-serif text-lg text-stone-300">MP</span>
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#b7774f]">
                                  {product.company_name}
                                </span>
                                <span className="mt-0.5 block truncate text-[15px] font-semibold text-stone-900">
                                  <Highlight text={product.name} query={term} />
                                </span>
                                <span className="block truncate text-xs text-stone-500">{product.category_name}</span>
                              </span>
                              <ArrowIcon
                                className={[
                                  'h-4 w-4 shrink-0 text-[#b7774f] transition-all duration-300',
                                  isActive ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
                                ].join(' ')}
                              />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                ) : (
                  <p className="p-4 text-sm text-stone-500">
                    No product names match &ldquo;{term}&rdquo;, but these may help.
                  </p>
                )}
              </div>

              {hasSideGroups ? (
                <div className="space-y-5 border-t border-[#ece4d8] bg-[#faf7f1] p-4 md:border-l md:border-t-0">
                  {data.brands.length ? (
                    <div>
                      <GroupTitle>Brands</GroupTitle>
                      {data.brands.map((brand) => (
                        <Link
                          key={brand.id}
                          to={`/products?company=${brand.id}`}
                          onClick={onClose}
                          className="block rounded-xl px-2.5 py-2 text-sm font-semibold text-stone-800 transition hover:bg-white hover:text-[#b7774f]"
                        >
                          <Highlight text={brand.name} query={term} />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {data.categories.length ? (
                    <div>
                      <GroupTitle>Categories</GroupTitle>
                      {data.categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.id}`}
                          onClick={onClose}
                          className="block rounded-xl px-2.5 py-2 transition hover:bg-white"
                        >
                          <span className="block text-sm font-semibold text-stone-800">
                            <Highlight text={category.name} query={term} />
                          </span>
                          {category.company_name ? (
                            <span className="block text-[11px] text-stone-500">{category.company_name}</span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Footer: all results + keyboard hints */}
        {data && data.count ? (
          <div className="flex items-center justify-between gap-3 border-t border-[#ece4d8] px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={goToAllResults}
              className="group inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#70443d]"
            >
              See all {data.count} results
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="hidden text-[11px] text-stone-400 sm:block">
              <kbd className="rounded border border-[#ded8cc] px-1.5 py-0.5 font-sans">&uarr;</kbd>{' '}
              <kbd className="rounded border border-[#ded8cc] px-1.5 py-0.5 font-sans">&darr;</kbd> to move,{' '}
              <kbd className="rounded border border-[#ded8cc] px-1.5 py-0.5 font-sans">Enter</kbd> to open
            </p>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
