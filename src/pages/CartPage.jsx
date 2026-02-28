import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import CartItemCard from '../components/cart/CartItemCard'
import CartSummaryCard from '../components/cart/CartSummaryCard'
import CouponModal from '../components/cart/CouponModal'
import OrderNoteModal from '../components/cart/OrderNoteModal'
import CartSkeleton from '../components/cart/CartSkeleton'
import CartErrorBanner from '../components/cart/CartErrorBanner'

export default function CartPage() {
  const {
    items,
    lineItems,
    totalQuantity,
    subtotal,
    totalDiscount,
    finalTotal,
    couponCode,
    orderNote,
    increment,
    decrement,
    removeItem,
    clear,
    setOrderNote,
    applyCoupon,
  } = useCart()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(timer)
  }, [])

  const isEmpty = !loading && items.length === 0
  const hasError = useMemo(() => Boolean(error), [error])

  return (
    <div className="home-page">
      <Navbar />

      <main className="cart-page">
        <div className="container">
          <header className="cart-page-head">
            <div>
              <p className="cart-kicker">Cart</p>
              <h1>Your Cart</h1>
              <p>Review quantities, discounts, coupon, and order note before checkout.</p>
            </div>
            <div className="cart-head-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setCouponOpen(true)}>Coupon</button>
              <button type="button" className="btn btn-ghost" onClick={() => setNoteOpen(true)}>Order note</button>
            </div>
          </header>

          <CartErrorBanner message={hasError ? error : ''} onClose={() => setError('')} />

          {loading && <CartSkeleton />}

          {isEmpty && (
            <section className="cart-empty-state">
              <h2>Your cart is empty</h2>
              <p>Add products to unlock quantity discounts and checkout.</p>
              <Link to="/" className="btn cart-checkout-btn">Go shopping</Link>
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
                onCheckout={() => setError('Checkout API integration is not wired yet.')}
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
