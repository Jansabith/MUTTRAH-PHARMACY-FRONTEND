// Shared by the app (SEO.jsx, ProductDetail.jsx) and the build-time
// pre-render (scripts/prerender.mjs), so a page's static HTML and the tags
// the app sets once it starts always say the same thing. Plain JS only:
// Node imports this file directly.

// Always the main domain, never the address the visitor used (e.g. www.),
// so every copy of a page points search engines at one official URL
export const SITE_URL = 'https://muttrahpharmacy.com'
export const SITE_NAME = 'Muttrah Pharmacy'

export const DEFAULT_TITLE = 'Muttrah Pharmacy | Medical & Orthopedic Distributor in Oman'
export const DEFAULT_DESCRIPTION =
  'Muttrah Pharmacy is a leading distributor and warehouse partner for clinics, hospitals, and pharmacies sourcing quality pharmaceutical and orthopedic products in Oman.'
export const DEFAULT_KEYWORDS =
  'Muttrah Pharmacy, pharmacy Oman, orthopedic distributor Oman, medical supplies Muscat, pharmaceutical wholesaler Oman, bulk medicines Muscat'
export const DEFAULT_IMAGE = `${SITE_URL}/muttrah_logo_480.webp`

// Don't repeat the brand when a custom title already includes it
export function formatTitle(title) {
  if (!title) return DEFAULT_TITLE
  return /muttrah pharmacy/i.test(title) ? title : `${title} | ${SITE_NAME}`
}

export const productUrl = (slug) => `${SITE_URL}/products/${slug}`

// No "offers": the site shows no prices, and Google rejects an offer
// without one. imageUrls: main image first, then the gallery.
export function productSchema(product, imageUrls) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrls,
    url: productUrl(product.slug),
    category: product.category_name,
    brand: { '@type': 'Brand', name: product.company_name },
  }
}

export function productBreadcrumbSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl(product.slug) },
    ],
  }
}
