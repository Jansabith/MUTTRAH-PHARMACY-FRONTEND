import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, keywords, image, schema }) {
  const defaultTitle = 'Muttrah Pharmacy | Medical & Orthopedic Distributor in Oman'
  const defaultDesc = 'Muttrah Pharmacy is a leading distributor and warehouse partner for clinics, hospitals, and pharmacies sourcing quality pharmaceutical and orthopedic products in Oman.'
  const defaultKeywords = 'Muttrah Pharmacy, pharmacy Oman, orthopedic distributor Oman, medical supplies Muscat, pharmaceutical wholesaler Oman, bulk medicines Muscat'
  const defaultImage = 'https://muttrahpharmacy.com/og-image.jpg' // Fallback image

  const metaTitle = title ? `${title} | Muttrah Pharmacy` : defaultTitle
  const metaDesc = description || defaultDesc
  const metaKeywords = keywords || defaultKeywords
  const metaImage = image || defaultImage

  return (
    <Helmet>
      {/* General tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={metaKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={window.location.href} />

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
