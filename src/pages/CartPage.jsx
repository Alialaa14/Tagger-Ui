import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CartItemCard from '../components/cart/CartItemCard'
import CartSummaryCard from '../components/cart/CartSummaryCard'
import CartNote from '../components/cart/CartNote'
import CouponModal from '../components/cart/CouponModal'
import CartSkeleton from '../components/cart/CartSkeleton'
import CartErrorBanner from '../components/cart/CartErrorBanner'
import BackNavigator from '../components/common/BackNavigator'
import './cart.css'

export default function CartPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const {
    items,
    lineItems,
    totalQuantity,
    subtotal,
    totalDiscount,
    finalTotal,
    couponName,
    couponCode,
    couponDiscount,
    orderNote,
    increment,
    decrement,
    removeItem,
    clear,
    clearCoupon,
    setOrderNote,
    applyCoupon,
    getCart,
    loading: cartLoading,
    error: cartError,
  } = useCart()

  const [actionError, setActionError] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)

  const role = String(user?.role || user?.accountType || localStorage.getItem('user_role') || '').toLowerCase()
  const isCustomer = role === 'user' || role === 'customer'

  useEffect(() => {
    if (authLoading || !isCustomer) return
    getCart().catch(() => {
      // handled by context error state
    })
  }, [authLoading, isCustomer, getCart])

  const loading = authLoading || cartLoading
  const isEmpty = !loading && items.length === 0
  const errorMessage = useMemo(() => actionError || cartError || '', [actionError, cartError])

  // ── Handlers ──────────────────────────────────────────────────

  async function handleIncrement(productId) {
    const result = await increment(productId)
    if (result && !result.ok) setActionError(result.message || 'فشل تغيير الكمية')
  }

  async function handleDecrement(productId) {
    const result = await decrement(productId)
    if (result && !result.ok) setActionError(result.message || 'فشل تغيير الكمية')
  }

  async function handleRemove(productId) {
    const result = await removeItem(productId)
    if (result && !result.ok) setActionError(result.message || 'فشل حذف المنتج')
  }

  async function handleApplyCoupon(code) {
    setActionError('')
    const result = await applyCoupon(code)
    if (result && !result.ok) setActionError(result.message || 'كود الكوبون غير صحيح')
    return result
  }

  async function handleCancelCoupon() {
    setActionError('')
    const result = await clearCoupon()
    if (result && !result.ok) setActionError(result.message || 'فشل إلغاء الكوبون')
    return result
  }

  async function handleSaveNote(note) {
    setActionError('')
    const result = await setOrderNote(note)
    if (result && !result.ok) setActionError(result.message || 'فشل حفظ الملاحظة')
  }

  async function handleClear() {
    setActionError('')
    const result = await clear()
    if (result && !result.ok) setActionError(result.message || 'فشل إفراغ السلة')
  }

  function handleCheckout() {
    if (items.length === 0) return
    navigate('/checkout')
  }

  // ── Not a customer ────────────────────────────────────────────
  if (!authLoading && !isCustomer) {
    return (
      <div className="home-page">
        <main className="cart-page">
          <div className="container">
            <section className="cart-empty-state">
              <span className="cart-empty-icon">🔒</span>
              <h2>السلة متاحة للعملاء فقط</h2>
              <p>حسابك الحالي لا يملك صلاحية الوصول إلى السلة.</p>
              <Link to="/" className="btn btn-primary cart-checkout-btn">العودة للرئيسية</Link>
            </section>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="home-page">

      <main className="cart-page">
        <div className="container" dir="rtl">
          <BackNavigator fallback="/" />
          <header className="cart-page-head">
            <div>
              <p className="cart-kicker">Cart</p>
              <h1>سلة التسوق</h1>
              <p>راجع الكميات والخصومات قبل إتمام الطلب.</p>
            </div>
            <div className="cart-head-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setCouponOpen(true)}>
                🏷️ {couponCode ? `كوبون: ${couponCode}` : 'كوبون'}
              </button>
            </div>
          </header>

          <CartErrorBanner message={errorMessage} onClose={() => setActionError('')} />

          {loading && <CartSkeleton />}

          {isEmpty && (
            <section className="cart-empty-state">
              <span className="cart-empty-icon">🛒</span>
              <h2>السلة فارغة</h2>
              <p>أضف منتجات للاستفادة من خصومات الكمية وإتمام الطلب.</p>
              <Link to="/" className="btn btn-primary cart-checkout-btn">تصفح المنتجات</Link>
            </section>
          )}

          {!loading && !isEmpty && (
            <section className="cart-page-grid">
              <div className="cart-items-col">
                <div className="cart-items-list">
                  {lineItems.map((line) => (
                    <CartItemCard
                      key={line.item.productId}
                      line={line}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>

                {/* Single note component: write → save to API → display */}
                <CartNote />
              </div>

              <CartSummaryCard
                totalQuantity={totalQuantity}
                subtotal={subtotal}
                totalDiscount={totalDiscount}
                finalTotal={finalTotal}
                couponName={couponName}
                couponCode={couponCode}
                couponDiscount={couponDiscount}
                onCancelCoupon={handleCancelCoupon}
                onCheckout={handleCheckout}
                onClear={handleClear}
                disabled={items.length === 0}
              />
            </section>
          )}
        </div>
      </main>

      <CouponModal
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        onApply={handleApplyCoupon}
        onCancelCoupon={handleCancelCoupon}
        initialCode={couponCode}
      />
    </div>
  )
}
