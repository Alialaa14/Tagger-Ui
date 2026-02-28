import React from 'react'

export default function CartSkeleton() {
  return (
    <div className="cart-skeleton-list" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <div key={n} className="cart-skeleton-card">
          <div className="cart-skeleton-image" />
          <div className="cart-skeleton-lines">
            <div className="cart-skeleton-line cart-skeleton-line--lg" />
            <div className="cart-skeleton-line" />
            <div className="cart-skeleton-line cart-skeleton-line--sm" />
          </div>
        </div>
      ))}
    </div>
  )
}
