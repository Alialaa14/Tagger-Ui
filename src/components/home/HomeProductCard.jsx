import React, { useState } from 'react'
import useAddToCart from '../../hooks/useAddToCart'
import useCheckAvailability from '../../hooks/useCheckAvailability'
import { useAuth } from '../../context/AuthContext'
import "./home-product-card.css"
/* ─── Skeleton ───────────────────────────────────────────────── */
export function HomeProductCardSkeleton() {
  return (
    <article className="hpc-card hpc-card--skeleton" aria-hidden="true">
      <div className="hpc-img-wrap shimmer" />
      <div className="hpc-body">
        <div className="hpc-skel hpc-skel--lg shimmer" />
        <div className="hpc-skel shimmer" />
        <div className="hpc-skel hpc-skel--sm shimmer" />
        <div className="hpc-skel-btns">
          <div className="hpc-skel shimmer" style={{ height: 42, borderRadius: 12 }} />
          <div className="hpc-skel shimmer" style={{ height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </article>
  )
}

/* ─── Availability Modal ─────────────────────────────────────── */
function AvailabilityModal({ data, error, loading, onClose }) {
  return (
    <div className="hpc-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hpc-modal" onClick={e => e.stopPropagation()} dir="rtl">

        <div className="hpc-modal__head">
          <h4>حالة التوفر</h4>
          <button className="hpc-modal__close" onClick={onClose} aria-label="إغلاق">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="hpc-modal__body">
          {loading && (
            <div className="hpc-modal__loading">
              <span className="hpc-spinner hpc-spinner--green" />
              <span>جارٍ التحقق…</span>
            </div>
          )}

          {!loading && error && (
            <div className="hpc-modal__error">⚠️ {error}</div>
          )}

          {!loading && data && (
            <>
              <div className={`hpc-avail-status ${data.available ? 'hpc-avail-status--ok' : 'hpc-avail-status--no'}`}>
                <span className="hpc-avail-dot" />
                <span>{data.available ? 'متوفر في المخزون' : 'غير متوفر حالياً'}</span>
              </div>

              {data.quantity > 0 && (
                <p className="hpc-avail-qty">
                  الكمية المتاحة: <strong>{data.quantity}</strong> قطعة
                </p>
              )}

              {Array.isArray(data.discount) && data.discount.length > 0 && (
                <div className="hpc-avail-tiers">
                  <p className="hpc-avail-tiers__title">خصومات الكميات:</p>
                  {data.discount.map((d, i) => (
                    <div key={i} className="hpc-avail-tier">
                      <span>من <strong>{d.quantity}</strong> قطعة</span>
                      <span className="hpc-tier-badge">{d.discountValue}% خصم</span>
                    </div>
                  ))}
                </div>
              )}

              {data.message && <p className="hpc-avail-msg">{data.message}</p>}
            </>
          )}
        </div>

        <div className="hpc-modal__foot">
          <button className="hpc-close-btn" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Card ──────────────────────────────────────────────── */
export default function HomeProductCard({ product }) {
  const { user } = useAuth()
  const [modalOpen, setModalOpen]       = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)

  const { isAddingToCart, addToCartRequest, addToCartError } = useAddToCart()
  const {
    isCheckingAvailability,
    availabilityData,
    availabilityError,
    checkAvailability,
    clearAvailabilityData,
    clearAvailabilityError,
  } = useCheckAvailability()

  if (!product) return null

  const imgUrl     = product?.image?.url || product?.image || ''
  const name       = product?.name       || 'منتج'
  const price      = Number(product?.price || 0)
  const sales      = Number(product?.sales || 0)
  const hasDiscount = Array.isArray(product?.discount) && product.discount.length > 0

  const role       = String(user?.role || user?.accountType || localStorage.getItem('user_role') || '').toLowerCase()
  const isCustomer = role === 'customer'

  async function handleAddToCart() {
    const res = await addToCartRequest(product)
    if (res?.ok) {
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 2000)
    }
  }

  async function handleCheckAvailability() {
    clearAvailabilityData()
    clearAvailabilityError()
    setModalOpen(true)
    await checkAvailability(product)
  }

  return (
    <>
      <article className="hpc-card" dir="rtl">

        {/* Image */}
        <div className="hpc-img-wrap">
          {imgUrl
            ? <img src={imgUrl} alt={name} className="hpc-img" loading="lazy" />
            : <div className="hpc-img-placeholder">🛒</div>
          }
          {hasDiscount && <span className="hpc-ribbon">خصم</span>}
          {sales > 200 && (
            <span className="hpc-sales-badge">
              🔥 {sales > 999 ? '+999' : sales}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="hpc-body">
          <h3 className="hpc-name" title={name}>{name}</h3>

          <div className="hpc-price-row">
            <span className="hpc-price">
              {price.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 })}
            </span>
            {hasDiscount && (
              <span className="hpc-discount-tag">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                خصم على الكميات
              </span>
            )}
          </div>

          {addToCartError && <p className="hpc-err">{addToCartError}</p>}

          {/* Buttons */}
          <div className="hpc-actions">
            {isCustomer ? (
              <button
                className={`hpc-btn hpc-btn--cart ${addedFeedback ? 'hpc-btn--added' : ''}`}
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <span className="hpc-spinner" />
                ) : addedFeedback ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    تمت الإضافة
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                    أضف للسلة
                  </>
                )}
              </button>
            ) : (
              <button className="hpc-btn hpc-btn--cart hpc-btn--disabled" disabled>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                أضف للسلة
              </button>
            )}

            <button
              className="hpc-btn hpc-btn--avail"
              onClick={handleCheckAvailability}
              disabled={isCheckingAvailability}
            >
              {isCheckingAvailability ? (
                <span className="hpc-spinner hpc-spinner--green" />
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                  تحقق من التوفر
                </>
              )}
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <AvailabilityModal
          data={availabilityData}
          error={availabilityError}
          loading={isCheckingAvailability}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
