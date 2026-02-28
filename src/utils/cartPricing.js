export function normalizeDiscountRules(discounts) {
  if (!Array.isArray(discounts)) return []
  return discounts
    .filter((d) => Number.isFinite(Number(d?.quantity)) && Number.isFinite(Number(d?.discountValue)))
    .map((d) => ({ quantity: Number(d.quantity), discountValue: Number(d.discountValue) }))
    .sort((a, b) => b.quantity - a.quantity)
}

export function getBestDiscountRule(discounts, quantity) {
  const rules = normalizeDiscountRules(discounts)
  return rules.find((rule) => quantity >= rule.quantity) || null
}

export function calculateLinePricing(item) {
  const quantity = Math.max(1, Number(item?.quantity) || 1)
  const unitPrice = Number(item?.unitPrice) || 0
  const baseTotal = unitPrice * quantity
  const bestRule = getBestDiscountRule(item?.discounts, quantity)

  // discountValue is treated as percentage (0-100) for scalable pricing rules.
  const discountPercent = bestRule ? Math.min(Math.max(bestRule.discountValue, 0), 100) : 0
  const discountAmount = (baseTotal * discountPercent) / 100
  const finalTotal = Math.max(0, baseTotal - discountAmount)

  return {
    baseTotal,
    discountPercent,
    discountAmount,
    finalTotal,
    bestRule,
  }
}

export function calculateCartTotals(items, couponMeta) {
  const safeItems = Array.isArray(items) ? items : []
  const lines = safeItems.map((item) => ({ item, pricing: calculateLinePricing(item) }))

  const totalQuantity = safeItems.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0)
  const subtotal = lines.reduce((sum, line) => sum + line.pricing.baseTotal, 0)
  const itemsDiscount = lines.reduce((sum, line) => sum + line.pricing.discountAmount, 0)

  let couponDiscount = 0
  if (couponMeta?.type === 'percent') {
    couponDiscount = ((subtotal - itemsDiscount) * (Number(couponMeta.value) || 0)) / 100
  } else if (couponMeta?.type === 'fixed') {
    couponDiscount = Number(couponMeta.value) || 0
  }

  couponDiscount = Math.max(0, couponDiscount)
  const totalDiscount = itemsDiscount + couponDiscount
  const finalTotal = Math.max(0, subtotal - totalDiscount)

  return {
    lines,
    totalQuantity,
    subtotal,
    totalDiscount,
    finalTotal,
    itemsDiscount,
    couponDiscount,
  }
}
