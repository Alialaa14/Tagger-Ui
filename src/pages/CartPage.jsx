import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CartItemCard from '../components/cart/CartItemCard'
import CartSummaryCard from '../components/cart/CartSummaryCard'
import CouponModal from '../components/cart/CouponModal'
import OrderNoteModal from '../components/cart/OrderNoteModal'
import CartSkeleton from '../components/cart/CartSkeleton'
import CartErrorBanner from '../components/cart/CartErrorBanner'
import './cart.css'

export default function CartPage() {
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
  const [noteOpen, setNoteOpen] = useState(false)

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

  if (!authLoading && !isCustomer) {
    return (
      <div className="home-page">
        <Navbar />
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
        <Footer />
      </div>
    )
  }

  return (
    <div className="home-page">
      <Navbar />

      <main className="cart-page">
        <div className="container" dir="rtl">
          <header className="cart-page-head">
            <div>
              <p className="cart-kicker">Cart</p>
              <h1>سلة التسوق</h1>
              <p>راجع الكميات والخصومات قبل إتمام الطلب.</p>
            </div>
            <div className="cart-head-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setCouponOpen(true)}>
                🏷️ كوبون
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setNoteOpen(true)}>
                📝 ملاحظة
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
              <div className="cart-items-list">
                {lineItems.map((line) => (
                  <CartItemCard
                    key={line.item.productId}
                    line={line}
                    onIncrement={increment}
                    onDecrement={decrement}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              <CartSummaryCard
                totalQuantity={totalQuantity}
                subtotal={subtotal}
                totalDiscount={totalDiscount}
                finalTotal={finalTotal}
                couponName={couponName}
                couponCode={couponCode}
                couponDiscount={couponDiscount}
                onCancelCoupon={clearCoupon}
                onCheckout={() => setActionError('ربط API الدفع لم يتم بعد.')}
                onClear={clear}
                disabled={items.length === 0}
              />
            </section>
          )}
        </div>
      </main>

      <CouponModal
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        onApply={applyCoupon}
        onCancelCoupon={clearCoupon}
        initialCode={couponCode}
      />
      <OrderNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        initialValue={orderNote}
        onSave={setOrderNote}
      />

      <Footer />
    </div>
  )
}
