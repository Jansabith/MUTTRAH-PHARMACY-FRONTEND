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
  const lastScrollY = useRef(0)

  useEffect(() => {
    let active = true

    async function loadCompanies() {
      try {
        const companyList = await companiesAPI.getAll()
        if (active) setCompanies(companyList)
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
                className="absolute left-1/2 top-full h-5 w-72 -translate-x-1/2 xl:w-80"
                aria-hidden="true"
              />
              <div className="invisible absolute left-1/2 top-full z-10 w-72 -translate-x-1/2 translate-y-4 overflow-visible rounded-xl border border-[#ded8cc] bg-[#fffdf8] p-2 opacity-0 shadow-lg shadow-stone-950/10 transition duration-300 ease-out group-hover:visible group-hover:translate-y-3 group-hover:opacity-100 xl:w-80">
                <div className="border-b border-[#ded8cc]/80 px-4 py-3">
                  <p className="micro-copy text-[#70443d]">Select company</p>
                </div>
                <div className="py-2">
                  {companies.length > 0 ? (
                    companies.map((company) => {
                      const companyLines = getCompanyLines(company)

                      return (
                        <div key={company.id} className="group/company relative">
                          <Link
                            to={`/products?company=${company.id}`}
                            className="flex items-center justify-between gap-4 rounded-full px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-[#f8f5ee] hover:text-stone-950 group-hover/company:bg-[#f8f5ee] group-hover/company:text-stone-950"
                          >
                            <span>{company.name}</span>
                            {companyLines.length > 0 ? (
                              <span className="text-xs text-stone-500">&gt;</span>
                            ) : null}
                          </Link>

                          {companyLines.length > 0 ? (
                            <>
                              <span
                                className="absolute left-full top-0 h-full w-3"
                                aria-hidden="true"
                              />
                              <div className="invisible absolute left-full top-0 z-20 ml-3 w-52 translate-x-2 rounded-xl border border-[#ded8cc] bg-[#fffdf8] p-2 opacity-0 shadow-lg shadow-stone-950/10 transition duration-300 ease-out group-hover/company:visible group-hover/company:translate-x-0 group-hover/company:opacity-100 xl:w-60">
                                <div className="border-b border-[#ded8cc]/80 px-4 py-3">
                                  <p className="micro-copy text-[#70443d]">
                                    Select line
                                  </p>
                                </div>
                                <div className="py-2">
                                  {companyLines.map((line) => (
                                    <Link
                                      key={line.id}
                                      to={`/products?company=${company.id}&company_line=${line.id}`}
                                      className="block rounded-full px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-[#f8f5ee] hover:text-stone-950"
                                    >
                                      {line.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      )
                    })
                  ) : (
                    <p className="px-3 py-3 text-sm text-stone-500">
                      No companies available
                    </p>
                  )}
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

        {open ? (
          <div className="pointer-events-auto container-shell mt-2 max-h-[calc(100svh-5rem)] overflow-y-auto rounded-[1.5rem] border border-white/60 bg-[#fffdf8]/90 p-3 shadow-2xl shadow-stone-950/12 backdrop-blur-2xl ring-1 ring-[#ded8cc]/45 sm:rounded-[2rem] lg:hidden">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="my-2 border-t border-[#ded8cc]/80 pt-3">
                <p className="micro-copy px-2 pb-2 text-[#70443d]">Companies</p>
                {companies.map((company) => {
                  const companyLines = getCompanyLines(company)

                  return (
                    <div key={company.id}>
                      <Link
                        to={`/products?company=${company.id}`}
                        className="block rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white/60"
                        onClick={() => setOpen(false)}
                      >
                        {company.name}
                      </Link>
                      {companyLines.map((line) => (
                        <Link
                          key={line.id}
                          to={`/products?company=${company.id}&company_line=${line.id}`}
                          className="ml-4 block rounded-full px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white/60"
                          onClick={() => setOpen(false)}
                        >
                          {line.name}
                        </Link>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
