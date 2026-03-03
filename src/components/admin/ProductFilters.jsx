import React from 'react'

export const initialProductFilters = {
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'price',
  sortOrder: 'asc',
}

function getCategoryId(category) {
  if (!category) return ''
  if (typeof category === 'string') return category
  return category._id || category.id || ''
}

function getCategoryName(category, categories) {
  if (!category) return ''

  if (typeof category === 'string') {
    const matchedCategory = categories.find((item) => item?._id === category)
    return matchedCategory?.name || ''
  }

  return category.name || category.title || ''
}

export function filterAndSortProducts(products = [], filters = initialProductFilters, categories = []) {
  const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice)
  const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice)

  const filtered = products.filter((product) => {
    const productCategoryId = getCategoryId(product?.category)
    const productPrice = Number(product?.price)

    if (filters.categoryId && productCategoryId !== filters.categoryId) return false
    if (minPrice != null && !Number.isNaN(minPrice) && productPrice < minPrice) return false
    if (maxPrice != null && !Number.isNaN(maxPrice) && productPrice > maxPrice) return false

    return true
  })

  const direction = filters.sortOrder === 'desc' ? -1 : 1

  return filtered.sort((a, b) => {
    if (filters.sortBy === 'price') {
      return (Number(a?.price) - Number(b?.price)) * direction
    }

    if (filters.sortBy === 'category') {
      const aCategory = getCategoryName(a?.category, categories).toLowerCase()
      const bCategory = getCategoryName(b?.category, categories).toLowerCase()
      return aCategory.localeCompare(bCategory) * direction
    }

    const aName = (a?.name || '').toLowerCase()
    const bName = (b?.name || '').toLowerCase()
    return aName.localeCompare(bName) * direction
  })
}

export default function ProductFilters({
  categories = [],
  value = initialProductFilters,
  onChange,
  onReset,
  disabled = false,
}) {
  const handleChange = (field) => (event) => {
    onChange?.({ ...value, [field]: event.target.value })
  }

  const activeFiltersCount = [value.categoryId, value.minPrice, value.maxPrice].filter((item) => item !== '').length

  return (
    <div className="product-filters">
      <div className="product-filters-head">
        <div>
          <h3 className="product-filters-title">تصفية المنتجات</h3>
          <p className="product-filters-subtitle">فلترة المنتجات حسب التصنيف والسعر وطريقة الترتيب.</p>
        </div>

        <div className="product-filters-head-actions">
          <span className="product-filters-count">{`الفلاتر النشطة: ${activeFiltersCount}`}</span>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onReset} disabled={disabled}>
            إعادة تعيين
          </button>
        </div>
      </div>

      <div className="product-filters-grid">
        <label className="admin-label product-filter-field">
          <span>التصنيف</span>
          <select className="admin-input" value={value.categoryId} onChange={handleChange('categoryId')} disabled={disabled}>
            <option value="">كل التصنيفات</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-label product-filter-field">
          <span>أقل سعر</span>
          <input
            type="number"
            min="0"
            className="admin-input"
            value={value.minPrice}
            onChange={handleChange('minPrice')}
            placeholder="0"
            disabled={disabled}
          />
        </label>

        <label className="admin-label product-filter-field">
          <span>أعلى سعر</span>
          <input
            type="number"
            min="0"
            className="admin-input"
            value={value.maxPrice}
            onChange={handleChange('maxPrice')}
            placeholder="1000"
            disabled={disabled}
          />
        </label>

        <label className="admin-label product-filter-field">
          <span>الترتيب حسب</span>
          <select className="admin-input" value={value.sortBy} onChange={handleChange('sortBy')} disabled={disabled}>
            <option value="name">الاسم</option>
            <option value="category">التصنيف</option>
            <option value="price">السعر</option>
          </select>
        </label>

        <label className="admin-label product-filter-field">
          <span>اتجاه الترتيب</span>
          <select className="admin-input" value={value.sortOrder} onChange={handleChange('sortOrder')} disabled={disabled}>
            <option value="asc">تصاعدي</option>
            <option value="desc">تنازلي</option>
          </select>
        </label>
      </div>
    </div>
  )
}
