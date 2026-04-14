import React from 'react'

/**
 * CartItemCard
 * Props:
 *   line        - { item: { productId, quantity, unitPrice, ... }, pricing? }
 *   onIncrement - (productId) => void
 *   onDecrement - (productId) => void
 *   onRemove    - (productId) => void
 */
export default function CartItemCard({ line, onIncrement, onDecrement, onRemove }) {
  const { item } = line
  const { productId, quantity } = item

  const imageUrl = item?.image?.url || item?.imageUrl || null
  const name = item?.name || productId
  const unitPrice = Number(item?.unitPrice || item?.price || 0)
  const discount = Number(line?.pricing?.discountAmount || line?.discount || 0)
  const lineTotal = Number(line?.pricing?.finalTotal ?? (unitPrice * Number(quantity || 0)))
  const hasDisc = discount > 0

  return (
    <article className="cart-item-card" dir="rtl">
      <div className="cart-item-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="cart-item-image" loading="lazy" />
        ) : (
          <div className="cart-item-image-placeholder">???</div>
        )}
      </div>

      <div className="cart-item-info">
        <p className="cart-item-name" title={name}>{name}</p>
        <div className="cart-item-meta">
          <span className="cart-item-price-each">
            {Number.isFinite(unitPrice) ? unitPrice.toFixed(2) : '�'} ?.? / ????
          </span>
          {hasDisc && (
            <span className="cart-item-discount-badge">??? {discount.toFixed(2)} ?.?</span>
          )}
        </div>
      </div>

      <div className="cart-item-qty-row">
        <div className="cart-item-qty-control">
          <button
            className="cart-qty-btn"
            onClick={() => onDecrement(productId)}
            disabled={quantity <= 1}
            aria-label="????? ??????"
          >
            -
          </button>
          <span className="cart-qty-display">{quantity}</span>
          <button
            className="cart-qty-btn"
            onClick={() => onIncrement(productId)}
            aria-label="????? ??????"
          >
            +
          </button>
        </div>

        <span className="cart-item-line-total">
          {Number.isFinite(lineTotal) ? lineTotal.toFixed(2) : '�'} ?.?
        </span>

        <button
          className="cart-item-remove"
          onClick={() => onRemove(productId)}
          aria-label={`??? ${name}`}
          title="??? ?? ?????"
        >
          ?
        </button>
      </div>
    </article>
  )
}
