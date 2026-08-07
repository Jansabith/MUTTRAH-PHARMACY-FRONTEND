export default function Loader({ type = 'page' }) {
  if (type === 'cards') {
    return (
      <div className="grid auto-rows-[15.5rem] gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-full rounded-3xl bg-[#f8f5ee] border border-[#ded8cc] p-6 sm:p-8 flex flex-col"
          >
            <div className="mb-7 h-1 w-12 rounded-full bg-stone-300/60" />
            <div className="h-8 bg-stone-300/60 rounded-full w-3/4 mb-5" />
            <div className="h-4 bg-stone-300/60 rounded-full w-full mb-2" />
            <div className="h-4 bg-stone-300/60 rounded-full w-5/6 mb-2" />
            <div className="h-4 bg-stone-300/60 rounded-full w-4/6" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'filters') {
    return (
      <div className="animate-pulse flex flex-col gap-4 w-full rounded-3xl border border-[#ded8cc] bg-[#fffdf8] p-6">
        <div className="h-8 bg-stone-300/50 rounded-xl w-full mb-4" />
        <div className="flex flex-col gap-3 pl-2">
          <div className="h-5 bg-stone-200/60 rounded-lg w-3/4" />
          <div className="h-5 bg-stone-200/60 rounded-lg w-5/6" />
          <div className="h-5 bg-stone-200/60 rounded-lg w-4/6" />
          <div className="h-5 bg-stone-200/60 rounded-lg w-1/2" />
        </div>
        <div className="h-8 bg-stone-300/50 rounded-xl w-full mt-6 mb-4" />
        <div className="flex flex-col gap-3 pl-2">
          <div className="h-5 bg-stone-200/60 rounded-lg w-4/6" />
          <div className="h-5 bg-stone-200/60 rounded-lg w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden animate-pulse min-h-screen bg-[#fffdf8]">
      {/* Hero Skeleton */}
      <div className="relative h-[60svh] min-h-[30rem] w-full bg-stone-200/40 rounded-b-[3rem] sm:rounded-b-[4rem] mb-16">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-6 w-32 bg-stone-300/50 rounded-full mb-6" />
          <div className="h-16 w-3/4 max-w-3xl bg-stone-300/50 rounded-full mb-6" />
          <div className="h-16 w-2/4 max-w-xl bg-stone-300/50 rounded-full mb-8" />
          <div className="h-14 w-48 bg-stone-300/50 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="w-full">
          <div className="h-4 w-24 bg-stone-300/50 rounded-full mb-5" />
          <div className="h-12 w-full max-w-md bg-stone-300/50 rounded-full mb-3" />
          <div className="h-12 w-3/4 max-w-sm bg-stone-300/50 rounded-full" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 w-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border border-[#ded8cc] bg-[#f8f5ee] rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-8 h-1 w-16 rounded-full bg-stone-300/60" />
              <div className="h-8 bg-stone-300/60 rounded-full w-3/4 mb-5" />
              <div className="h-4 bg-stone-300/60 rounded-full w-full mb-2" />
              <div className="h-4 bg-stone-300/60 rounded-full w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
