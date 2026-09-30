import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
const About = React.lazy(() => import('../pages/About/About'))
const Contact = React.lazy(() => import('../pages/Contact/Contact'))
const Home = React.lazy(() => import('../pages/Home/Home'))
const ProductDetail = React.lazy(() => import('../pages/ProductDetail/ProductDetail'))
const Products = React.lazy(() => import('../pages/Products/Products'))
const NotFound = React.lazy(() => import('../pages/NotFound/NotFound'))
import Loader from '../components/Loader/Loader'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={
            <Suspense fallback={<Loader />}>
              <Home />
            </Suspense>
          } />
          <Route path="/products" element={
            <Suspense fallback={<Loader />}>
              <Products />
            </Suspense>
          } />
          <Route path="/products/:slug" element={
            <Suspense fallback={<Loader />}>
              <ProductDetail />
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
