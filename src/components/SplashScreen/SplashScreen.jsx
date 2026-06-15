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
        'fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-stone-950 px-4 sm:px-6 text-[#fffdf8] transition-opacity duration-500 h-[100dvh] w-full',
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 opacity-25">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,253,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,253,248,0.06)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="relative w-full max-w-xl px-2 sm:px-4 text-center">
        <p className="micro-copy text-[#d7b08d] text-[0.65rem] sm:text-xs">
          Loading
          <span className="loading-dots" aria-hidden="true" />
        </p>
        <h1 className="display-serif mt-4 sm:mt-5 text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl leading-tight">
          Muttrah Pharmacy
        </h1>
        <p className="mx-auto mt-3 sm:mt-4 max-w-sm text-xs min-[380px]:text-sm leading-relaxed text-stone-300 sm:text-base">
          Pharmaceutical and orthopedic distribution in Oman
        </p>

        <div className="mt-8 sm:mt-10">
          <div className="mb-2 sm:mb-3 flex justify-end text-[0.65rem] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#f1d1b8]">
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 sm:h-2 overflow-hidden bg-white/10 rounded-full">
            <div
              className="h-full bg-[#d7b08d] transition-[width] duration-150 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

