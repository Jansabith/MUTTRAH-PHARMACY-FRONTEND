import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Loader from '../../components/Loader/Loader'
import ProductCard from '../../components/ProductCard/ProductCard'
import ProductFilters from '../../components/ProductFilters/ProductFilters'
import { categoriesAPI, companiesAPI, productsAPI } from '../../services/api'
import { motion } from 'framer-motion'
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
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState('')
  const hasActiveFilter = Boolean(
    selectedCompany || selectedCompanyLine || selectedCategory,
  )
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
      if (!hasActiveFilter) {
        setProducts([])
        setLoadingProducts(false)
        setError('')
        return
      }

      try {
        setLoadingProducts(true)
        setError('')
        const productList = await productsAPI.getAll({
          company: selectedCompany,
          companyLine: selectedCompanyLine,
          category: selectedCategory,
        })
        if (active) setProducts(productList)
      } catch {
        if (active) setError('Unable to load products from the Django API.')
      } finally {
        if (active) setLoadingProducts(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [hasActiveFilter, selectedCategory, selectedCompany, selectedCompanyLine])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.company_name,
        product.company_line_name,
        product.category_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [products, search])

  const clearFilters = () => {
    setSearchParams({})
    setSearch('')
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
          className="mb-12 border-b border-[#ded8cc] pb-10"
        >
          <div>
            <p className="micro-copy text-[#70443d]">Products</p>
            <h1 className="display-serif page-title mt-4 text-stone-950">
              Product catalog
            </h1>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {loadingCompanies ? (
              <Loader label="Loading catalog filters" />
            ) : (
              <ProductFilters
                companies={companies}
                companyLines={companyLines}
                categories={categories}
                selectedCompany={selectedCompany}
                selectedCompanyLine={selectedCompanyLine}
                selectedCategory={selectedCategory}
                loadingCategories={loadingCategories}
                search={search}
                onCompanyChange={(value) => updateCatalogParam('company', value)}
                onCompanyLineChange={(value) =>
                  updateCatalogParam('company_line', value)
                }
                onCategoryChange={(value) => updateCatalogParam('category', value)}
                onSearchChange={setSearch}
                onClear={clearFilters}
              />
            )}
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpVariant} className="mb-5 flex flex-col gap-2 rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-stone-700">
                {hasActiveFilter
                  ? `Showing ${filteredProducts.length} products`
                  : 'Choose a company, line, or category to view products'}
              </p>
              <p className="break-words text-xs font-bold uppercase text-[#70443d] sm:text-right">
                {selectedCompanyLine
                  ? `API: /products/?company=${selectedCompany}&company_line=${selectedCompanyLine}`
                  : selectedCompany
                    ? `API: /products/?company=${selectedCompany}`
                    : selectedCategory
                      ? `API: /products/?category=${selectedCategory}`
                      : 'Live filters'}
              </p>
            </motion.div>

            {error ? (
              <motion.div variants={fadeUpVariant} className="rounded-2xl border border-[#70443d]/30 bg-[#fffdf8] p-5 text-sm font-semibold text-[#70443d]">
                {error}
              </motion.div>
            ) : null}

            {loadingProducts ? <Loader label="Loading products" /> : null}

            {!hasActiveFilter && !loadingProducts && !error ? (
              <motion.div variants={fadeUpVariant} className="rounded-3xl border border-dashed border-[#b7774f] bg-[#fffdf8] p-8 text-center sm:p-12 shadow-sm">
                <h2 className="display-serif text-4xl leading-none text-stone-950 sm:text-5xl">
                  Select a company first
                </h2>
                <p className="mx-auto mt-4 max-w-md text-stone-600">
                  Use the company filter, company line, or Products menu to load
                  your live product list.
                </p>
              </motion.div>
            ) : null}

            {hasActiveFilter && !loadingProducts && !error && filteredProducts.length === 0 ? (
              <motion.div variants={fadeUpVariant} className="rounded-3xl border border-dashed border-[#ded8cc] bg-[#fffdf8] p-8 text-center sm:p-12 shadow-sm">
                <h2 className="display-serif text-4xl leading-none text-stone-950 sm:text-5xl">
                  No products found
                </h2>
                <p className="mt-4 text-stone-600">
                  Try another company, category, or search term.
                </p>
              </motion.div>
            ) : null}

            {hasActiveFilter && !loadingProducts && !error && filteredProducts.length > 0 ? (
              <motion.div variants={staggerContainer} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
