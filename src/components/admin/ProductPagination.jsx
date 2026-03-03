import React, { useMemo } from 'react'

function getVisiblePages(page, totalPages) {
  const maxVisible = 5
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - maxVisible + 1))
  return Array.from({ length: maxVisible }, (_, index) => start + index)
}

export default function ProductPagination({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}) {
  const safePage = Math.max(1, Number(page) || 1)
  const safeTotalPages = Math.max(1, Number(totalPages) || 1)
  const canPrev = safePage > 1
  const canNext = safePage < safeTotalPages

  const startItem = totalItems > 0 ? (safePage - 1) * pageSize + 1 : 0
  const endItem = totalItems > 0 ? Math.min(safePage * pageSize, totalItems) : 0

  const visiblePages = useMemo(() => getVisiblePages(safePage, safeTotalPages), [safePage, safeTotalPages])

  return (
    <div className="product-pagination">
      <div className="product-pagination-meta">
        <span className="product-pagination-pill">{`عرض ${startItem}-${endItem}`}</span>
        <span className="product-pagination-pill is-accent">{`الإجمالي ${totalItems}`}</span>

        <label className="product-pagination-size">
          <span>لكل صفحة</span>
          <select
            className="admin-input"
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            disabled={disabled}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      <div className="product-pagination-actions">
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={() => onPageChange?.(safePage - 1)}
          disabled={disabled || !canPrev}
        >
          السابق
        </button>

        <div className="product-pagination-pages" role="navigation" aria-label="ترقيم الصفحات">
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`product-page-btn ${pageNumber === safePage ? 'is-active' : ''}`}
              onClick={() => onPageChange?.(pageNumber)}
              disabled={disabled}
              aria-current={pageNumber === safePage ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={() => onPageChange?.(safePage + 1)}
          disabled={disabled || !canNext}
        >
          التالي
        </button>
      </div>
    </div>
  )
}
