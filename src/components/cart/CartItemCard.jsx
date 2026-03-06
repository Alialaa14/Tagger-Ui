import React from 'react'

/**
 * CartItemCard
 * Props:
 *   line        — { item: { productId, quantity }, product, unitPrice, lineTotal, discount }
 *   onIncrement — (productId) => void
 *   onDecrement — (productId) => void
 *   onRemove    — (productId) => void
 */
export default function CartItemCard({ line, onIncrement, onDecrement, onRemove }) {
  const { item, product, unitPrice, lineTotal, discount = 0 } = line
  const { productId, quantity } = item

  const imageUrl = product?.image?.url || product?.imageUrl || null
  const name     = product?.name || productId
  const hasDisc  = discount > 0

  return (
    <article className="cart-item-card" dir="rtl">
      {/* ── Image ── */}
      <div className="cart-item-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="cart-item-image" loading="lazy" />
        ) : (
          <div className="cart-item-image-placeholder">🛍️</div>
        )}
      </div>

      {/* ── Name + price per unit ── */}
      <div className="cart-item-info">
        <p className="cart-item-name" title={name}>{name}</p>
        <div className="cart-item-meta">
          <span className="cart-item-price-each">
            {unitPrice?.toFixed(2) ?? product?.price?.toFixed(2) ?? '—'} ج.م / قطعة
          </span>
          {hasDisc && (
            <span className="cart-item-discount-badge">خصم {discount} ج.م</span>
          )}
        </div>
      </div>

      {/* ── Qty control ── */}
      <div className="cart-item-qty-row">
        <div className="cart-item-qty-control">
          <button
            className="cart-qty-btn"
            onClick={() => onDecrement(productId)}
            disabled={quantity <= 1}
            aria-label="تقليل الكمية"
          >
            −
          </button>
          <span className="cart-qty-display">{quantity}</span>
          <button
            className="cart-qty-btn"
            onClick={() => onIncrement(productId)}
            aria-label="زيادة الكمية"
          >
            +
          </button>
        </div>

        {/* Line total */}
        <span className="cart-item-line-total">
          {lineTotal?.toFixed(2) ?? '—'} ج.م
        </span>

        {/* Remove */}
        <button
          className="cart-item-remove"
          onClick={() => onRemove(productId)}
          aria-label={`حذف ${name}`}
          title="حذف من السلة"
        >
          ✕
        </button>
      </div>
    </article>
  )
}
