import { useEffect, useState } from 'react'
import { websiteAPI } from '../../services/api'
import Loader from '../../components/Loader/Loader'
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

export default function Contact() {
  const [pageContent, setPageContent] = useState(null)

  useEffect(() => {
    let active = true

    async function loadPageContent() {
      try {
        const data = await websiteAPI.getContact()
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
    return <Loader label="Loading Contact Us..." />
  }

  const mapEmbedUrl = (
    pageContent.google_maps_embed_url || muttrahPharmacyMapUrl
  ).replace('!5e0', '!5e1')

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    'name': 'Muttrah Pharmacy',
    'image': 'https://muttrahpharmacy.com/muttrah_logo_480.webp',
    'telephone': pageContent.phone || '+968 9979 3939',
    'email': pageContent.email || 'info@muttrahpharmacy.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': pageContent.address || 'Muttrah, Muscat',
      'addressLocality': 'Muscat',
      'addressRegion': 'Muttrah',
      'postalCode': '114',
      'addressCountry': 'OM'
    }
  }

  return (
    <section className="section-padding bg-[#fffdf8] min-h-screen">
      <SEO
        title={pageContent.meta_title || "Contact Us"}
        description={pageContent.meta_description}
        keywords={pageContent.meta_keywords}
        schema={contactSchema}
      />
      <div className="container-shell overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="mb-12 flex flex-col items-center text-center gap-6 border-b border-[#ded8cc] pb-10"
        >
          <div>
            <p className="micro-copy section-eyebrow text-[#70443d]">{pageContent.eyebrow}</p>
            <h1 className="sr-only">{pageContent.meta_title || 'Contact Us'}</h1>
          </div>
          <p className="max-w-3xl text-xl font-semibold leading-8 text-stone-800 mx-auto sm:text-2xl sm:leading-9 lg:text-3xl lg:leading-snug">
            {pageContent.description}
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl space-y-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-3"
          >
            {/* Second email / phone are optional; each value gets its own line */}
            {[
              { type: 'address', label: pageContent.address_label, values: [pageContent.address] },
              { type: 'email', label: pageContent.email_label, values: [pageContent.email, pageContent.email_2] },
              { type: 'phone', label: pageContent.phone_label, values: [pageContent.phone, pageContent.phone_2] },
            ].map(({ type, label, values }) => (
              <motion.article
                key={type}
                variants={fadeUpVariant}
                whileHover={{ y: -5 }}
                className="bg-[#f8f5ee] p-6 sm:p-8 rounded-3xl border border-[#ded8cc] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <span className="mb-6 block h-1 w-12 rounded-full bg-[#b7774f]" />
                <p className="micro-copy text-[#70443d]">{label}</p>
                <div className="mt-4 space-y-2">
                  {values.filter(Boolean).map((value) => {
                    if (type === 'address') {
                      return (
                        <p key={value} className="display-serif break-words text-[1.45rem] leading-snug text-stone-950 sm:text-2xl">
                          {value}
                        </p>
                      )
                    }
                    const href = type === 'email' ? `mailto:${value}` : `tel:${value.replace(/[^\d+]/g, '')}`
                    return (
                      <a
                        key={value}
                        href={href}
                        className={[
                          'display-serif block break-words leading-snug text-stone-950 transition-colors hover:text-[#b7774f]',
                          // Emails are long, so a size that keeps them on one line
                          type === 'email' ? 'text-lg sm:text-xl' : 'text-[1.45rem] sm:text-2xl',
                        ].join(' ')}
                      >
                        {value}
                      </a>
                    )
                  })}
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            {mapEmbedUrl ? (
              <iframe
                className="h-[22rem] w-full rounded-3xl shadow-lg border border-[#ded8cc] bg-[#f8f5ee] sm:h-[26rem] lg:h-[30rem]"
                src={mapEmbedUrl}
                title={pageContent.map_title}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="soft-grid flex min-h-72 rounded-3xl items-center justify-center border border-[#ded8cc] p-8 text-center bg-[#f8f5ee] shadow-inner">
                <div>
                  <p className="micro-copy text-[#70443d]">Google Maps</p>
                  <h2 className="display-serif mt-4 text-4xl leading-none text-stone-950 sm:text-5xl">
                    {pageContent.map_title}
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600">
                    {pageContent.map_description}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
