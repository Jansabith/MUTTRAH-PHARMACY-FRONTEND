import { useEffect, useState } from 'react'

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(1)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Prevent scrolling on both html and body for mobile browsers
    const htmlOverflow = document.documentElement.style.overflow
    const bodyOverflow = document.body.style.overflow
    
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval)
          window.setTimeout(() => setExiting(true), 250)
          window.setTimeout(onComplete, 700)
          return 100
        }

        return current + 1
      })
    }, 18)

    return () => {
      window.clearInterval(interval)
      // Restore styles on cleanup
      document.documentElement.style.overflow = htmlOverflow
      document.body.style.overflow = bodyOverflow
    }
  }, [onComplete])

  return (
    <div
      className={[
        'fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-white px-4 sm:px-6 text-stone-900 transition-opacity duration-500 h-[100dvh] w-full',
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 opacity-60">
        <div className="h-full w-full bg-[linear-gradient(rgba(30,64,175,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.05)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="relative flex w-full max-w-xl flex-col items-center px-2 sm:px-4 text-center">
        <div className="splash-logo-enter mx-auto mb-6 sm:mb-8 w-44 min-[380px]:w-52 sm:w-64 md:w-72">
          <img
            src="/muttrah_logo_480.webp"
            fetchPriority="high"
            alt="Muttrah Pharmacy logo"
            className="splash-logo-spin block h-auto w-full drop-shadow-[0_10px_25px_rgba(30,64,175,0.35)]"
          />
        </div>
        <h1 className="display-serif text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl leading-tight">
          Muttrah Pharmacy
        </h1>
        <p className="mx-auto mt-3 sm:mt-4 max-w-sm text-xs min-[380px]:text-sm leading-relaxed text-stone-600 sm:text-base">
          Pharmaceutical and orthopedic distribution in Oman
        </p>

        <div className="mt-8 sm:mt-10 w-full">
          <div className="mb-2 sm:mb-3 flex justify-end text-[0.65rem] sm:text-xs font-bold uppercase tracking-[0.14em] text-blue-800">
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 sm:h-2 overflow-hidden bg-stone-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-800 to-blue-500 transition-[width] duration-150 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

