import React, { useMemo, useState } from 'react'

export default function CategoryFilters({
  filters,
  onChange,
  onReset,
  isFiltering = false,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const sortOptions = useMemo(
    () => [
      { value: 'price_asc', label: '????? ?? ????? ??????' },
      { value: 'price_desc', label: '????? ?? ?????? ?????' },
      { value: 'newest', label: '??????' },
    ],
    []
  )

  return (
    <section className="category-filters-wrap" dir="rtl">
      <button
        className="category-filters-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        type="button"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? '????? ???????' : '????? ???????'}
      </button>

      <div className={`category-filters ${mobileOpen ? 'open' : ''}`}>
        <label className="category-filter-item category-filter-item--search">
          <span>???</span>
          <input
            type="text"
            className="category-filter-control"
            placeholder="???? ???? ?????..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </label>

        <label className="category-filter-item">
          <span>??? ???</span>
          <input
            type="number"
            className="category-filter-control"
            min="0"
            inputMode="numeric"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => onChange('minPrice', e.target.value)}
          />
        </label>

        <label className="category-filter-item">
          <span>???? ???</span>
          <input
            type="number"
            className="category-filter-control"
            min="0"
            inputMode="numeric"
            placeholder="1000"
            value={filters.maxPrice}
            onChange={(e) => onChange('maxPrice', e.target.value)}
          />
        </label>

        <label className="category-filter-item">
          <span>???????</span>
          <select
            className="category-filter-control"
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
          >
            {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>

        <div className="category-filter-actions">
          <button className="category-filter-reset" type="button" onClick={onReset}>
            ????? ???
          </button>
          {isFiltering && <span className="category-filter-loading">???? ????? ???????...</span>}
        </div>
      </div>
    </section>
  )
}
