import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
const About = React.lazy(() => import('../pages/About/About'))
const Contact = React.lazy(() => import('../pages/Contact/Contact'))
// Home is imported eagerly — it's the landing page and must render instantly
import Home from '../pages/Home/Home'
const ProductDetail = React.lazy(() => import('../pages/ProductDetail/ProductDetail'))
const Products = React.lazy(() => import('../pages/Products/Products'))
const NotFound = React.lazy(() => import('../pages/NotFound/NotFound'))
import Loader from '../components/Loader/Loader'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'

// Forces a full remount when the slug changes, so a product-to-product
// navigation (e.g. from search or related items) doesn't carry over the
// previous product's gallery scroll position and state.
function ProductDetailRoute() {
  const { slug } = useParams()
  return <ProductDetail key={slug} />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/products" element={
            <Suspense fallback={<Loader />}>
              <Products />
            </Suspense>
          } />
          <Route path="/products/:slug" element={
            <Suspense fallback={<Loader />}>
              <ProductDetailRoute />
            </Suspense>
          } />
          <Route path="/about" element={
            <Suspense fallback={<Loader />}>
              <About />
            </Suspense>
          } />
          <Route path="/contact" element={
            <Suspense fallback={<Loader />}>
              <Contact />
            </Suspense>
          } />
          <Route path="*" element={
            <Suspense fallback={<Loader />}>
              <NotFound />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
