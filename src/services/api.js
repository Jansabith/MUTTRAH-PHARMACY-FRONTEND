import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const apiCache = new Map();

const fetchWithCache = async (url, params = {}) => {
  const key = `${url}?${new URLSearchParams(params).toString()}`;
  if (apiCache.has(key)) {
    return apiCache.get(key);
  }
  const { data } = await apiClient.get(url, { params });
  apiCache.set(key, data);
  return data;
};

export const apiOrigin = (() => {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin
  } catch {
    return window.location.origin
  }
})()

// Name used in website addresses, e.g. "tynor" in /products?company=tynor
// (the number only as a fallback for anything without one)
export const urlName = (item) => item?.slug || (item?.id != null ? String(item.id) : '')

// True when an address value (a name, or an old number) points to `item`
export const matchesUrlName = (item, value) =>
  Boolean(item && value) && (item.slug === value || String(item.id) === String(value))

export const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${apiOrigin}${path}`
  return `${apiOrigin}/${path}`
}

// Main image first, then the gallery, as { src, alt }. The backend sends the
// alt texts: "TYNOR Knee Cap Air – Knee Supports" for the main image, and the
// editor's own text (or "TYNOR Knee Cap Air") for gallery photos.
export const getProductImages = (product) => {
  if (!product) return []
  const gallery = Array.isArray(product.gallery) ? product.gallery : []
  const images = [
    { src: getMediaUrl(product.image), alt: product.image_alt || product.name },
    ...gallery.map((item) => ({
      src: getMediaUrl(item?.image || item),
      alt: item?.alt || product.name,
    })),
  ].filter((image) => image.src)
  // The same picture can be both main image and in the gallery: show it once
  const seen = new Set()
  return images.filter((image) => !seen.has(image.src) && seen.add(image.src))
}

const splitSizes = (value) => {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)
}

export const getProductSizes = (product) => {
  const productSizeField = splitSizes(product?.size)
  const relatedSizes = Array.isArray(product?.sizes) ? product.sizes : []
  const relatedSizeValues = relatedSizes.flatMap((size) =>
    splitSizes(size?.size_name || size?.name || size),
  )

  return [...new Set([...productSizeField, ...relatedSizeValues])]
}

export const productsAPI = {
  async getAll(filters = {}) {
    const params = {}

    if (filters.company) params.company = filters.company
    if (filters.companyLine) params.company_line = filters.companyLine
    if (filters.category) params.category = filters.category
    if (filters.page) params.page = filters.page
    if (filters.search) params.search = filters.search

    const { data } = await apiClient.get('/products/', { params })
    return {
      results: normalizeList(data),
      next: data.next,
      count: data.count
    }
  },

  async getBySlug(slug) {
    const { data } = await apiClient.get(`/products/${slug}/`)
    return data
  },

  // Navbar live search: { query, count, products, brands, categories }.
  // Pass an AbortSignal so an outdated request can be cancelled while typing.
  async suggest(query, signal) {
    const { data } = await apiClient.get('/products/suggest/', { params: { q: query }, signal })
    return data
  },
}

export const companiesAPI = {
  async getAll() {
    const data = await fetchWithCache('/companies/')
    return normalizeList(data)
  },

  async getById(id) {
    return fetchWithCache(`/companies/${id}/`)
  },
}

export const categoriesAPI = {
  async getAll(filters = {}) {
    const params = {}

    if (filters.company) params.company = filters.company
    if (filters.companyLine) params.company_line = filters.companyLine

    const { data } = await apiClient.get('/categories/', { params })
    return normalizeList(data)
  },

  async getById(id) {
    const { data } = await apiClient.get(`/categories/${id}/`)
    return data
  },
}

export const websiteAPI = {
  async getHome() {
    return fetchWithCache('/website/home/')
  },

  // Home page product tabs: [{ key, name, subtitle, products: [] }], in tab order
  async getShowcase() {
    const data = await fetchWithCache('/website/showcase/')
    return Array.isArray(data) ? data : []
  },

  async getAbout() {
    return fetchWithCache('/website/about/')
  },

  async getContact() {
    return fetchWithCache('/website/contact/')
  },

  async getFooter() {
    return fetchWithCache('/website/footer/')
  },
}

export default apiClient
