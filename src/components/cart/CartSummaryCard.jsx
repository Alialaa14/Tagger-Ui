import React from 'react'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function CartSummaryCard({
  totalQuantity,
  subtotal,
  totalDiscount,
  finalTotal,
  onCheckout,
  onClear,
  disabled,
}) {
  return (
    <aside className="cart-summary-card">
      <h2>Order Summary</h2>
      <div className="cart-summary-lines">
        <div><span>Total quantity</span><strong>{totalQuantity}</strong></div>
        <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
        <div><span>Total discount</span><strong>-{money.format(totalDiscount)}</strong></div>
        <div className="cart-summary-total"><span>Final total</span><strong>{money.format(finalTotal)}</strong></div>
      </div>

      <button type="button" className="btn cart-checkout-btn" onClick={onCheckout} disabled={disabled}>
        Proceed to checkout
      </button>
      <button type="button" className="btn btn-ghost cart-clear-btn" onClick={onClear} disabled={disabled}>
        Clear cart
      </button>
    </aside>
  )
}
