import React from 'react'

export default function CartSkeleton({ count = 3 }) {
  return (
    <div className="cart-skeleton" aria-label="جار التحميل…" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cart-skeleton-item">
          {/* image */}
          <div className="cart-skeleton-img shimmer" />
          {/* lines */}
          <div className="cart-skeleton-lines">
            <div className="s-line s-lg shimmer" />
            <div className="s-line s-sm shimmer" />
          </div>
          {/* qty placeholder */}
          <div style={{ width: 120, height: 36, borderRadius: 11 }} className="shimmer" />
          {/* price placeholder */}
          <div style={{ width: 70, height: 20, borderRadius: 8 }} className="shimmer" />
        </div>
      ))}
    </div>
  )
}
