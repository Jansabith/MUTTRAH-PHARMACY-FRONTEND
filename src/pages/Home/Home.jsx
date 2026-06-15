import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import HeroSection from '../../components/HeroSection/HeroSection'
import Loader from '../../components/Loader/Loader'
import useCatalogData from '../../hooks/useCatalogData'
import { websiteAPI } from '../../services/api'

export default function Home() {
  const { companies, loading, error } = useCatalogData()
  const [pageContent, setPageContent] = useState(null)
  const featuredCompanies = companies.slice(0, 8)
  const features = useMemo(
    () => pageContent?.features || [],
    [pageContent?.features],
  )

  const trustItems = useMemo(
    () => pageContent?.trust_items || [],
    [pageContent?.trust_items],
  )

  useEffect(() => {
    let active = true

    async function loadPageContent() {
      try {
        const data = await websiteAPI.getHome()
        if (active) {
          setPageContent(data)
        }
      } catch {
        if (active) setPageContent({})
      }
    }

    loadPageContent()

    return () => {
      active = false
    }
  }, [])

  if (!pageContent) {
    return <Loader label="Loading Muttrah Pharmacy..." />
  }

  return (
    <>
      <HeroSection content={pageContent} />

      <section className="section-padding border-b border-[#ded8cc] bg-[#fffdf8]">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="w-full">
            <p className="micro-copy text-[#70443d]">
              {pageContent.intro_eyebrow}
            </p>
            <h2 className="display-serif section-title mt-5 max-w-4xl text-stone-950">
              {pageContent.intro_title}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 w-full min-w-0">
            {features.map((item) => (
              <article
                key={item.title}
                className="border border-[#ded8cc] bg-[#f8f5ee] p-5 sm:p-6"
              >
                <span className="mb-8 block h-px w-16 bg-[#b7774f]" />
                <h3 className="display-serif text-[1.85rem] leading-none text-stone-950 sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-stone-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding home-mobile-section-break border-b border-[#ded8cc] bg-[#f8f5ee]">
        <div className="container-shell">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl w-full min-w-0">
              <p className="micro-copy text-[#70443d]">
                {pageContent.brands_eyebrow}
              </p>
              <h2 className="display-serif section-title mt-5 text-stone-950">
                {pageContent.brands_title}
              </h2>
              {pageContent.brands_description && (
                <p className="mt-6 text-base md:text-lg text-stone-600 leading-relaxed max-w-2xl">
                  {pageContent.brands_description}
                </p>
              )}
            </div>
            <Link
              to="/products"
              className="inline-flex w-fit md:mt-16 rounded-full border border-stone-950 px-5 py-3 text-xs font-bold uppercase text-stone-950 transition hover:bg-stone-950 hover:text-[#fffdf8] shrink-0"
            >
              View All Products
            </Link>
          </div>

          {loading ? <Loader /> : null}
          {error ? (
            <div className="border border-[#70443d]/30 bg-[#fffdf8] p-5 text-sm font-semibold text-[#70443d]">
              {error}
            </div>
          ) : null}
          {!loading && !error ? (
            <div className="grid auto-rows-[15.5rem] gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
              {featuredCompanies.map((company, index) => (
                <article
                  key={company.id}
                  className="brand-card-reveal group flex h-full flex-col border border-[#ded8cc] bg-[#fffdf8] p-5 shadow-sm shadow-stone-950/0 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#b7774f] hover:shadow-xl hover:shadow-stone-950/10 sm:p-6"
                  style={{ animationDelay: `${index * 260}ms` }}
                >
                  <span className="mb-7 block h-px w-12 bg-[#b7774f] transition-all duration-300 group-hover:w-20" />
                  <h3 className="display-serif break-words text-[1.85rem] leading-none text-stone-950 sm:text-3xl">
                    {company.name}
                  </h3>
                  <p className="mt-5 line-clamp-4 text-sm leading-6 text-stone-600">
                    {company.description}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section-padding border-b border-[#ded8cc] bg-stone-950 text-[#fffdf8]">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="w-full min-w-0">
            <p className="micro-copy text-[#d7b08d]">
              {pageContent.trust_eyebrow}
            </p>
            <h2 className="display-serif section-title mt-5">
              {pageContent.trust_title}
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 w-full min-w-0">
            {trustItems.map((item, index) => (
              <div
                key={item.id || item.title}
                className="bg-stone-950 p-6 sm:p-8 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm font-semibold tracking-wider text-[#d7b08d]">
                    0{index + 1}
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <h3 className="display-serif mt-8 text-2xl leading-snug text-white sm:text-3xl">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#70443d] py-20 text-[#fffdf8]">
        <div className="container-shell flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="w-full min-w-0">
            <p className="micro-copy text-[#f1d1b8]">{pageContent.cta_eyebrow}</p>
            <h2 className="display-serif mt-4 max-w-3xl text-5xl leading-none sm:text-6xl md:text-7xl">
              {pageContent.cta_title}
            </h2>
          </div>
          <Link
            to="/contact"
            className="inline-flex w-full justify-center rounded-full border border-[#fffdf8] px-6 py-4 text-xs font-bold uppercase transition hover:bg-[#fffdf8] hover:text-[#70443d] sm:w-fit"
          >
            {pageContent.cta_button_label}
          </Link>
        </div>
      </section>
    </>
  )
}
