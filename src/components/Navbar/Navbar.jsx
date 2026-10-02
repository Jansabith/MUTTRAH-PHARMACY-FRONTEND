import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { companiesAPI } from '../../services/api'
import useBackdropTheme from '../../hooks/useBackdropTheme'

// The search panel is downloaded only when someone is about to use it
// (hovering or focusing the search button), so it never slows page load
const loadSearchPanel = () => import('../SiteSearch/SearchPanel')
const SearchPanel = lazy(loadSearchPanel)

// Typing effect timings (ms) for the desktop search bar hint
const TYPE_DELAY = 85
const DELETE_DELAY = 45
const HOLD_DELAY = 1600
const NEXT_WORD_DELAY = 350

// "Search for ..." with each word typed letter by letter, held, deleted,
// then the next word typed. Shows the first word still if motion is reduced.
function TypingHint({ words, wordClassName }) {
  const [reduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [typing, setTyping] = useState({ index: 0, length: 0, deleting: false })
  const word = words.length ? words[typing.index % words.length] : ''

  useEffect(() => {
    if (!word || reduceMotion) return undefined
    const { index, length, deleting } = typing
    let delay = TYPE_DELAY
    let next = { index, length: length + 1, deleting: false }
    if (!deleting && length >= word.length) {
      delay = HOLD_DELAY
      next = { index, length, deleting: true }
    } else if (deleting && length > 0) {
      delay = DELETE_DELAY
      next = { index, length: length - 1, deleting: true }
    } else if (deleting) {
      delay = NEXT_WORD_DELAY
      next = { index: index + 1, length: 0, deleting: false }
    }
    const timer = setTimeout(() => setTyping(next), delay)
    return () => clearTimeout(timer)
  }, [typing, word, reduceMotion])

  if (!word) return 'Search products...'
  return (
    <>
      Search for{' '}
      <span className={['font-medium', wordClassName].join(' ')}>
        {reduceMotion ? word : word.slice(0, typing.length)}
      </span>
      <span className="typing-caret" aria-hidden="true" />
    </>
  )
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [companies, setCompanies] = useState([])
  const [activeCompanyHover, setActiveCompanyHover] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoaded, setSearchLoaded] = useState(false)
  const lastScrollY = useRef(0)
  const navRef = useRef(null)
  // White text over dark sections (hero, showcase, footer), dark text over light ones
  const isDark = useBackdropTheme(navRef) === 'dark'

  const openSearch = useCallback(() => {
    setSearchLoaded(true)
    setSearchOpen(true)
    setOpen(false)
  }, [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Desktop search bar hint types out the brand names from the admin
  const searchHints = companies.map((company) => company.name)

  // Keyboard shortcut: Ctrl+K / Cmd+K, or "/" when not typing in a field
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      const isShortcut =
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') ||
        (event.key === '/' && !isTyping)
      if (isShortcut) {
        event.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openSearch])

  useEffect(() => {
    let active = true

    async function loadCompanies() {
      try {
        const companyList = await companiesAPI.getAll()
        if (active) {
          setCompanies(companyList)
          if (companyList.length > 0) setActiveCompanyHover(companyList[0])
        }
      } catch {
        if (active) setCompanies([])
      }
    }

    loadCompanies()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = currentScrollY - lastScrollY.current

      if (open || currentScrollY < 80) {
        setHidden(false)
        lastScrollY.current = currentScrollY
        return
      }

      if (scrollDifference > 6) {
        setHidden(true)
      }

      if (scrollDifference < -4) {
        setHidden(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-[0.88rem] font-semibold uppercase transition-colors duration-500',
      isDark
        ? isActive
          ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/20'
          : 'text-white/85 hover:bg-white/10 hover:text-white'
        : isActive
          ? 'bg-white/55 text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-white/70'
          : 'text-stone-800 hover:bg-white/40 hover:text-[#b7774f]',
    ].join(' ')

  // Round glass buttons (search icon, menu)
  const glassButtonClass = isDark
    ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
    : 'border-white/70 bg-white/40 text-stone-950 hover:bg-white/70'

  const getCompanyLines = (company) =>
    (company.lines || []).filter((line) => line.is_active !== false)

  return (
    <>
      <header className="sticky top-0 z-50 py-2 sm:py-3 pointer-events-none">
        <div
        className={[
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          hidden ? '-translate-y-[150%]' : 'translate-y-0',
        ].join(' ')}
      >
        <nav
          ref={navRef}
          className={[
            'pointer-events-auto container-shell relative isolate flex h-14 items-center justify-between gap-3 rounded-full border px-3 backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-500 sm:h-16 sm:px-5 lg:gap-5',
            isDark
              ? 'border-white/20 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(255,255,255,0.06),0_18px_50px_rgba(0,0,0,0.35)]'
              : 'border-white/60 bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(255,255,255,0.2),0_18px_50px_rgba(17,16,14,0.12)]',
          ].join(' ')}
        >
          {/* Glass sheen: light catching the top edge */}
          <span
            aria-hidden="true"
            className={[
              'pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-b to-transparent to-60% transition-opacity duration-500',
              isDark ? 'from-white/[0.12]' : 'from-white/45',
            ].join(' ')}
          />
          <Link
            to="/"
            className={[
              'display-serif flex min-w-0 flex-1 items-center gap-2 text-xl leading-none transition-colors duration-500 sm:gap-3 sm:text-3xl lg:flex-none',
              isDark ? 'text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]' : 'text-stone-950',
            ].join(' ')}
            onClick={() => setOpen(false)}
            aria-label="Muttrah Pharmacy Home"
          >
            <img
              src="/muttrah_logo_128.webp"
              alt=""
              className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
            />
            <span className="truncate">Muttrah Pharmacy</span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex xl:gap-4">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>

            <div className="group relative">
              <NavLink to="/products" className={linkClass}>
                Products
              </NavLink>
              <span
                className="absolute left-0 right-0 top-full h-4"
                aria-hidden="true"
              />
              <div className="invisible absolute left-1/2 top-full z-10 w-[600px] -translate-x-1/2 translate-y-4 overflow-hidden rounded-[2rem] border border-[#ded8cc] bg-[#fffdf8] p-6 opacity-0 shadow-xl transition-all duration-300 ease-out group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                <div className="flex gap-8 h-[380px]">
                  {/* Left Column: Companies (Tabs) */}
                  <div data-lenis-prevent className="w-1/2 flex flex-col border-r border-[#ded8cc]/60 pr-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#b7774f]/50">
                    <p className="micro-copy mb-4 text-[#70443d] font-bold uppercase tracking-wider pl-4">Companies</p>
                    <div className="flex flex-col gap-2">
                      {companies.length > 0 ? (
                        companies.map((company) => (
                          <div
                            key={company.id}
                            onMouseEnter={() => setActiveCompanyHover(company)}
                            className="relative"
                          >
                            <Link
                              to={`/products?company=${company.id}`}
                              className={`block rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${activeCompanyHover?.id === company.id ? 'bg-[#f8f5ee] text-[#b7774f] shadow-sm' : 'text-stone-600 hover:bg-[#f8f5ee] hover:text-stone-950'}`}
                            >
                              {company.name}
                            </Link>
                            {/* Active Indicator Line */}
                            {activeCompanyHover?.id === company.id && (
                              <span className="absolute bottom-0 left-4 right-4 h-[3px] rounded-t-full bg-gradient-to-r from-[#b7774f] to-[#70443d]" />
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="px-4 py-2 text-sm text-stone-500">No companies</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Lines */}
                  <div data-lenis-prevent className="w-1/2 flex flex-col pr-2 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#b7774f]/50">
                    <p className="micro-copy mb-4 text-[#70443d] font-bold uppercase tracking-wider pl-4">Product Lines</p>
                    <div className="flex flex-col gap-1">
                      {activeCompanyHover ? (
                        getCompanyLines(activeCompanyHover).length > 0 ? (
                          getCompanyLines(activeCompanyHover).map((line) => (
                            <Link
                              key={line.id}
                              to={`/products?company=${activeCompanyHover.id}&company_line=${line.id}`}
                              className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-[#f8f5ee] hover:text-stone-950"
                            >
                              {line.name}
                            </Link>
                          ))
                        ) : (
                          <p className="px-4 py-2 text-sm text-stone-400">No specific lines</p>
                        )
                      ) : (
                        <p className="px-4 py-2 text-sm text-stone-400">Hover a company</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {navItems.slice(2).map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Wide screens: a search bar (opens the search panel) */}
            <button
              type="button"
              onClick={openSearch}
              onPointerEnter={loadSearchPanel}
              onFocus={loadSearchPanel}
              aria-label="Search products"
              className={[
                // Gradient hairline ring comes from .search-pill in index.css
                'search-pill group hidden h-11 w-[13rem] items-center gap-2 rounded-full pl-4 pr-1 text-left transition-[background-color,box-shadow] duration-500 xl:flex 2xl:w-[16rem]',
                isDark
                  ? 'search-pill--dark bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-white/15 hover:shadow-[0_10px_30px_-12px_rgba(241,209,184,0.55)]'
                  : 'bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_18px_-12px_rgba(17,16,14,0.35)] hover:bg-white/80 hover:shadow-[0_10px_30px_-12px_rgba(183,119,79,0.6)]',
              ].join(' ')}
            >
              <span className={['min-w-0 flex-1 overflow-hidden text-[0.82rem]', isDark ? 'text-white/65' : 'text-stone-500'].join(' ')}>
                <span className="block truncate">
                  <TypingHint
                    words={searchHints}
                    wordClassName={[
                      'text-[0.78rem] font-semibold uppercase tracking-[0.1em]',
                      isDark ? 'text-[#f1d1b8]' : 'text-[#70443d]',
                    ].join(' ')}
                  />
                </span>
              </span>
              <span
                className={[
                  'grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300 group-hover:scale-105 group-hover:bg-[#b7774f] group-hover:text-white',
                  isDark ? 'bg-white text-stone-950' : 'bg-stone-950 text-white',
                ].join(' ')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-4.2-4.2" />
                </svg>
              </span>
            </button>

            {/* Smaller screens: just the icon */}
            <button
              type="button"
              onClick={openSearch}
              onPointerEnter={loadSearchPanel}
              onFocus={loadSearchPanel}
              aria-label="Search products"
              title="Search"
              className={['grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-500 xl:hidden', glassButtonClass].join(' ')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden="true" className="h-5 w-5">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4.2-4.2" />
              </svg>
            </button>

            <div className="hidden items-center gap-4 xl:flex">
              <Link
                to="/contact"
                className={[
                  'rounded-full border px-4 py-2 text-[0.88rem] font-semibold uppercase transition-colors duration-500',
                  isDark
                    ? 'border-white bg-white text-stone-950 hover:border-[#f1d1b8] hover:bg-[#f1d1b8]'
                    : 'border-stone-950/15 bg-stone-950 text-[#fffdf8] hover:border-[#70443d] hover:bg-[#70443d]',
                ].join(' ')}
              >
                Request Supply
              </Link>
            </div>

            <button
              type="button"
              className={['grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-500 lg:hidden', glassButtonClass].join(' ')}
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label="Toggle navigation"
            >
              <span className="relative h-4 w-5">
                <span
                  className={[
                    'absolute left-0 top-0 h-px w-5 bg-current transition',
                    open ? 'translate-y-2 rotate-45' : '',
                  ].join(' ')}
                />
                <span
                  className={[
                    'absolute left-0 top-2 h-px w-5 bg-current transition',
                    open ? 'opacity-0' : '',
                  ].join(' ')}
                />
                <span
                  className={[
                    'absolute bottom-0 left-0 h-px w-5 bg-current transition',
                    open ? '-translate-y-[7px] -rotate-45' : '',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>
        </nav>

        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-stone-950/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden pointer-events-auto ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-[101] w-[85vw] max-w-sm bg-[#fffdf8] shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col pointer-events-auto border-r border-[#ded8cc] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-5 sm:h-16 border-b border-[#ded8cc]">
          <span className="display-serif text-xl font-bold text-stone-950">Menu</span>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-stone-200/50 text-stone-950 transition hover:bg-stone-300/50"
            onClick={() => setOpen(false)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-bold uppercase transition-colors ${
                    isActive ? 'bg-[#f8f5ee] text-stone-950 shadow-sm border border-[#ded8cc]' : 'text-stone-700 hover:bg-stone-100'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="my-4 border-t border-[#ded8cc] pt-5">
              <p className="micro-copy px-2 pb-3 text-[#70443d] font-bold">Our Companies</p>
              <div className="grid gap-1">
                {companies.map((company) => {
                  const companyLines = getCompanyLines(company)

                  return (
                    <div key={company.id} className="mb-2">
                      <Link
                        to={`/products?company=${company.id}`}
                        className="block rounded-xl px-4 py-2.5 text-sm font-bold text-stone-800 bg-stone-100/50 transition hover:bg-stone-200"
                        onClick={() => setOpen(false)}
                      >
                        {company.name}
                      </Link>
                      {companyLines.length > 0 && (
                        <div className="pl-4 mt-1 border-l-2 border-stone-200 ml-6 grid gap-1">
                          {companyLines.map((line) => (
                            <Link
                              key={line.id}
                              to={`/products?company=${company.id}&company_line=${line.id}`}
                              className="block rounded-lg px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-100"
                              onClick={() => setOpen(false)}
                            >
                              {line.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stays mounted after the first open so it reopens instantly */}
      {searchLoaded ? (
        <Suspense fallback={null}>
          <SearchPanel open={searchOpen} onClose={closeSearch} />
        </Suspense>
      ) : null}
    </>
  )
}
