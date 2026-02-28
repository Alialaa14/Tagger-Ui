import React from 'react'

export default function DiscountSection({ discounts = [], expanded, onToggle }) {
  if (!Array.isArray(discounts) || discounts.length === 0) return null

  const sorted = [...discounts].sort((a, b) => a.quantity - b.quantity)

  return (
    <div className="product-discount-wrap">
      <button type="button" className="product-discount-toggle" onClick={onToggle} aria-expanded={expanded}>
        <span>عرض الكميات</span>
        <span className={`product-discount-chevron ${expanded ? 'open' : ''}`}>⌄</span>
      </button>

      <div className={`product-discount-panel ${expanded ? 'open' : ''}`}>
        <div className="product-discount-table">
          <div className="product-discount-head">الكمية</div>
          <div className="product-discount-head">قيمة الخصم</div>
          {sorted.map((rule, idx) => (
            <React.Fragment key={`${rule.quantity}-${idx}`}>
              <div>{rule.quantity}</div>
              <div>{rule.discountValue}%</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
