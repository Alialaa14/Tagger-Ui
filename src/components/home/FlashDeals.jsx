import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Countdown hook ────────────────────────────────────────────
function useCountdown(targetMs) {
  const [timeLeft, setTimeLeft] = useState(targetMs - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      const remaining = targetMs - Date.now()
      setTimeLeft(remaining > 0 ? remaining : 0)
    }, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  const totalSecs = Math.floor(timeLeft / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return { h, m, s, expired: timeLeft <= 0 }
}

// ── Pad helper ────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0')

// ── Single deal card ──────────────────────────────────────────
function DealCard({ product }) {
  const hasDiscount = product.discount && product.discount.length > 0
  const bestDiscount = hasDiscount
    ? Math.max(...product.discount.map((d) => d.discountValue || d.discount || 0))
    : 0
  const discountedPrice = hasDiscount
    ? (product.price - bestDiscount).toFixed(2)
    : product.price

  return (
    <Link
      to={`/product/${product._id || product.id}`}
      className="deal-card"
      aria-label={product.name}
    >
      <div className="deal-card-image-wrap">
        {product.image?.url || product.imageUrl ? (
          <img
            src={product.image?.url || product.imageUrl}
            alt={product.name}
            className="deal-card-image"
            loading="lazy"
          />
        ) : (
          <div className="deal-card-image-placeholder">
            <span>🛍️</span>
          </div>
        )}
        {hasDiscount && (
          <span className="deal-badge">
            -{bestDiscount} ج.م
          </span>
        )}
      </div>

      <div className="deal-card-body">
        <p className="deal-card-name line-clamp-2">{product.name}</p>
        <div className="deal-card-pricing">
          <span className="deal-card-new-price">{discountedPrice} ج.م</span>
          {hasDiscount && (
            <span className="deal-card-old-price">{product.price} ج.م</span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Flash Deals section ───────────────────────────────────────
export default function FlashDeals({ products = [] }) {
  // End of day countdown
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  const { h, m, s, expired } = useCountdown(endOfDay.getTime())

  // Only products with discounts
  const dealProducts = products.filter(
    (p) => p.discount && p.discount.length > 0
  )

  if (dealProducts.length === 0) return null

  return (
    <section className="flash-deals-section section container" dir="rtl">
      {/* ── Header ── */}
      <div className="flash-deals-header">
        <div className="flash-deals-title-group">
          <span className="flash-deals-icon">⚡</span>
          <div>
            <h3 className="flash-deals-title">عروض اليوم</h3>
            <p className="flash-deals-subtitle">خصومات حصرية لفترة محدودة</p>
          </div>
        </div>

        {!expired && (
          <div className="flash-deals-timer" aria-label="الوقت المتبقي">
            <span className="flash-timer-label">ينتهي خلال</span>
            <div className="flash-timer-blocks">
              <div className="flash-timer-block">
                <span className="flash-timer-digit">{pad(h)}</span>
                <span className="flash-timer-unit">س</span>
              </div>
              <span className="flash-timer-sep">:</span>
              <div className="flash-timer-block">
                <span className="flash-timer-digit">{pad(m)}</span>
                <span className="flash-timer-unit">د</span>
              </div>
              <span className="flash-timer-sep">:</span>
              <div className="flash-timer-block">
                <span className="flash-timer-digit">{pad(s)}</span>
                <span className="flash-timer-unit">ث</span>
              </div>
            </div>
          </div>
        )}

        {expired && (
          <span className="flash-expired-badge">انتهت العروض</span>
        )}
      </div>

      {/* ── Scrollable row ── */}
      <div className="flash-deals-scroll-track">
        <div className="flash-deals-row">
          {dealProducts.map((p) => (
            <DealCard key={p._id || p.id || p.name} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
