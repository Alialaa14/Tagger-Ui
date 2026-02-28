import React, { useMemo, useState } from 'react'
import ActionButton from '../common/ActionButton'
import DiscountSection from './DiscountSection'
import useAddToCart from '../../hooks/useAddToCart'
import useCheckAvailability from '../../hooks/useCheckAvailability'

function resolveCategoryLabel(category) {
  if (!category) return 'بدون تصنيف'
  if (typeof category === 'string') return category
  return category?.name || 'بدون تصنيف'
}

function hasDiscounts(discounts) {
  return Array.isArray(discounts) && discounts.length > 0
}

function bestTier(discounts) {
  if (!hasDiscounts(discounts)) return null
  const sorted = [...discounts].sort((a, b) => b.quantity - a.quantity)
  return sorted[0]
}

export function ProductCardSkeleton() {
  return (
    <article className="product-card product-card-skeleton" aria-hidden="true">
      <div className="product-card-media shimmer" />
      <div className="product-card-body">
        <div className="s-line s-lg shimmer" />
        <div className="s-line shimmer" />
        <div className="s-line s-sm shimmer" />
      </div>
    </article>
  )
}

export default function ProductCard({ product, loading = false }) {
  const [isDiscountExpanded, setIsDiscountExpanded] = useState(false)
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)

  const {
    isAddingToCart,
    addToCartRequest,
    addToCartError,
    clearAddToCartError,
  } = useAddToCart()
  const {
    isCheckingAvailability,
    availabilityData,
    availabilityError,
    checkAvailability,
    clearAvailabilityError,
  } = useCheckAvailability()

  const productId = product?._id || product?.id || product?.image?.public_id || null
  const discounts = Array.isArray(product?.discount) ? product.discount : []
  const categoryLabel = resolveCategoryLabel(product?.category)
  const heroDiscount = useMemo(() => bestTier(discounts), [discounts])

  if (loading) return <ProductCardSkeleton />
  if (!product) return null

  async function onAddToCart() {
    clearAddToCartError()
    await addToCartRequest(product)
  }

  async function onCheckAvailability() {
    clearAvailabilityError()
    const res = await checkAvailability(product)
    if (res?.ok) setIsAvailabilityModalOpen(true)
  }

  return (
    <>
      <article className="product-card premium-product-card" dir="rtl">
        <div className="product-card-media-wrap">
          <img
            src={product?.image?.url || product?.image || ''}
            alt={product?.name}
            className="product-card-media"
            loading="lazy"
          />
          {hasDiscounts(discounts) && (
            <span className="product-discount-badge">
              خصومات كميات
            </span>
          )}
        </div>

        <div className="product-card-body">
          <h3 className="product-title">{product?.name}</h3>
          <p className="product-description line-clamp-2">{product?.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
          <p className="product-category">{categoryLabel}</p>

          <div className="product-pricing-row">
            <strong className={`product-price ${heroDiscount ? 'has-discount' : ''}`}>
              ${Number(product?.price || 0).toFixed(2)}
            </strong>
            {heroDiscount ? (
              <span className="product-tier-hint">
                خصم عند شراء {heroDiscount.quantity} قطع
              </span>
            ) : null}
          </div>

          <DiscountSection
            discounts={discounts}
            expanded={isDiscountExpanded}
            onToggle={() => setIsDiscountExpanded((v) => !v)}
          />

          {(addToCartError || availabilityError) && (
            <p className="product-inline-error">{addToCartError || availabilityError}</p>
          )}

          <div className="product-actions-row">
            <ActionButton
              variant="primary"
              loading={isAddingToCart}
              disabled={!productId}
              onClick={onAddToCart}
            >
              أضف إلى السلة
            </ActionButton>
            <ActionButton
              variant="outline"
              loading={isCheckingAvailability}
              disabled={!productId}
              onClick={onCheckAvailability}
            >
              تحقق من التوفر
            </ActionButton>
          </div>
        </div>
      </article>

      {isAvailabilityModalOpen && (
        <div className="product-modal-overlay" onClick={() => setIsAvailabilityModalOpen(false)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()} dir="rtl">
            <h4>حالة التوفر</h4>
            <p className={`availability-state ${availabilityData?.available ? 'ok' : 'not-ok'}`}>
              {availabilityData?.available ? 'متوفر حاليا' : 'غير متوفر حاليا'}
            </p>

            {Array.isArray(availabilityData?.discount) && availabilityData.discount.length > 0 && (
              <div className="availability-discounts">
                <p>شرائح الخصم المتاحة:</p>
                <ul>
                  {availabilityData.discount.map((d, idx) => (
                    <li key={`${d.quantity}-${idx}`}>من {d.quantity} قطعة: {d.discountValue}%</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="product-modal-actions">
              <ActionButton variant="outline" onClick={() => setIsAvailabilityModalOpen(false)}>
                إغلاق
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
