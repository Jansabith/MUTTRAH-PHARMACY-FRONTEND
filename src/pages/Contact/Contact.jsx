import { useEffect, useState } from 'react'
import { websiteAPI } from '../../services/api'
import Loader from '../../components/Loader/Loader'

const muttrahPharmacyMapUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.70020525746!2d58.542142999999996!3d23.615082400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e91f900164bdb5b%3A0x1c2403fc0d8bf5e1!2sMUTTRAH%20PHARMACY!5e1!3m2!1sen!2sin!4v1781096686549!5m2!1sen!2sin'

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
    <section className="section-padding bg-[#fffdf8]">
      <div className="container-shell">
        <div className="mb-12 grid gap-6 border-b border-[#ded8cc] pb-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="micro-copy text-[#70443d]">{pageContent.eyebrow}</p>
            <h1 className="display-serif page-title mt-4 text-stone-950">
              {pageContent.title}
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-stone-600 lg:justify-self-end lg:text-right">
            {pageContent.description}
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-5">
          <div className="grid gap-px overflow-hidden border border-[#ded8cc] bg-[#ded8cc]">
            {[
              [pageContent.address_label, pageContent.address],
              [pageContent.email_label, pageContent.email],
              [pageContent.phone_label, pageContent.phone],
            ].map(([label, value]) => (
              <article key={label} className="bg-[#fffdf8] p-5 sm:p-6">
                <p className="micro-copy text-[#70443d]">{label}</p>
                <p className="display-serif mt-3 break-words text-[1.85rem] leading-none text-stone-950 sm:text-3xl">
                  {value}
                </p>
              </article>
            ))}
          </div>

          {mapEmbedUrl ? (
            <iframe
              className="h-[22rem] w-full border border-[#ded8cc] bg-[#f8f5ee] sm:h-[26rem] lg:h-[30rem]"
              src={mapEmbedUrl}
              title={pageContent.map_title}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="soft-grid flex min-h-72 items-center justify-center border border-[#ded8cc] p-8 text-center">
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
        </div>
      </div>
    </section>
  )
}
