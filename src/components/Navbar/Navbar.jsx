import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { companiesAPI } from '../../services/api'

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
  const lastScrollY = useRef(0)

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
      'rounded-full px-4 py-2 text-[0.88rem] font-semibold uppercase text-stone-800 transition',
      isActive
        ? 'bg-white/55 text-stone-950 shadow-sm shadow-stone-950/5'
        : 'hover:bg-white/40 hover:text-[#b7774f]',
    ].join(' ')

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
        <nav className="pointer-events-auto container-shell flex h-14 items-center justify-between gap-3 rounded-full border border-white/60 bg-[#fffdf8]/58 px-3 shadow-[0_24px_80px_rgba(17,16,14,0.14)] backdrop-blur-2xl ring-1 ring-[#ded8cc]/45 sm:h-16 sm:px-5 lg:gap-5">
          <Link
            to="/"
            className="display-serif min-w-0 flex-1 truncate text-xl leading-none text-stone-950 sm:text-3xl lg:flex-none"
            onClick={() => setOpen(false)}
            aria-label="Muttrah Pharmacy Home"
          >
            Muttrah Pharmacy
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
                  <div className="w-1/2 flex flex-col border-r border-[#ded8cc]/60 pr-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#b7774f]/50">
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
                  <div className="w-1/2 flex flex-col pr-2 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#b7774f]/50">
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

          <div className="hidden items-center gap-4 xl:flex">
            <Link
              to="/contact"
              className="rounded-full border border-stone-950/15 bg-stone-950 px-4 py-2 text-[0.88rem] font-semibold uppercase text-[#fffdf8] transition hover:border-[#70443d] hover:bg-[#70443d]"
            >
              Request Supply
            </Link>
          </div>

          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/70 bg-white/65 text-stone-950 shadow-sm backdrop-blur-xl transition hover:bg-white/85 lg:hidden"
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

        <div className="flex-1 overflow-y-auto p-5">
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
    </>
  )
}
