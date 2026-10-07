import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_KEYWORDS,
  SITE_URL,
  formatTitle,
} from './siteMeta'

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
//
// type: the og:type, "website" unless a page says otherwise ("product").
export default function SEO({ title, description, keywords, image, schema, canonical, noIndex, type = 'website' }) {
  const metaTitle = formatTitle(title)
  const metaDesc = description || DEFAULT_DESCRIPTION
  const metaKeywords = keywords || DEFAULT_KEYWORDS
  const metaImage = image || DEFAULT_IMAGE
  const canonicalUrl = canonical || `${SITE_URL}${window.location.pathname}`

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
      <meta property="og:type" content={type} />
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
