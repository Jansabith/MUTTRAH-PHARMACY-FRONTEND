import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

// index.html carries its own static title/description/OG tags, so visitors
// whose browser never runs this app's JavaScript (WhatsApp/Facebook link
// previews, some crawlers) still get a sensible title and description. Once
// the app actually starts, those tags would otherwise sit in the page
// alongside the real, page-specific ones below - and for things like the
// description tag, a search engine reading two of them may just use
// whichever comes first, which could be the generic static one instead of
// a page's own. So the first real page to mount removes them.
let removedStaticFallbackTags = false

function removeStaticFallbackTags() {
  if (removedStaticFallbackTags) return
  removedStaticFallbackTags = true
  document.querySelectorAll('[data-default="true"]').forEach((tag) => tag.remove())
}

// canonical: the "official" address of this page, when it differs from the
// plain origin + pathname (e.g. the Products page keeps its ?company=...
// filters in the canonical link, but drops ?search=... and tracking params).
// Leave empty to use the default (current pathname, no query string).
//
// noIndex: true keeps a page out of Google (e.g. search results), and
// suppresses the canonical link, since a page that must not be indexed
// doesn't need one.
export default function SEO({ title, description, keywords, image, schema, canonical, noIndex }) {
  const defaultTitle = 'Muttrah Pharmacy | Medical & Orthopedic Distributor in Oman'
  const defaultDesc = 'Muttrah Pharmacy is a leading distributor and warehouse partner for clinics, hospitals, and pharmacies sourcing quality pharmaceutical and orthopedic products in Oman.'
  const defaultKeywords = 'Muttrah Pharmacy, pharmacy Oman, orthopedic distributor Oman, medical supplies Muscat, pharmaceutical wholesaler Oman, bulk medicines Muscat'
  const defaultImage = 'https://muttrahpharmacy.com/muttrah_logo_480.webp' // Fallback image

  // Don't repeat the brand when a custom SEO title already includes it
  const metaTitle = !title
    ? defaultTitle
    : /muttrah pharmacy/i.test(title)
      ? title
      : `${title} | Muttrah Pharmacy`
  const metaDesc = description || defaultDesc
  const metaKeywords = keywords || defaultKeywords
  const metaImage = image || defaultImage
  const canonicalUrl = canonical || `${window.location.origin}${window.location.pathname}`

  useEffect(() => {
    removeStaticFallbackTags()
  }, [])

  return (
    <Helmet>
      {/* General tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={metaKeywords} />
      {noIndex ? (
        // Thin or constantly-changing pages (e.g. a search result) shouldn't be indexed
        <meta name="robots" content="noindex, follow" />
      ) : (
        // Tells Google which address is the "real" one when a page can be
        // reached through several URLs (old ?company=7 links, tracking
        // params, etc.), so ranking isn't split between them
        <link rel="canonical" href={canonicalUrl} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {/* JSON-LD Schema markup */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
