import React from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * CartSummaryCard
 * Props:
 *   totalQuantity  - number
 *   subtotal       - number
 *   totalDiscount  - number
 *   finalTotal     - number
 *   couponCode     - string | null
 *   onCheckout     - () => void
 *   onClear        - () => void
 *   disabled       - bool
 */
export default function CartSummaryCard({
  totalQuantity = 0,
  subtotal = 0,
  totalDiscount = 0,
  finalTotal = 0,
  couponName = null,
  couponCode = null,
  couponDiscount = 0,
  onCancelCoupon,
  onCheckout,
  onClear,
  disabled = false,
}) {
  const navigate = useNavigate()

  function handleCheckout() {
    if (onCheckout) onCheckout()
    else navigate('/checkout')
  }

  return (
    <aside className="cart-summary-card" aria-label="ملخص الطلب" dir="rtl">
      <h2 className="cart-summary-title">
        <span className="cart-summary-title-icon">🧾</span>
        ملخص الطلب
      </h2>

      <div className="cart-sum-row">
        <span>المجموع الفرعي ({totalQuantity} قطعة)</span>
        <span>{Number(subtotal).toFixed(2)} ج.م</span>
      </div>

      {totalDiscount > 0 && (
        <div className="cart-sum-row cart-sum-row-save">
          <span>إجمالي الخصم</span>
          <span>- {Number(totalDiscount).toFixed(2)} ج.م</span>
        </div>
      )}

      {couponCode && (
        <div className="cart-coupon-tag">
          <div className="cart-coupon-tag-left">
            <span>🏷️</span>
            <span>كوبون مطبّق</span>
          </div>
          <span className="cart-coupon-code">{couponName || couponCode}</span>
          <span className="cart-coupon-code">- {Number(couponDiscount).toFixed(2)} ج.م</span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancelCoupon}
            style={{ marginInlineStart: 'auto', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
          >
            إلغاء
          </button>
        </div>
      )}

      <div className="cart-summary-divider" />

      <div className="cart-sum-row cart-sum-row-bold cart-sum-row-green">
        <span>الإجمالي النهائي</span>
        <span>{Number(finalTotal).toFixed(2)} ج.م</span>
      </div>

      <button
        className="cart-checkout-action"
        onClick={handleCheckout}
        disabled={disabled}
      >
        إتمام الطلب →
      </button>

      <button
        className="cart-clear-btn"
        onClick={onClear}
        disabled={disabled}
        type="button"
      >
        إفراغ السلة
      </button>
    </aside>
  )
}
