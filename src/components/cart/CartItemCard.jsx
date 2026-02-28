import React, { memo } from 'react'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function CartItemCard({ line, onIncrement, onDecrement, onRemove }) {
  const { item, pricing } = line

  return (
    <article className="cart-item-card">
      <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
      <div className="cart-item-content">
        <div className="cart-item-top">
          <h3>{item.name}</h3>
          <button className="cart-remove-btn" type="button" onClick={() => onRemove(item.productId)}>
            Remove
          </button>
        </div>
        <div className="cart-item-meta">
          <span>Unit: {money.format(item.unitPrice)}</span>
          <span>Subtotal: {money.format(pricing.finalTotal)}</span>
        </div>
        <div className="cart-item-actions">
          <div className="cart-qty-control">
            <button type="button" onClick={() => onDecrement(item.productId)}>-</button>
            <span>{item.quantity}</span>
            <button type="button" onClick={() => onIncrement(item.productId)}>+</button>
          </div>
          {pricing.discountPercent > 0 && (
            <span className="cart-discount-badge">
              {pricing.discountPercent}% off applied
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default memo(CartItemCard)
