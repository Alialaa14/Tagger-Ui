import React, { useMemo, useState } from 'react'

export default function CategoriesFilters({
  filters,
  onChange,
  onReset,
  isFiltering = false,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const sortOptions = useMemo(
    () => [
      { value: 'newest', label: 'الأحدث' },
      { value: 'name_asc', label: 'الاسم (أ-ي)' },
      { value: 'name_desc', label: 'الاسم (ي-أ)' },
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
        {mobileOpen ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
      </button>

      <div className={`category-filters categories-filters ${mobileOpen ? 'open' : ''}`}>
        <label className="category-filter-item category-filter-item--search">
          <span>بحث</span>
          <input
            type="text"
            className="category-filter-control"
            placeholder="ابحث باسم الفئة أو الوصف..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </label>

        <label className="category-filter-item">
          <span>الترتيب</span>
          <select
            className="category-filter-control"
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="category-filter-actions">
          <button className="category-filter-reset" type="button" onClick={onReset}>
            إعادة ضبط
          </button>
          {isFiltering && <span className="category-filter-loading">جاري تحديث النتائج...</span>}
        </div>
      </div>
    </section>
  )
}

