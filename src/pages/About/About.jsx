import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Loader from '../../components/Loader/Loader'
import useCatalogData from '../../hooks/useCatalogData'
import { websiteAPI, getMediaUrl } from '../../services/api'

const muttrahPharmacyMapUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.70020525746!2d58.542142999999996!3d23.615082400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e91f900164bdb5b%3A0x1c2403fc0d8bf5e1!2sMUTTRAH%20PHARMACY!5e1!3m2!1sen!2sin!4v1781096686549!5m2!1sen!2sin'

export default function About() {
  const { companies, loading } = useCatalogData()
  const [pageContent, setPageContent] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!pageContent?.hero_images || pageContent.hero_images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % pageContent.hero_images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [pageContent?.hero_images])

  useEffect(() => {
    let active = true

    async function loadPageContent() {
      try {
        const data = await websiteAPI.getAbout()
        if (active) setPageContent(data)
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
    return <Loader label="Loading About Us..." />
  }

  return (
    <>
      <section className="section-padding border-b border-[#ded8cc] bg-[#fffdf8]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="micro-copy text-[#70443d]">{pageContent.eyebrow}</p>
            <h1 className="display-serif page-title mt-5 text-stone-950">
              {pageContent.title}
            </h1>
          </div>
          <div className="flex flex-col justify-end gap-6 sm:gap-8 pt-6 lg:pt-0">
            {pageContent.hero_images?.length > 0 && (
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#ded8cc] bg-[#f8f5ee]">
                <div
                  className="flex h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                  {pageContent.hero_images.map((img) => (
                    <img
                      key={img.id}
                      src={getMediaUrl(img.image)}
                      alt="About Muttrah Pharmacy"
                      className="h-full w-full flex-shrink-0 object-cover"
                    />
                  ))}
                </div>
                {pageContent.hero_images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {pageContent.hero_images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${i === currentImageIndex ? 'bg-[#70443d]' : 'bg-white/60 hover:bg-white/80'}`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-xl sm:leading-9">
              {pageContent.overview}
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding border-b border-[#ded8cc] bg-stone-950 text-[#fffdf8]">
        <div className="container-shell grid gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-2">
          <article className="bg-stone-950 p-6 sm:p-8">
            <p className="micro-copy text-[#d7b08d]">
              {pageContent.mission_title}
            </p>
            <h2 className="display-serif mt-6 text-4xl leading-none sm:mt-8 sm:text-5xl md:text-6xl">
              {pageContent.mission_text}
            </h2>
          </article>
          <article className="bg-stone-950 p-6 sm:p-8">
            <p className="micro-copy text-[#d7b08d]">
              {pageContent.vision_title}
            </p>
            <h2 className="display-serif mt-6 text-4xl leading-none sm:mt-8 sm:text-5xl md:text-6xl">
              {pageContent.vision_text}
            </h2>
          </article>
        </div>
      </section>

      <section className="section-padding border-b border-[#ded8cc] bg-[#f8f5ee]">
        <div className="container-shell grid gap-px overflow-hidden border border-[#ded8cc] bg-[#ded8cc] lg:grid-cols-3">
          {[
            [pageContent.warehouse_title, pageContent.warehouse_text],
            [pageContent.network_title, pageContent.network_text],
            [pageContent.why_title, pageContent.why_text],
          ].map(([title, copy]) => (
            <article key={title} className="bg-[#fffdf8] p-6 sm:p-8">
              <span className="mb-8 block h-px w-20 bg-[#b7774f] sm:mb-10" />
              <h2 className="display-serif text-3xl leading-none text-stone-950 sm:text-4xl">
                {title}
              </h2>
              <p className="mt-6 leading-7 text-stone-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-padding border-b border-[#ded8cc] bg-[#fffdf8]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="micro-copy text-[#70443d]">
              {pageContent.brands_eyebrow}
            </p>
            <h2 className="display-serif section-title mt-5 text-stone-950">
              {pageContent.brands_title}
            </h2>
          </div>
          <div>
            {loading ? <Loader label="Loading represented brands" /> : null}
            {!loading ? (
              <div className="grid gap-px overflow-hidden border border-[#ded8cc] bg-[#ded8cc] sm:grid-cols-2">
                {companies.slice(0, 8).map((company) => (
                  <article key={company.id} className="bg-[#fffdf8] p-5">
                    <h3 className="display-serif text-[1.85rem] leading-none text-stone-950 sm:text-3xl">
                      {company.name}
                    </h3>
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600">
                      {company.description || 'Managed in Django Admin.'}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>



      <section className="section-padding border-b border-[#ded8cc] bg-[#fffdf8]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="micro-copy text-[#70443d]">
              {pageContent.location_eyebrow || 'Our Location'}
            </p>
            <h2 className="display-serif section-title mt-5 text-stone-950">
              {pageContent.location_title || 'Visit Us in Muttrah'}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">
              {pageContent.location_description ||
                'Our headquarters and main distribution center are strategically located to serve the healthcare community efficiently.'}
            </p>
          </div>
          <div>
            <iframe
              className="h-[22rem] w-full border border-[#ded8cc] bg-[#f8f5ee] sm:h-[26rem] lg:h-[30rem]"
              src={pageContent.location_map_url || muttrahPharmacyMapUrl}
              title={pageContent.location_title || "Muttrah Pharmacy Location"}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#70443d] py-16 text-[#fffdf8]">
        <div className="container-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="display-serif text-5xl leading-none sm:text-6xl">
              Explore the live catalog.
            </h2>
            <p className="mt-4 text-[#f1d1b8]">
              Every product card is API-driven from the Django backend.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex w-full justify-center rounded-full border border-[#fffdf8] px-6 py-4 text-xs font-bold uppercase transition hover:bg-[#fffdf8] hover:text-[#70443d] sm:w-fit"
          >
            View Products
          </Link>
        </div>
      </section>
    </>
  )
}
