import { Link } from 'react-router-dom'
import { getMediaUrl } from '../../services/api'
import { motion } from 'framer-motion'

export default function ProductCard({ product }) {
  const imageUrl = getMediaUrl(product.image)

  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#ded8cc] bg-[#fffdf8] transition-all duration-300 shadow-sm hover:border-[#b7774f] hover:shadow-xl hover:shadow-stone-950/10"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="product-image-fallback aspect-square overflow-hidden border-b border-[#ded8cc] bg-[#f8f5ee]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105 sm:p-5"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div>
                <p className="display-serif text-3xl leading-none text-stone-950">
                  MP
                </p>
                <p className="mt-2 text-xs font-bold uppercase text-stone-500">
                  Product image
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {product.company_name && (
            <span className="rounded-full border border-[#ded8cc] bg-[#f8f5ee] px-3 py-1 text-[0.68rem] font-bold uppercase text-stone-700">
              {product.company_name}
            </span>
          )}
          {product.category_name && (
            <span className="rounded-full border border-[#ded8cc] bg-white px-3 py-1 text-[0.68rem] font-bold uppercase text-[#70443d]">
              {product.category_name}
            </span>
          )}
        </div>

        <h3 className="display-serif text-[1.45rem] leading-tight text-stone-950 sm:text-2xl">
          <Link to={`/products/${product.slug}`} className="transition hover:text-[#70443d]">
            {product.name}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
          {product.description}
        </p>

        <div className="mt-auto pt-6">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex w-full items-center justify-center rounded-full border border-stone-950 px-4 py-3 text-xs font-bold uppercase text-stone-950 transition-all hover:bg-stone-950 hover:text-[#fffdf8] hover:scale-105 active:scale-95"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
