export default function Loader({ label = 'Loading latest catalog data' }) {
  return (
    <div className="flex min-h-48 items-center justify-center border border-[#ded8cc] bg-[#fffdf8]/80 p-8">
      <div className="flex items-center gap-4 text-sm font-semibold text-stone-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#70443d] border-t-transparent" />
        {label}
      </div>
    </div>
  )
}
