// Build-time pre-render: writes one static HTML file per sitemap URL, each
// with its own title, meta/OG/Twitter tags, canonical, JSON-LD and a plain
// H1 + text body, so crawlers and link previews that don't run JavaScript
// see the real page. In the browser React replaces the body on start and
// SEO.jsx removes these head tags (they carry data-default="true").
//
// Runs after `vite build` (npm run build), or alone on an existing dist to
// refresh content after products change (npm run prerender).
//
// Output (served by nginx.conf):
//   dist/_shell.html                    untouched app shell, fallback for any other URL
//   dist/index.html                     home
//   dist/{about,contact,products}/index.html
//   dist/products/<slug>/index.html     one per product
//   dist/_pre/products/<query>.html     brand/category pages, e.g. company=tynor.html

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
  formatTitle,
  productBreadcrumbSchema,
  productSchema,
  productUrl,
} from '../src/components/SEO/siteMeta.js'

const API = (process.env.PRERENDER_API_URL || 'https://api.muttrahpharmacy.com/api').replace(/\/+$/, '')
const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const GENERATED_DIRS = ['about', 'contact', 'products', '_pre']

// A visitor's browser runs this at once and hides the plain pre-rendered
// text, so it doesn't flash on screen before the app replaces it. Crawlers
// that don't run JavaScript never apply it and still read the text.
const HIDE_FROM_BROWSERS = `<script>document.documentElement.setAttribute('data-js', '')</script>
    <style>[data-js] #prerendered { display: none }</style>`

// ---------- data ----------

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} from ${url}`)
  return response.json()
}

const asList = (data) => (Array.isArray(data) ? data : data.results || [])

async function getAllProducts() {
  const products = []
  let url = `${API}/products/?page_size=100`
  while (url) {
    const page = await getJson(url)
    products.push(...page.results)
    url = page.next
  }
  return products
}

// ---------- html helpers ----------

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

// JSON inside <script>: "<" escaped so text like "</script>" can't end the tag
const jsonLd = (schema) => JSON.stringify(schema).replace(/</g, '\\u003c')

const link = (href, text) => `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`
const paragraph = (text) => (text ? `<p>${escapeHtml(text)}</p>` : '')

function headTags({ title, description, canonical, image, type = 'website', schema }) {
  const metaTitle = formatTitle(title)
  const metaDescription = description || DEFAULT_DESCRIPTION
  const metaImage = image || DEFAULT_IMAGE
  const tags = [
    `<title>${escapeHtml(metaTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(metaDescription)}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:type" content="${escapeHtml(type)}">`,
    `<meta property="og:title" content="${escapeHtml(metaTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(metaDescription)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(metaImage)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(metaTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(metaDescription)}">`,
    `<meta name="twitter:image" content="${escapeHtml(metaImage)}">`,
  ]
  if (schema) tags.push(`<script type="application/ld+json">${jsonLd(schema)}</script>`)
  // The marker that makes SEO.jsx remove these once the app is running
  return tags.map((tag) => tag.replace(/^<(\w+)/, '<$1 data-default="true"')).join('\n    ')
}

// ---------- page builders ----------

function createSite({ products, companies, categories, home, about, contact }) {
  const companyById = new Map(companies.map((company) => [company.id, company]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  // Same addresses as the sitemap (backend/sitemaps.py) and the app's links
  const brandPath = (company) => `/products?company=${company.slug}`
  const categoryPath = (category) => {
    const company = companyById.get(category.company)
    return company
      ? `/products?company=${company.slug}&category=${category.slug}`
      : `/products?category=${category.slug}`
  }

  const productImages = (product) => {
    const urls = [product.image, ...(product.gallery || []).map((item) => item?.image || item)].filter(Boolean)
    return [...new Set(urls)]
  }

  const productList = (items) =>
    items.length
      ? `<ul>${items
          .map((product) => `<li>${link(`/products/${product.slug}`, product.name)} – ${escapeHtml([product.company_name, product.category_name].filter(Boolean).join(' · '))}</li>`)
          .join('')}</ul>`
      : '<p>No products are currently listed here.</p>'

  // Shared header and footer give every page links to the rest of the site
  const header = `<header>
        <p><strong>${link('/', SITE_NAME)}</strong></p>
        <nav aria-label="Main">${[
          ['/', 'Home'],
          ['/products', 'Products'],
          ['/about', 'About Us'],
          ['/contact', 'Contact Us'],
        ].map(([href, text]) => link(href, text)).join(' | ')}</nav>
      </header>`
  const footer = `<footer>
        <h2>Our brands</h2>
        <ul>${companies.map((company) => `<li>${link(brandPath(company), company.name)}</li>`).join('')}</ul>
        <p>${escapeHtml(SITE_NAME)}, ${escapeHtml(contact.address || 'Muttrah, Muscat, Oman')}${contact.phone ? ` · Phone ${escapeHtml(contact.phone)}` : ''}${contact.email ? ` · ${escapeHtml(contact.email)}` : ''}</p>
      </footer>`
  const body = (main) =>
    `<div id="prerendered" style="max-width:72rem;margin:0 auto;padding:1.5rem 1rem;line-height:1.6">
      ${header}
      <main>${main}</main>
      ${footer}
    </div>`

  const pages = []
  const addPage = (file, head, main) => pages.push({ file, head, body: body(main) })

  // Home (mirrors Home.jsx)
  addPage(
    'index.html',
    headTags({
      title: home.meta_title,
      description: home.meta_description,
      canonical: `${SITE_URL}/`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: SITE_NAME,
        image: DEFAULT_IMAGE,
        '@id': `${SITE_URL}/#organization`,
        url: SITE_URL,
        telephone: `+${home.whatsapp_number || '96899793939'}`,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Muttrah Street',
          addressLocality: 'Muscat',
          addressRegion: 'Muttrah',
          postalCode: '114',
          addressCountry: 'OM',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 23.615082, longitude: 58.542143 },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
          opens: '08:00',
          closes: '18:00',
        },
      },
    }),
    `<h1>${escapeHtml(home.hero_title || SITE_NAME)}</h1>
        ${paragraph(home.hero_eyebrow)}
        ${paragraph(home.hero_description)}
        <p>${link('/products', home.primary_button_label || 'Browse Products')} · ${link('/contact', home.secondary_button_label || 'Contact Sales')}</p>
        ${home.intro_title ? `<h2>${escapeHtml(home.intro_title)}</h2>` : ''}
        ${paragraph(home.intro_description)}
        ${(home.features || []).map((feature) => `<h3>${escapeHtml(feature.title)}</h3>${paragraph(feature.description)}`).join('')}
        ${home.trust_title ? `<h2>${escapeHtml(home.trust_title)}</h2>` : ''}
        <ul>${(home.trust_items || []).map((item) => `<li>${escapeHtml(item.title)}</li>`).join('')}</ul>`,
  )

  // About (mirrors About.jsx)
  const aboutSections = ['mission', 'vision', 'warehouse', 'network', 'why']
    .filter((key) => about[`${key}_title`] && about[`${key}_text`])
    .map((key) => `<h2>${escapeHtml(about[`${key}_title`])}</h2>${paragraph(about[`${key}_text`])}`)
    .join('')
  addPage(
    'about/index.html',
    headTags({
      title: about.meta_title || 'About Us',
      description: about.meta_description || about.overview,
      canonical: `${SITE_URL}/about`,
    }),
    `<h1>${escapeHtml(about.title || 'About Us')}</h1>
        ${paragraph(about.overview)}
        ${aboutSections}
        ${about.timeline_title ? `<h2>${escapeHtml(about.timeline_title)}</h2>` : ''}
        <ul>${(about.timeline_items || []).map((item) => `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.description)}</li>`).join('')}</ul>
        ${about.location_title ? `<h2>${escapeHtml(about.location_title)}</h2>` : ''}
        ${paragraph(about.location_description)}`,
  )

  // Contact (mirrors Contact.jsx)
  const emails = [contact.email, contact.email_2].filter(Boolean)
  const phones = [contact.phone, contact.phone_2].filter(Boolean)
  addPage(
    'contact/index.html',
    headTags({
      title: contact.meta_title || 'Contact Us',
      description: contact.meta_description || contact.description,
      canonical: `${SITE_URL}/contact`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: SITE_NAME,
        image: DEFAULT_IMAGE,
        telephone: contact.phone || '+968 9979 3939',
        email: contact.email || 'info@muttrahpharmacy.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: contact.address || 'Muttrah, Muscat',
          addressLocality: 'Muscat',
          addressRegion: 'Muttrah',
          postalCode: '114',
          addressCountry: 'OM',
        },
      },
    }),
    `<h1>${escapeHtml(contact.meta_title || 'Contact Us')}</h1>
        ${contact.title ? `<h2>${escapeHtml(contact.title)}</h2>` : ''}
        ${paragraph(contact.description)}
        <dl>
          ${contact.address ? `<dt>${escapeHtml(contact.address_label || 'Address')}</dt><dd>${escapeHtml(contact.address)}</dd>` : ''}
          ${emails.length ? `<dt>${escapeHtml(contact.email_label || 'Email')}</dt><dd>${emails.map((email) => link(`mailto:${email}`, email)).join(', ')}</dd>` : ''}
          ${phones.length ? `<dt>${escapeHtml(contact.phone_label || 'Phone')}</dt><dd>${phones.map((phone) => link(`tel:${phone}`, phone)).join(', ')}</dd>` : ''}
        </dl>`,
  )

  // Catalog pages. Titles and descriptions mirror Products.jsx.
  const catalogPage = ({ file, canonicalPath, title, description, items }) =>
    addPage(
      file,
      headTags({ title, description, canonical: `${SITE_URL}${canonicalPath}` }),
      `<h1>Product catalog</h1>
        <h2>${escapeHtml(title)}</h2>
        ${paragraph(description)}
        ${productList(items)}`,
    )

  catalogPage({
    file: 'products/index.html',
    canonicalPath: '/products',
    title: 'Medical Product Catalog',
    description:
      'Browse our comprehensive wholesale catalog of pharmaceuticals, orthopedic implants, and rehabilitation equipment at Muttrah Pharmacy.',
    items: products,
  })

  // Brand and category pages live at query URLs (/products?company=...), so
  // they are saved under _pre/ and nginx picks them by the query string
  const queryFile = (urlPath) => `_pre/products/${urlPath.split('?')[1]}.html`

  for (const company of companies) {
    const urlPath = brandPath(company)
    catalogPage({
      file: queryFile(urlPath),
      canonicalPath: urlPath,
      title: `${company.name} Medical Catalog`,
      description: `Explore medical supplies and products from ${company.name} distributed by Muttrah Pharmacy in Oman.`,
      items: products.filter((product) => product.company === company.id),
    })
  }

  for (const category of categories) {
    const company = companyById.get(category.company)
    const urlPath = categoryPath(category)
    let title = `${category.name} Catalog`
    let description = `Browse our range of ${category.name} products distributed by Muttrah Pharmacy in Oman.`
    if (company) {
      const startsWithBrand = category.name.toLowerCase().startsWith(company.name.toLowerCase())
      const label = startsWithBrand ? category.name : `${company.name} ${category.name}`
      title = `${label} Catalog`
      description = `Explore ${label} products, distributed by Muttrah Pharmacy in Oman.`
    }
    catalogPage({
      file: queryFile(urlPath),
      canonicalPath: urlPath,
      title,
      description,
      items: products.filter((product) => product.category === category.id),
    })
  }

  // Product pages (mirror ProductDetail.jsx)
  for (const product of products) {
    const images = productImages(product)
    const company = companyById.get(product.company)
    const category = categoryById.get(product.category)
    const sizes = String(product.size || '').split(',').map((size) => size.trim()).filter(Boolean)
    const related = products
      .filter((item) => item.category === product.category && item.slug !== product.slug)
      .slice(0, 3)

    addPage(
      `products/${product.slug}/index.html`,
      headTags({
        title: product.meta_title || product.name,
        description: product.meta_description || product.description?.substring(0, 155),
        canonical: productUrl(product.slug),
        image: product.image,
        type: 'product',
        schema: [productSchema(product, images), productBreadcrumbSchema(product)],
      }),
      `<nav aria-label="Breadcrumb">${link('/', 'Home')} › ${link('/products', 'Products')} › ${escapeHtml(product.name)}</nav>
        <h1>${escapeHtml(product.name)}</h1>
        ${images.length ? `<img src="${escapeHtml(images[0])}" alt="${escapeHtml(product.image_alt || product.name)}" style="max-width:100%;width:480px;height:auto">` : ''}
        ${paragraph(product.description)}
        <dl>
          ${product.company_name ? `<dt>Company</dt><dd>${company ? link(brandPath(company), product.company_name) : escapeHtml(product.company_name)}</dd>` : ''}
          ${product.category_name ? `<dt>Category</dt><dd>${category ? link(categoryPath(category), product.category_name) : escapeHtml(product.category_name)}</dd>` : ''}
          ${sizes.length ? `<dt>Available Sizes</dt><dd>${sizes.map(escapeHtml).join(', ')}</dd>` : ''}
        </dl>
        <p>${link('/contact', 'Request product information')}</p>
        ${related.length ? `<h2>Similar catalog items</h2>${productList(related)}` : ''}`,
    )
  }

  return pages
}

// ---------- main ----------

async function main() {
  // A previous run already replaced index.html with the home page, so the
  // clean app shell is kept separately as _shell.html
  const shellFile = path.join(DIST, '_shell.html')
  const indexFile = path.join(DIST, 'index.html')
  if (!existsSync(indexFile)) throw new Error('dist/index.html not found - run `vite build` first')
  const shell = await readFile(existsSync(shellFile) ? shellFile : indexFile, 'utf8')

  // Fetch everything before touching dist, so a failing API leaves the
  // previous pages in place instead of a half-written site
  console.log(`Pre-render: fetching data from ${API}`)
  const [products, companies, categories, home, about, contact] = await Promise.all([
    getAllProducts(),
    getJson(`${API}/companies/`).then(asList),
    getJson(`${API}/categories/`).then(asList),
    getJson(`${API}/website/home/`),
    getJson(`${API}/website/about/`),
    getJson(`${API}/website/contact/`),
  ])
  if (!products.length || !companies.length) {
    throw new Error(`API returned ${products.length} products and ${companies.length} brands; refusing to publish empty pages`)
  }

  // The shell's generic tags (marked data-default) are replaced per page
  const baseHtml = shell
    .replace(/<title\b[^>]*data-default="true"[^>]*>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<(?:meta|link)\b[^>]*data-default="true"[^>]*>\s*/g, '')
  if (/<(?:title|meta|link)\b[^>]*data-default="true"/.test(baseHtml) || !baseHtml.includes('<div id="root"></div>')) {
    throw new Error('index.html no longer matches what this script expects (data-default tags / empty #root)')
  }

  const pages = createSite({ products, companies, categories, home, about, contact })

  await writeFile(shellFile, shell)
  for (const dir of GENERATED_DIRS) {
    await rm(path.join(DIST, dir), { recursive: true, force: true })
  }
  for (const page of pages) {
    // Function replacements: a "$" in product text must not be read as a pattern
    const html = baseHtml
      .replace('</head>', () => `  ${HIDE_FROM_BROWSERS}\n    ${page.head}\n  </head>`)
      .replace('<div id="root"></div>', () => `<div id="root">${page.body}</div>`)
    const file = path.join(DIST, page.file)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, html)
  }

  console.log(
    `Pre-render: wrote ${pages.length} pages (${products.length} products, ${companies.length} brands, ${categories.length} categories, 4 site pages)`,
  )
}

main().catch((error) => {
  console.error(`Pre-render failed: ${error.message}`)
  process.exit(1)
})
