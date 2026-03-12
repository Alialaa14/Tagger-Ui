import React, { useEffect, useState } from 'react'

/**
 * CouponModal
 * Props:
 *   open         — bool
 *   onClose      — () => void
 *   onApply      — (code: string) => void
 *   initialCode  — string
 */
export default function CouponModal({ open, onClose, onApply, onCancelCoupon, initialCode = '' }) {
  const [code, setCode] = useState(initialCode)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode(initialCode || '')
  }, [open, initialCode])

  if (!open) return null

  async function handleApply() {
    if (!code.trim()) return
    setSubmitting(true)
    try {
      const result = await onApply(code.trim().toUpperCase())
      if (result?.ok !== false) onClose()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelCoupon() {
    if (!onCancelCoupon) return
    setSubmitting(true)
    try {
      const result = await onCancelCoupon()
      if (result?.ok !== false) {
        setCode('')
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleApply()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="cart-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="cart-modal" dir="rtl">
        {/* Head */}
        <div className="cart-modal-head">
          <div>
            <h3 id="coupon-modal-title">🏷️ كوبون الخصم</h3>
            <p>أدخل كود الكوبون للحصول على خصم إضافي على طلبك.</p>
          </div>
          <button className="cart-modal-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>

        {/* Input + apply */}
        <div className="cart-modal-input-row">
          <input
            className="cart-modal-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKey}
            placeholder="EXAMPLE10"
            dir="ltr"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <button className="cart-modal-apply-btn" onClick={handleApply} disabled={submitting}>
            {submitting ? '...' : 'تطبيق'}
          </button>
        </div>

        {/* Cancel */}
        <div className="cart-modal-actions">
          {initialCode && (
            <button className="btn btn-ghost" onClick={handleCancelCoupon} type="button" disabled={submitting}>
              إلغاء الكوبون
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose} type="button">إلغاء</button>
        </div>
      </div>
    </div>
  )
}
