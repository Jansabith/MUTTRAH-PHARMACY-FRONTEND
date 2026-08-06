import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Loader from '../../components/Loader/Loader'
import useCatalogData from '../../hooks/useCatalogData'
import { websiteAPI, getMediaUrl } from '../../services/api'
import { motion } from 'framer-motion'
import SEO from '../../components/SEO/SEO'

const muttrahPharmacyMapUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.70020525746!2d58.542142999999996!3d23.615082400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e91f900164bdb5b%3A0x1c2403fc0d8bf5e1!2sMUTTRAH%20PHARMACY!5e1!3m2!1sen!2sin!4v1781096686549!5m2!1sen!2sin'

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

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
    <div className="overflow-hidden">
      <SEO
        title={pageContent.meta_title || "About Us"}
        description={pageContent.meta_description}
        keywords={pageContent.meta_keywords}
      />
      {/* Hero Section */}
      <section className="section-padding border-b border-[#ded8cc] bg-[#fffdf8]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <p className="micro-copy text-[#70443d]">{pageContent.eyebrow}</p>
            <h1 className="display-serif page-title mt-5 text-stone-950">
              {pageContent.title}
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col justify-end gap-6 sm:gap-8 pt-6 lg:pt-0"
          >
            {pageContent.hero_images?.length > 0 && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-lg border border-[#ded8cc] bg-[#f8f5ee]">
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
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-[#70443d] w-6' : 'bg-white/70 hover:bg-white'}`}
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
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section-padding bg-stone-950 text-[#fffdf8]">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container-shell grid gap-6 md:grid-cols-2"
        >
          <motion.article 
            variants={fadeUpVariant}
            className="bg-[#24211d] rounded-3xl p-8 sm:p-12 border border-white/10 hover:border-white/20 transition-colors shadow-2xl"
          >
            <p className="micro-copy text-[#d7b08d]">
              {pageContent.mission_title}
            </p>
            <h2 className="display-serif mt-6 text-4xl leading-tight sm:mt-8 sm:text-5xl md:text-6xl text-white/90">
              {pageContent.mission_text}
            </h2>
          </motion.article>
          <motion.article 
            variants={fadeUpVariant}
            className="bg-[#24211d] rounded-3xl p-8 sm:p-12 border border-white/10 hover:border-white/20 transition-colors shadow-2xl"
          >
            <p className="micro-copy text-[#d7b08d]">
              {pageContent.vision_title}
            </p>
            <h2 className="display-serif mt-6 text-4xl leading-tight sm:mt-8 sm:text-5xl md:text-6xl text-white/90">
              {pageContent.vision_text}
            </h2>
          </motion.article>
        </motion.div>
      </section>

      {/* Pillars Section */}
      <section className="section-padding border-b border-[#ded8cc] bg-[#f8f5ee]">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container-shell grid gap-6 lg:grid-cols-3"
        >
          {[
            [pageContent.warehouse_title, pageContent.warehouse_text],
            [pageContent.network_title, pageContent.network_text],
            [pageContent.why_title, pageContent.why_text],
          ].map(([title, copy], index) => (
            <motion.article 
              key={index} 
              variants={fadeUpVariant}
              whileHover={{ y: -5 }}
              className="bg-[#fffdf8] rounded-3xl p-8 sm:p-10 border border-[#ded8cc] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <span className="mb-8 block h-1 w-16 rounded-full bg-[#b7774f] sm:mb-10" />
              <h2 className="display-serif text-3xl leading-tight text-stone-950 sm:text-4xl">
                {title}
              </h2>
              <p className="mt-6 leading-7 text-stone-600">{copy}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* Brands Section */}
      <section className="section-padding bg-[#fffdf8]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <p className="micro-copy text-[#70443d]">
              {pageContent.brands_eyebrow}
            </p>
            <h2 className="display-serif section-title mt-5 text-stone-950">
              {pageContent.brands_title}
            </h2>
          </motion.div>
          <div>
            {loading ? <Loader label="Loading represented brands" /> : null}
            {!loading ? (
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="grid gap-4 sm:grid-cols-2"
              >
                {companies.slice(0, 8).map((company) => (
                  <motion.article 
                    key={company.id} 
                    variants={fadeUpVariant}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#fffdf8] rounded-2xl p-6 border border-[#ded8cc] shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <h3 className="display-serif text-[1.85rem] leading-none text-stone-950 sm:text-3xl">
                      {company.name}
                    </h3>
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600">
                      {company.description || 'Managed in Django Admin.'}
                    </p>
                  </motion.article>
                ))}
              </motion.div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="section-padding bg-[#f8f5ee] border-t border-[#ded8cc]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
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
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <iframe
              className="h-[22rem] w-full rounded-3xl shadow-lg border border-[#ded8cc] bg-[#f8f5ee] sm:h-[26rem] lg:h-[30rem]"
              src={pageContent.location_map_url || muttrahPharmacyMapUrl}
              title={pageContent.location_title || "Muttrah Pharmacy Location"}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#70443d] py-16 text-[#fffdf8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="container-shell relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 className="display-serif text-5xl leading-none sm:text-6xl">
              Explore the live catalog.
            </h2>
            <p className="mt-4 text-[#f1d1b8] text-lg">
              Every product card is API-driven from the Django backend.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex w-full justify-center rounded-full bg-[#fffdf8] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#70443d] transition-all hover:bg-[#f1d1b8] hover:scale-105 active:scale-95 shadow-xl sm:w-fit"
          >
            View Products
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
