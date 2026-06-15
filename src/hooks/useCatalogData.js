import { useEffect, useState } from 'react'
import { categoriesAPI, companiesAPI, productsAPI } from '../services/api'

export default function useCatalogData() {
  const [data, setData] = useState({
    companies: [],
    categories: [],
    products: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadCatalogData() {
      try {
        setLoading(true)
        setError('')

        const [companies, categories, products] = await Promise.all([
          companiesAPI.getAll(),
          categoriesAPI.getAll(),
          productsAPI.getAll(),
        ])

        if (active) {
          setData({ companies, categories, products })
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.detail ||
              'Unable to load catalog data from the Django API.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadCatalogData()

    return () => {
      active = false
    }
  }, [])

  return { ...data, loading, error }
}
