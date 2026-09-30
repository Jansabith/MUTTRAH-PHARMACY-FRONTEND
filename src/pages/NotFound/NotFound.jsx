import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function NotFound() {
  return (
    <section className="section-padding flex min-h-[calc(100svh-88px)] items-center bg-[#f8f5ee]">
      <Helmet>
        <title>Page not found | Muttrah Pharmacy</title>
        {/* Keep missing addresses out of Google's index */}
        <meta name="robots" content="noindex" />
      </Helmet>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariant}
        className="container-shell flex flex-col items-center text-center"
      >
        <img
          src="/muttrah_pharmacy_oman_logo.webp"
          alt=""
          className="h-20 w-20 object-contain sm:h-24 sm:w-24"
        />

        <p className="micro-copy mt-8 text-[#70443d]">Error 404</p>
        <h1 className="display-serif mt-4 text-5xl leading-none text-stone-950 sm:text-7xl">
          Page not found
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-stone-600 sm:text-lg">
          The page you are looking for may have been moved or no longer exists.
          Try our product catalog or head back to the homepage.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/"
            className="rounded-full bg-stone-950 px-8 py-3.5 text-[13px] font-bold uppercase tracking-wider text-[#fffdf8] transition hover:bg-[#70443d]"
          >
            Back to Home
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-stone-950 px-8 py-3.5 text-[13px] font-bold uppercase tracking-wider text-stone-950 transition hover:bg-stone-950 hover:text-[#fffdf8]"
          >
            Browse Products
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
