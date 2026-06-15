export default function SearchBar({ value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase text-stone-700">
        Product Search
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-stone-400">
          Search
        </span>
        <input
          className="focus-ring w-full border border-[#ded8cc] bg-[#f8f5ee] py-3 pl-20 pr-4 text-sm text-stone-800 transition placeholder:text-stone-400"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Name, brand, category"
        />
      </div>
    </label>
  )
}
