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

export const apiOrigin = (() => {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    return 'http://127.0.0.1:8000'
  }
})()

export const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${apiOrigin}${path}`
  return `${apiOrigin}/${path}`
}

export const getGalleryImages = (product) => {
  const gallery = Array.isArray(product?.gallery) ? product.gallery : []
  return gallery
    .map((item) => getMediaUrl(item?.image || item))
    .filter(Boolean)
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

    const { data } = await apiClient.get('/products/', { params })
    return normalizeList(data)
  },

  async getBySlug(slug) {
    const { data } = await apiClient.get(`/products/${slug}/`)
    return data
  },
}

export const companiesAPI = {
  async getAll() {
    const { data } = await apiClient.get('/companies/')
    return normalizeList(data)
  },

  async getById(id) {
    const { data } = await apiClient.get(`/companies/${id}/`)
    return data
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

export const contactAPI = {
  async submit(payload) {
    const { data } = await apiClient.post('/contact/', payload)
    return data
  },
}

export const websiteAPI = {
  async getHome() {
    const { data } = await apiClient.get('/website/home/')
    return data
  },

  async getAbout() {
    const { data } = await apiClient.get('/website/about/')
    return data
  },

  async getContact() {
    const { data } = await apiClient.get('/website/contact/')
    return data
  },

  async getFooter() {
    const { data } = await apiClient.get('/website/footer/')
    return data
  },
}

export default apiClient
