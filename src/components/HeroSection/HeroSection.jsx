import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HeroSlides } from './HeroSlider'
import { useHeroSlider } from './useHeroSlider'
import { trackEvent } from '../../services/analytics'
import FeatureIcon from '../FeatureIcon/FeatureIcon'

const whatsappMessage =
  'Hello Muttrah Pharmacy ,\n\nI would like to know more about your products and services. Please share the details and assist me with my requirements.\n\nThank you.'

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const heroHighlights = [
  { icon: 'trophy', title: '46+ Years', subtitle: 'of Experience' },
  { icon: 'shield', title: 'Authorized', subtitle: 'Distributor' },
  { icon: 'box', title: 'Wide Product', subtitle: 'Range' },
  { icon: 'truck', title: 'Serving', subtitle: 'Across Oman' },
]

export default function HeroSection({ content }) {
  const slides = useMemo(
    () => (Array.isArray(content.hero_slides) ? content.hero_slides.filter((slide) => slide.image) : []),
    [content.hero_slides],
  )
  const hasSlides = slides.length > 0
  const slider = useHeroSlider(slides)

  const whatsappUrl = `https://wa.me/${content.whatsapp_number || '96899793939'}?text=${encodeURIComponent(
    whatsappMessage,
  )}`

  return (
    <section className="relative isolate min-h-[calc(100svh-72px)] overflow-hidden border-b border-stone-900 bg-stone-950 text-[#fffdf8] sm:min-h-[calc(100svh-88px)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-stone-950">
        {/* With no slides added in admin, the hero keeps its plain dark background */}
        {hasSlides ? <HeroSlides slider={slider} /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,14,0.92)_0%,rgba(17,16,14,0.68)_48%,rgba(17,16,14,0.44)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-950 to-transparent" />
      </div>

      <div className="container-shell flex min-h-[calc(100svh-72px)] items-center py-10 sm:min-h-[calc(100svh-88px)] sm:py-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl w-full"
        >
          <motion.p variants={fadeUpVariant} className="micro-copy section-eyebrow max-w-lg text-[#f1d1b8]">
            {content.hero_eyebrow}
          </motion.p>

          <motion.h1 variants={fadeUpVariant} className="display-serif hero-title mt-7 text-[#fffdf8]">
            {content.hero_title}
          </motion.h1>
          <motion.p variants={fadeUpVariant} className="mt-5 max-w-2xl text-base leading-7 text-stone-200 sm:text-lg">
            {content.hero_description}
          </motion.p>
          <motion.div variants={fadeUpVariant} className="mt-8 flex flex-col sm:flex-row gap-4 relative z-[100] pointer-events-auto">
            <Link
              to="/products"
              className="block w-full cursor-pointer text-center rounded-full border border-[#fffdf8] bg-[#fffdf8] px-6 py-4 text-[13px] font-bold uppercase tracking-wider text-stone-950 active:bg-stone-200 transition-colors sm:w-auto sm:px-8 sm:py-3.5"
            >
              {content.primary_button_label}
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', { location: 'hero_contact_sales' })}
              className="block w-full cursor-pointer text-center rounded-full border border-white/35 bg-white/10 px-6 py-4 text-[13px] font-bold uppercase tracking-wider text-[#fffdf8] backdrop-blur active:bg-white/20 transition-colors sm:w-auto sm:px-8 sm:py-3.5"
            >
              {content.secondary_button_label}
            </a>
          </motion.div>

          <motion.ul
            variants={fadeUpVariant}
            className="mt-10 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 sm:mt-12 lg:grid-cols-4 lg:gap-x-8"
          >
            {heroHighlights.map(({ icon, title, subtitle }) => (
              <li key={title} className="flex items-center gap-3">
                <FeatureIcon name={icon} className="h-9 w-9 shrink-0 text-[#e0a77f] sm:h-10 sm:w-10" />
                <p className="text-sm leading-snug sm:text-[15px]">
                  <span className="block font-bold text-[#fffdf8]">{title}</span>
                  <span className="block text-stone-300">{subtitle}</span>
                </p>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}
