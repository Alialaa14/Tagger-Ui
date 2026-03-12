import React, { useEffect, useState } from 'react'

/**
 * CouponModal
 * Props:
 *   open            — bool
 *   onClose         — () => void
 *   onApply         — async (code: string) => { ok, message }
 *   onCancelCoupon  — async () => { ok }
 *   initialCode     — string (if set, coupon is already applied)
 */
export default function CouponModal({ open, onClose, onApply, onCancelCoupon, initialCode = '' }) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!open) return
    setCode('')
    setLocalError('')
  }, [open])

  if (!open) return null

  async function handleApply() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setLocalError('يرجى إدخال كود الكوبون.')
      return
    }
    setSubmitting(true)
    setLocalError('')
    try {
      const result = await onApply(trimmed)
      if (result?.ok === false) {
        setLocalError(result.message || 'كود الكوبون غير صحيح.')
      } else {
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelCoupon() {
    if (!onCancelCoupon) return
    setSubmitting(true)
    setLocalError('')
    try {
      const result = await onCancelCoupon()
      if (result?.ok !== false) {
        setCode('')
        onClose()
      } else {
        setLocalError(result.message || 'فشل إلغاء الكوبون.')
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
            <p>
              {initialCode
                ? `الكوبون المطبّق حالياً: ${initialCode}`
                : 'أدخل كود الكوبون للحصول على خصم إضافي على طلبك.'}
            </p>
          </div>
          <button className="cart-modal-close" onClick={onClose} aria-label="إغلاق" disabled={submitting}>✕</button>
        </div>

        {/* Input + apply */}
        <div className="cart-modal-input-row">
          <input
            className="cart-modal-input"
            value={code}
            onChange={(e) => { setCode(e.target.value); setLocalError('') }}
            onKeyDown={handleKey}
            placeholder={initialCode ? 'أدخل كوبوناً جديداً…' : 'EXAMPLE10'}
            dir="ltr"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            disabled={submitting}
          />
          <button
            type="button"
            className="cart-modal-apply-btn"
            onClick={handleApply}
            disabled={submitting}
            style={{
              padding: '0 18px',
              minHeight: 44,
              borderRadius: 11,
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontFamily: 'Cairo, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'جاري التطبيق…' : 'تطبيق الكوبون'}
          </button>
        </div>

        {/* Error message */}
        {localError && (
          <p style={{ color: '#dc2626', fontSize: 13, margin: 0, fontWeight: 600 }}>
            ⚠️ {localError}
          </p>
        )}

        {/* Cancel coupon / close */}
        <div className="cart-modal-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {initialCode && (
            <button
              type="button"
              onClick={handleCancelCoupon}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: '1.5px solid rgba(220,38,38,0.3)',
                background: '#fff1f2',
                color: '#dc2626',
                fontFamily: 'Cairo, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              🗑️ إلغاء الكوبون
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              color: '#475569',
              fontFamily: 'Cairo, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
