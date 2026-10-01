import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Loader from '../../components/Loader/Loader'
import ProductCard from '../../components/ProductCard/ProductCard'
import ProductFilters from '../../components/ProductFilters/ProductFilters'
import { categoriesAPI, companiesAPI, productsAPI } from '../../services/api'
import { AnimatePresence, motion } from 'framer-motion'
import SEO from '../../components/SEO/SEO'

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [companies, setCompanies] = useState([])
  const [categories, setCategories] = useState([])
  const selectedCompany = searchParams.get('company') || ''
  const selectedCompanyLine = searchParams.get('company_line') || ''
  const selectedCategory = searchParams.get('category') || ''
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)

  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Shown as a badge on the mobile Filter button
  const activeFilterCount = [selectedCompany, selectedCompanyLine, selectedCategory].filter(Boolean).length

  // Mobile filter panel: lock page scroll behind it and close on Escape
  useEffect(() => {
    if (!filtersOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function handleKey(event) {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [filtersOpen])
  const selectedCompanyData = useMemo(
    () =>
      companies.find(
        (company) => String(company.id) === String(selectedCompany),
      ),
    [companies, selectedCompany],
  )
  const companyLines = useMemo(
    () =>
      (selectedCompanyData?.lines || []).filter(
        (line) => line.is_active !== false,
      ),
    [selectedCompanyData],
  )

  useEffect(() => {
    let active = true

    async function loadCompanies() {
      try {
        setLoadingCompanies(true)
        const companyList = await companiesAPI.getAll()
        if (active) {
          setCompanies(companyList)
        }
      } catch {
        if (active) setError('Unable to load companies.')
      } finally {
        if (active) setLoadingCompanies(false)
      }
    }

    loadCompanies()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadCategories() {
      try {
        setLoadingCategories(true)
        const categoryList = await categoriesAPI.getAll({
          company: selectedCompany,
          companyLine: selectedCompanyLine,
        })
        if (active) setCategories(categoryList)
      } catch {
        if (active) setError('Unable to load categories.')
      } finally {
        if (active) setLoadingCategories(false)
      }
    }

    loadCategories()

    return () => {
      active = false
    }
  }, [selectedCompany, selectedCompanyLine])

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        setLoadingProducts(true)
        setError('')
        const response = await productsAPI.getAll({
          company: selectedCompany,
          companyLine: selectedCompanyLine,
          category: selectedCategory,
          search: debouncedSearch,
          page: page
        })
        if (active) {
          if (page === 1) {
            setProducts(response.results)
          } else {
            setProducts(prev => [...prev, ...response.results])
          }
          setHasMore(!!response.next)
          setTotalProducts(response.count)
        }
      } catch {
        if (active) {
          setError(
            page === 1
              ? 'Unable to load products from the Django API.'
              : 'Unable to load more products. Please try again.',
          )
        }
      } finally {
        if (active) setLoadingProducts(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [selectedCategory, selectedCompany, selectedCompanyLine, debouncedSearch, page, retryCount])

  // Frontend filtering logic has been moved to backend search

  const clearFilters = () => {
    setSearchParams({})
    setSearch('')
    setPage(1)
  }

  const updateCatalogParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams)

    if (key === 'company') {
      nextParams.delete('company_line')
      nextParams.delete('category')
    }

    if (key === 'company_line') {
      nextParams.delete('category')
    }

    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }
    setSearchParams(nextParams)
    setPage(1)
  }

  // Shared by the desktop sidebar and the mobile filter panel
  const filterProps = {
    companies,
    companyLines,
    categories,
    selectedCompany,
    selectedCompanyLine,
    selectedCategory,
    loadingCategories,
    search,
    onCompanyChange: (value) => updateCatalogParam('company', value),
    onCompanyLineChange: (value) => updateCatalogParam('company_line', value),
    onCategoryChange: (value) => updateCatalogParam('category', value),
    onSearchChange: setSearch,
    onClear: clearFilters,
  }

  const dynamicTitle = selectedCompanyData
    ? `${selectedCompanyData.name} Medical Catalog` 
    : "Medical Product Catalog"
  const dynamicDesc = selectedCompanyData 
    ? `Explore medical supplies and products from ${selectedCompanyData.name} distributed by Muttrah Pharmacy in Oman.`
    : "Browse our comprehensive wholesale catalog of pharmaceuticals, orthopedic implants, and rehabilitation equipment at Muttrah Pharmacy."

  return (
    <section className="section-padding bg-[#f8f5ee] min-h-screen">
      <SEO 
        title={dynamicTitle}
        description={dynamicDesc}
        keywords={selectedCompanyData ? `Muttrah Pharmacy, ${selectedCompanyData.name}, medicine Oman` : null}
      />
      <div className="container-shell">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="mb-6 border-b border-[#ded8cc] pb-6 sm:mb-12 sm:pb-10"
        >
          <div>
            <p className="micro-copy text-[#70443d]">Products</p>
            <h1 className="display-serif page-title mt-4 text-stone-950">
              Product catalog
            </h1>
          </div>
        </motion.div>

        {/* Mobile toolbar: search + Filter button (desktop uses the sidebar) */}
        <div className="mb-5 flex items-stretch gap-2 lg:hidden">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="focus-ring h-12 w-full rounded-full border border-[#ded8cc] bg-[#fffdf8] pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400"
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="relative inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-[#ded8cc] bg-[#fffdf8] px-4 !text-sm !font-semibold text-stone-800 transition active:bg-[#f8f5ee]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filter
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-950 px-1.5 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {loadingCompanies ? (
              <Loader type="filters" />
            ) : (
              <ProductFilters {...filterProps} />
            )}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpVariant} className="mb-5 flex flex-col gap-2 rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-sm font-semibold text-stone-700">
                Showing {products.length} {totalProducts > products.length ? `(of ${totalProducts})` : ''} products
              </p>
            </motion.div>

            {error ? (
              <motion.div variants={fadeUpVariant} className="rounded-2xl border border-[#70443d]/30 bg-[#fffdf8] p-5 text-sm font-semibold text-[#70443d]">
                {error}
              </motion.div>
            ) : null}

            {loadingProducts && page === 1 ? <Loader type="cards" /> : null}

            {!loadingProducts && !error && products.length === 0 ? (
              <motion.div variants={fadeUpVariant} className="rounded-3xl border border-dashed border-[#ded8cc] bg-[#fffdf8] p-8 text-center sm:p-12 shadow-sm">
                <h2 className="display-serif text-4xl leading-none text-stone-950 sm:text-5xl">
                  No products found
                </h2>
                <p className="mt-4 text-stone-600">
                  Try another company, category, or search term.
                </p>
              </motion.div>
            ) : null}

            {(!error || page > 1) && products.length > 0 ? (
              <>
                <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>

                {hasMore && (
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() =>
                        error ? setRetryCount((count) => count + 1) : setPage((p) => p + 1)
                      }
                      disabled={loadingProducts}
                      className="rounded-full border border-stone-950 bg-stone-950 px-8 py-4 text-xs font-bold uppercase text-[#fffdf8] transition-all hover:bg-stone-800 disabled:opacity-50"
                    >
                      {loadingProducts ? 'Loading...' : error ? 'Try Again' : 'Load More Products'}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Mobile filter panel, slides up from the bottom */}
      <AnimatePresence>
        {filtersOpen ? (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px]"
              onClick={() => setFiltersOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-3xl bg-[#fffdf8] shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b border-[#ded8cc] px-5 py-4">
                <h2 className="display-serif text-2xl leading-none text-stone-950">Filters</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded8cc] text-stone-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {loadingCompanies ? (
                  <Loader type="filters" />
                ) : (
                  <ProductFilters {...filterProps} bare showSearch={false} />
                )}
              </div>

              <div className="flex gap-3 border-t border-[#ded8cc] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 rounded-full border border-stone-950 py-3 !text-xs !font-bold uppercase text-stone-950"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="flex-[2] rounded-full bg-stone-950 py-3 !text-xs !font-bold uppercase text-white"
                >
                  {loadingProducts ? 'Loading…' : `Show ${totalProducts} products`}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
