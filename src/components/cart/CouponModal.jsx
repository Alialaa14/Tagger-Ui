import React, { useEffect, useState } from 'react'

export default function CouponModal({ open, onClose, onApply, initialCode = '' }) {
  const [code, setCode] = useState(initialCode)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    if (open) setCode(initialCode || '')
  }, [open, initialCode])

  if (!open) return null

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })
    const result = await onApply(code)
    setLoading(false)
    if (result?.ok) {
      setStatus({ type: 'success', message: result.message || 'Coupon applied.' })
      return
    }
    setStatus({ type: 'error', message: result?.message || 'Failed to apply coupon.' })
  }

  return (
    <div className="cart-modal-overlay open" onClick={onClose}>
      <div className="cart-mini-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Apply Coupon</h3>
        <form onSubmit={submit} className="cart-mini-form">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. SOUNDA5"
            disabled={loading}
          />
          {status.message && (
            <p className={status.type === 'success' ? 'coupon-status success' : 'coupon-status error'}>
              {status.message}
            </p>
          )}
          <div className="cart-mini-actions">
            <button type="submit" className="btn cart-checkout-btn" disabled={loading}>
              {loading ? 'Applying...' : 'Apply'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
