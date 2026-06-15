import SearchBar from '../SearchBar/SearchBar'

export default function ProductFilters({
  companies,
  companyLines,
  categories,
  selectedCompany,
  selectedCompanyLine,
  selectedCategory,
  loadingCategories,
  search,
  onCompanyChange,
  onCompanyLineChange,
  onCategoryChange,
  onSearchChange,
  onClear,
}) {
  return (
    <aside className="h-fit border border-[#ded8cc] bg-[#fffdf8] p-4 sm:p-5 lg:sticky lg:top-24">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#ded8cc] pb-5">
        <div>
          <p className="micro-copy text-[#70443d]">Filters</p>
          <h2 className="display-serif mt-2 text-4xl leading-none text-stone-950">
            Catalog
          </h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-[#ded8cc] px-3 py-2 text-xs font-bold uppercase text-stone-600 transition hover:border-stone-950 hover:text-stone-950"
        >
          Clear
        </button>
      </div>

      <div className="space-y-5">
        <SearchBar value={search} onChange={onSearchChange} />

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase text-stone-700">
            Company Filter
          </span>
          <select
            className="focus-ring w-full border border-[#ded8cc] bg-[#f8f5ee] px-4 py-3 text-sm text-stone-800 transition"
            value={selectedCompany}
            onChange={(event) => onCompanyChange(event.target.value)}
          >
            <option value="">Choose company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>

        {companyLines.length > 0 ? (
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase text-stone-700">
              Company Line
            </span>
            <select
              className="focus-ring w-full border border-[#ded8cc] bg-[#f8f5ee] px-4 py-3 text-sm text-stone-800 transition"
              value={selectedCompanyLine}
              onChange={(event) => onCompanyLineChange(event.target.value)}
            >
              <option value="">All company lines</option>
              {companyLines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase text-stone-700">
            Category Filter
          </span>
          <select
            className="focus-ring w-full border border-[#ded8cc] bg-[#f8f5ee] px-4 py-3 text-sm text-stone-800 transition"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            disabled={loadingCategories}
          >
            <option value="">
              {loadingCategories ? 'Loading categories' : 'All categories'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  )
}
