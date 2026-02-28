import React from 'react'

export default function CartErrorBanner({ message, onClose }) {
  if (!message) return null
  return (
    <div className="cart-error-banner" role="alert">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Close error">×</button>
    </div>
  )
}
