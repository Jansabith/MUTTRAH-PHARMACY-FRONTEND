import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMediaUrl, websiteAPI } from '../../services/api'

// Dark layer over the optional background image ("Background shade" in the admin)
const SHADE_CLASSES = {
  light: 'bg-stone-950/55',
  medium: 'bg-stone-950/75',
  strong: 'bg-stone-950/90',
}

export default function Footer() {
  const [footerContent, setFooterContent] = useState(null)

  useEffect(() => {
    let active = true

    async function loadFooterContent() {
      try {
        const data = await websiteAPI.getFooter()
        if (active) {
          setFooterContent({
            ...data,
            quick_links: data.quick_links?.length
              ? data.quick_links.map((link) => ({
                  ...link,
                  to: link.url,
                }))
              : [],
            social_links: data.social_links?.length
              ? data.social_links
              : [],
          })
        }
      } catch {
        if (active) setFooterContent({})
      }
    }

    loadFooterContent()

    return () => {
      active = false
    }
  }, [])

  if (!footerContent) return null

  const quickLinks = footerContent.quick_links || []
  const socialLinks = footerContent.social_links || []
  // Each detail can have more than one value (e.g. two emails), one per line
  const contactDetails = [
    { label: 'Address', values: [footerContent.address] },
    { label: 'Email', values: [footerContent.email, footerContent.email_2] },
    { label: 'Mobile', values: [footerContent.phone] },
    { label: 'Telephone', values: [footerContent.telephone] },
  ]
    .map((item) => ({ ...item, values: item.values.filter(Boolean) }))
    .filter((item) => item.values.length)
  const backgroundUrl = getMediaUrl(footerContent.background_image)

  return (
    <footer className="relative isolate overflow-hidden bg-stone-950 text-[#fffdf8]">
      {backgroundUrl ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <img
            src={backgroundUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div
            className={`absolute inset-0 ${SHADE_CLASSES[footerContent.background_shade] || SHADE_CLASSES.medium}`}
          />
          {/* Deeper at the top and bottom so the edges blend into the page */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-transparent to-stone-950/80" />
        </div>
      ) : null}
      <div className="container-shell grid gap-10 py-16 md:grid-cols-[1.35fr_0.65fr_1fr]">
        <div>
          <p className="display-serif text-6xl leading-none md:text-7xl">
            {footerContent.brand_title}
          </p>
          <p className="mt-6 max-w-lg text-sm leading-7 text-stone-300">
            {footerContent.brand_description}
          </p>
        </div>

        <div>
          <h2 className="micro-copy text-[#d7b08d]">
            {footerContent.quick_links_title}
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-stone-300">
            {quickLinks.map((link) => (
              <li key={`${link.label}-${link.to || link.url}`}>
                {(link.to || link.url || '').startsWith('/') ? (
                  <Link
                    className="transition hover:text-[#fffdf8]"
                    to={link.to || link.url}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    className="transition hover:text-[#fffdf8]"
                    href={link.to || link.url || '#top'}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="micro-copy text-[#d7b08d]">
            {footerContent.contact_title}
          </h2>
          <div className="mt-6 grid gap-4 text-left">
            {contactDetails.map((item) => (
              <div key={item.label}>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#d7b08d]">
                  {item.label}
                </p>
                {item.values.map((value) => (
                  <p key={value} className="mt-1 break-words text-sm leading-6 text-stone-300">
                    {value}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-7 flex gap-3">
            {socialLinks.map((item) => (
              <a
                key={`${item.label}-${item.url}`}
                href={item.url || '#top'}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xs font-bold uppercase text-[#fffdf8] transition hover:border-[#d7b08d] hover:text-[#d7b08d]"
                aria-label={`Social link ${item.label}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-shell flex flex-col gap-2 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>{footerContent.copyright_text}</p>
          <p>{footerContent.bottom_note}</p>
        </div>
      </div>
    </footer>
  )
}
