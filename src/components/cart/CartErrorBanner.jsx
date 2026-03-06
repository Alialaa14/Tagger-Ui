import React from 'react'

/**
 * CartErrorBanner
 * Props:
 *   message — string (empty = hidden)
 *   onClose — () => void
 */
export default function CartErrorBanner({ message, onClose }) {
  if (!message) return null

  return (
    <div className="cart-error-banner" role="alert" dir="rtl">
      <p>⚠️ {message}</p>
      <button className="cart-error-close" onClick={onClose} aria-label="إغلاق">✕</button>
    </div>
  )
}
