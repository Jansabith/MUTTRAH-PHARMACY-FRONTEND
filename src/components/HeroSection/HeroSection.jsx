import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'

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

export default function HeroSection({ content }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  
  const whatsappUrl = `https://wa.me/${content.whatsapp_number || '96899793939'}?text=${encodeURIComponent(
    whatsappMessage,
  )}`

  return (
    <section className="relative isolate min-h-[calc(100svh-72px)] overflow-hidden border-b border-stone-900 bg-stone-950 text-[#fffdf8] sm:min-h-[calc(100svh-88px)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-stone-950">
        <video
          className={`h-full w-full object-cover object-top transition-opacity duration-1000 ease-in-out ${isVideoLoaded ? 'opacity-70' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex="-1"
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src="/videos/muttrah-hero.mp4" type="video/mp4" />
          <source src="/videos/muttrah-hero.MOV" type="video/quicktime" />
        </video>
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
          <motion.p variants={fadeUpVariant} className="micro-copy max-w-lg text-[#f1d1b8]">
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
              className="block w-full cursor-pointer text-center rounded-full border border-white/35 bg-white/10 px-6 py-4 text-[13px] font-bold uppercase tracking-wider text-[#fffdf8] backdrop-blur active:bg-white/20 transition-colors sm:w-auto sm:px-8 sm:py-3.5"
            >
              {content.secondary_button_label}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
