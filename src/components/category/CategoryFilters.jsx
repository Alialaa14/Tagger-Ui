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
      { value: 'price_asc', label: 'السعر من الأقل للأعلى' },
      { value: 'price_desc', label: 'السعر من الأعلى للأقل' },
      { value: 'newest', label: 'الأحدث' },
    ],
    []
  )

  return (
    <section className="category-filters-wrap" dir="rtl">
      <button className="category-filters-toggle btn btn-ghost" onClick={() => setMobileOpen((v) => !v)} type="button">
        {mobileOpen ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
      </button>

      <div className={`category-filters ${mobileOpen ? 'open' : ''}`}>
        <label className="category-filter-item">
          <span>بحث</span>
          <input
            type="text"
            placeholder="ابحث داخل الفئة..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </label>

        <label className="category-filter-item">
          <span>أقل سعر</span>
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => onChange('minPrice', e.target.value)}
          />
        </label>

        <label className="category-filter-item">
          <span>أعلى سعر</span>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => onChange('maxPrice', e.target.value)}
          />
        </label>

        <label className="category-filter-item">
          <span>الترتيب</span>
          <select value={filters.sortBy} onChange={(e) => onChange('sortBy', e.target.value)}>
            {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>

        <div className="category-filter-actions">
          <button className="btn btn-ghost" type="button" onClick={onReset}>
            إعادة ضبط
          </button>
          {isFiltering && <span className="category-filter-loading">جاري تحديث النتائج...</span>}
        </div>
      </div>
    </section>
  )
}
