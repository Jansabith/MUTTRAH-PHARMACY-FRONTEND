import { useEffect, useState } from 'react'
import { websiteAPI } from '../../services/api'
import Loader from '../../components/Loader/Loader'
import { motion } from 'framer-motion'

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

  return (
    <section className="section-padding bg-[#fffdf8] min-h-screen">
      <div className="container-shell overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="mb-12 grid gap-6 border-b border-[#ded8cc] pb-10 lg:grid-cols-[1fr_0.8fr] lg:items-end"
        >
          <div>
            <p className="micro-copy text-[#70443d]">{pageContent.eyebrow}</p>
            <h1 className="display-serif page-title mt-4 text-stone-950">
              {pageContent.title}
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-stone-600 lg:justify-self-end lg:text-right">
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
            {[
              [pageContent.address_label, pageContent.address],
              [pageContent.email_label, pageContent.email],
              [pageContent.phone_label, pageContent.phone],
            ].map(([label, value], index) => (
              <motion.article 
                key={label + index} 
                variants={fadeUpVariant}
                whileHover={{ y: -5 }}
                className="bg-[#f8f5ee] p-6 sm:p-8 rounded-3xl border border-[#ded8cc] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <span className="mb-6 block h-1 w-12 rounded-full bg-[#b7774f]" />
                <p className="micro-copy text-[#70443d]">{label}</p>
                <p className="display-serif mt-4 break-words text-[1.45rem] leading-snug text-stone-950 sm:text-2xl">
                  {value}
                </p>
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
