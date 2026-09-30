import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../components/Loader/Loader'
import ProductCard from '../../components/ProductCard/ProductCard'
import {
  getGalleryImages,
  getMediaUrl,
  getProductSizes,
  productsAPI,
} from '../../services/api'
import SEO from '../../components/SEO/SEO'
import ShareButton from '../../components/ShareButton/ShareButton'
import { trackEvent } from '../../services/analytics'
import useWhatsAppNumber from '../../hooks/useWhatsAppNumber'

const VIDEO_KEY = '__youtube_video__'

// Accepts youtube.com/watch?v=, youtu.be/, /shorts/, /embed/ and /live/ links
function getYouTubeId(url) {
  if (!url) return ''
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return match ? match[1] : ''
}

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const whatsappNumber = useWhatsAppNumber()

  useEffect(() => {
    let active = true

    async function loadProduct() {
      try {
        setLoading(true)
        setError('')

        const productData = await productsAPI.getBySlug(slug)
        const related = await productsAPI.getAll({
          category: productData.category,
        })

        if (active) {
          setProduct(productData)
          setRelatedProducts(
            (related.results || []).filter((item) => String(item.slug) !== String(slug)).slice(0, 3),
          )
          setActiveImage(getMediaUrl(productData.image))
        }
      } catch {
        if (active) setError('Unable to load this product from the Django API.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProduct()

    return () => {
      active = false
    }
  }, [slug])

  const galleryImages = useMemo(() => {
    if (!product) return []
    const images = [getMediaUrl(product.image), ...getGalleryImages(product)]
    return [...new Set(images.filter(Boolean))]
  }, [product])

  const youtubeId = getYouTubeId(product?.youtube_url)
  const showingVideo = Boolean(youtubeId) && activeImage === VIDEO_KEY

  const sizes = getProductSizes(product)

  if (loading) {
    return (
      <section className="bg-[#f8f5ee] py-10 sm:py-12 lg:py-14">
        <div className="container-shell">
          <Loader label="Loading product details" />
        </div>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="bg-[#f8f5ee] py-10 sm:py-12 lg:py-14">
        <div className="container-shell">
          <div className="border border-[#70443d]/30 bg-[#fffdf8] p-6 sm:p-8">
            <h1 className="display-serif text-3xl leading-tight text-[#70443d] sm:text-4xl">
              Product unavailable
            </h1>
            <p className="mt-4 text-[#70443d]">
              {error || 'The requested product could not be found.'}
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-[#70443d] px-5 py-3 text-xs font-bold uppercase text-[#fffdf8]"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': getMediaUrl(product.image),
    'category': product.category_name,
    'brand': {
      '@type': 'Brand',
      'name': product.company_name
    },
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'OMR',
      'offers': [
        {
          '@type': 'Offer',
          'availability': product.is_available !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'url': window.location.href
        }
      ]
    }
  }

  return (
    <>
      <SEO
        title={product.meta_title || product.name}
        description={product.meta_description || product.description?.substring(0, 155)}
        keywords={product.meta_keywords || `${product.name}, ${product.company_name}, Muttrah Pharmacy, Oman`}
        image={getMediaUrl(product.image)}
        schema={productSchema}
      />
      <main className="border-b border-[#ded8cc] bg-[#fffdf8] pb-6 pt-2 sm:pb-8 sm:pt-3 lg:pb-6 lg:pt-3">
        <article className="container-shell max-w-[96rem]">
          <Link
            to="/products"
            className="mb-3 inline-flex rounded-full border border-[#ded8cc] px-4 py-2 text-xs font-bold uppercase text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
          >
            Back to Products
          </Link>

          <div className="grid items-start gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:gap-7">
            <div>
              <div className="flex aspect-[4/3] max-h-[24rem] items-center justify-center overflow-hidden lg:aspect-[5/4]">
                {showingVideo ? (
                  <iframe
                    className="h-full w-full bg-black"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    title={`${product.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="max-h-full max-w-full rounded-2xl object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-6 text-center">
                    <div>
                      <p className="display-serif text-4xl leading-none text-stone-950 sm:text-5xl">
                        MP
                      </p>
                      <p className="mt-3 text-xs font-bold uppercase text-stone-500">
                        Product image
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {galleryImages.length > 1 || youtubeId ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {galleryImages.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={[
                        'h-18 w-18 overflow-hidden border bg-[#fffdf8] transition sm:h-20 sm:w-20 lg:h-24 lg:w-24',
                        activeImage === image
                          ? 'border-[#70443d] ring-4 ring-[#b7774f]/15'
                          : 'border-[#ded8cc] hover:border-stone-950',
                      ].join(' ')}
                    >
                      <img
                        src={image}
                        alt={`${product.name} gallery`}
                        className="h-full w-full object-contain p-2"
                      />
                    </button>
                  ))}
                  {youtubeId ? (
                    <button
                      type="button"
                      onClick={() => setActiveImage(VIDEO_KEY)}
                      aria-label={`Play ${product.name} video`}
                      className={[
                        'relative h-18 w-18 overflow-hidden border bg-black transition sm:h-20 sm:w-20 lg:h-24 lg:w-24',
                        showingVideo
                          ? 'border-[#70443d] ring-4 ring-[#b7774f]/15'
                          : 'border-[#ded8cc] hover:border-stone-950',
                      ].join(' ')}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                        alt=""
                        className="h-full w-full object-cover opacity-80"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                          <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-3 flex flex-wrap gap-2">
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

              <h1 className="display-serif text-[2.2rem] leading-[0.98] text-stone-950 sm:text-[3rem] lg:text-[3.1rem] xl:text-[3.55rem]">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-[0.96rem]">
                {product.description}
              </p>

              <div className="mt-4 grid gap-px overflow-hidden border border-[#ded8cc] bg-[#ded8cc] sm:grid-cols-2">
                <div className="bg-[#fffdf8] p-3.5">
                  <p className="micro-copy text-[#70443d]">Company</p>
                  <p className="display-serif mt-2 break-words text-[1.25rem] leading-tight text-stone-950 sm:text-[1.5rem]">
                    {product.company_name || product.company}
                  </p>
                </div>
                <div className="bg-[#fffdf8] p-3.5">
                  <p className="micro-copy text-[#70443d]">Category</p>
                  <p className="display-serif mt-2 break-words text-[1.25rem] leading-tight text-stone-950 sm:text-[1.5rem]">
                    {product.category_name || product.category}
                  </p>
                </div>
              </div>

              <div className="mt-4 border border-[#ded8cc] bg-[#f8f5ee] p-3.5">
                <h2 className="display-serif text-[1.65rem] leading-tight text-stone-950">
                  Available Sizes
                </h2>
                {sizes.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <span
                        key={size}
                        className="rounded-full border border-[#ded8cc] bg-[#fffdf8] px-3 py-1.5 text-sm font-semibold text-stone-700"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-stone-600">
                    Size information is not included in the current product API
                    response. Contact Muttrah Pharmacy for current availability.
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello,\n\nI am interested in purchasing the product: ${product.name}.\n\nPlease share the price, availability, and payment details.\n\nThank you.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent('whatsapp_click', { location: 'buy_now', product_name: product.name })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366] bg-[#25D366] px-5 py-2.5 text-xs font-bold uppercase text-white transition hover:border-[#128C7E] hover:bg-[#128C7E] sm:w-auto"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Buy Now
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello,\n\nI would like to know more about ${product.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent('whatsapp_click', { location: 'request_info', product_name: product.name })
                  }
                  className="inline-flex w-full items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-5 py-2.5 text-xs font-bold uppercase text-[#fffdf8] transition hover:border-[#70443d] hover:bg-[#70443d] sm:w-auto"
                >
                  Request Product Information
                </a>
                <ShareButton product={product} className="w-full sm:w-auto" />
              </div>
            </div>
          </div>
        </article>
      </main>

      <section className="bg-[#f8f5ee] py-10 sm:py-12 lg:py-14">
        <div className="container-shell max-w-7xl">
          <div className="mb-8">
            <p className="micro-copy text-[#70443d]">Related Products</p>
            <h2 className="display-serif mt-4 text-[2.1rem] leading-tight text-stone-950 sm:text-[3rem] lg:text-[4rem]">
              Similar catalog items
            </h2>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#ded8cc] bg-[#fffdf8] p-6 text-stone-600 sm:p-8">
              No related products are currently available in this category.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
