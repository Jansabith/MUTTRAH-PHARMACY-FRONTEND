import { Link } from 'react-router-dom'
import { getMediaUrl } from '../../services/api'
import { motion } from 'framer-motion'
import ShareButton from '../ShareButton/ShareButton'

export default function ProductCard({ product }) {
  const imageUrl = getMediaUrl(product.image)

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group flex h-full flex-col"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="flex aspect-square items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-full max-w-full rounded-2xl object-contain transition duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="text-center">
              <p className="display-serif text-3xl leading-none text-stone-300">
                MP
              </p>
              <p className="mt-2 text-xs font-bold uppercase text-stone-300">
                Product image
              </p>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        {(product.company_name || product.category_name) && (
          <p className="truncate text-xs font-medium uppercase tracking-[0.08em] text-stone-400">
            {[product.company_name, product.category_name].filter(Boolean).join(' · ')}
          </p>
        )}

        <h3 className="mt-2 line-clamp-2 text-base font-medium leading-snug text-stone-900 sm:text-[1.05rem]">
          <Link to={`/products/${product.slug}`} className="transition hover:text-[#70443d]">
            {product.name}
          </Link>
        </h3>

        {product.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-stone-500">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-stretch gap-2 pt-5">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-stone-950 px-4 py-3 text-xs font-bold uppercase text-white transition hover:bg-[#70443d]"
          >
            View Details
          </Link>
          <ShareButton product={product} variant="icon" />
        </div>
      </div>
    </motion.article>
  )
}
