import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { calculateCartTotals } from '../utils/cartPricing'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const API_BASE_URL = 'http://localhost:3000/api/v1/cart'
const EMPTY_CART_STATE = {
  items: [],
  couponName: '',
  couponCode: '',
  couponMeta: null,
  note: '',
  couponValue: 0,
}

function resolveProductId(productOrId) {
  if (typeof productOrId === 'string') return productOrId
  return productOrId?._id || productOrId?.id || productOrId?.image?.public_id || null
}

function normalizeCartItem(raw) {
  // API shape: { product: "ID_or_object", quantity, totalPrice, _id }
  // product can be a plain ID string OR a populated object
  const productRaw = raw?.product ?? raw?.productData ?? null
  const isProductString = typeof productRaw === 'string'

  // Resolve productId — from explicit field, or from the product object/string
  const resolvedProductId =
    raw?.productId ||
    (isProductString ? productRaw : null) ||
    productRaw?._id ||
    productRaw?.id ||
    productRaw?.image?.public_id ||
    null

  if (!resolvedProductId) return null

  // If product is an ID-only string with no accompanying name/price data,
  // this is an unpopulated/ghost item (e.g. from a delete response) — skip it
  if (isProductString && !raw?.name && !raw?.productName && !raw?.unitPrice && !raw?.price) {
    return null
  }

  const productId = String(resolvedProductId)

  const name = isProductString
    ? (raw?.name || raw?.productName || 'منتج')
    : (productRaw?.name || raw?.name || 'منتج')

  const imageUrl = isProductString
    ? (raw?.imageUrl || raw?.image || '')
    : (productRaw?.image?.url || productRaw?.image || raw?.imageUrl || '')

  const unitPrice = isProductString
    ? Number(raw?.unitPrice ?? raw?.price ?? raw?.totalPrice ?? 0)
    : Number(raw?.unitPrice ?? productRaw?.price ?? raw?.price ?? 0)

  return {
    productId,
    name,
    imageUrl,
    unitPrice,
    quantity: Math.max(1, Number(raw?.quantity ?? raw?.qty ?? 1)),
    lineTotalFromApi: Number(raw?.totalPrice ?? 0),
    discounts: Array.isArray(raw?.discounts)
      ? raw.discounts
      : Array.isArray(productRaw?.discount)
      ? productRaw.discount
      : [],
  }
}

function toOptimisticCartItem(productOrId, quantity = 1) {
  if (!productOrId) return null
  if (typeof productOrId === 'string') {
    return {
      productId: String(productOrId),
      name: 'Product',
      imageUrl: '',
      unitPrice: 0,
      quantity: Math.max(1, Number(quantity) || 1),
      discounts: [],
    }
  }

  const productId = resolveProductId(productOrId)
  if (!productId) return null
  return {
    productId: String(productId),
    name: String(productOrId?.name || 'Product'),
    imageUrl: productOrId?.image?.url || productOrId?.image || '',
    unitPrice: Number(productOrId?.price ?? 0),
    quantity: Math.max(1, Number(quantity) || 1),
    discounts: Array.isArray(productOrId?.discount) ? productOrId.discount : [],
  }
}

function normalizeCouponMeta(raw, fallbackValue = null) {
  if (!raw || typeof raw === 'string') {
    if (Number.isFinite(Number(fallbackValue)) && Number(fallbackValue) > 0) {
      return { type: 'fixed', value: Number(fallbackValue) }
    }
    return null
  }

  const rawType = String(raw?.type || raw?.discountType || '').toLowerCase()
  const type = rawType.includes('percent') ? 'percent' : rawType.includes('fixed') ? 'fixed' : null
  const value = Number(raw?.value ?? raw?.discount ?? raw?.amount ?? fallbackValue)
  if (!Number.isFinite(value) || value <= 0) return null
  if (type) return { type, value }
  return { type: 'fixed', value }
}

function normalizeCartPayload(payload) {
  // Support all common response shapes including { updatedCart: {...} }
  const root =
    payload?.updatedCart ||
    payload?.data ||
    payload?.cart ||
    payload ||
    {}

  // Products array — API uses "products" key
  const itemsRaw =
    root?.products ||
    root?.items ||
    root?.cartItems ||
    root?.data?.products ||
    root?.data?.items ||
    root?.data?.cartItems ||
    []
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeCartItem).filter(Boolean) : []

  // Coupon — API returns a populated object: { _id, name, discount, expiry, ... }
  // or null/undefined when no coupon is applied
  const couponRaw = root?.coupon ?? root?.couponMeta ?? null
  const hasCoupon = couponRaw && typeof couponRaw === 'object'

  // coupon.name is the display name / code (e.g. "FIRST 2")
  const couponName = hasCoupon
    ? String(couponRaw.name || couponRaw.code || '').trim()
    : ''

  // Use name as the code (what the user typed), uppercased
  const couponCode = hasCoupon
    ? String(couponRaw.name || couponRaw.code || couponRaw._id || '').trim().toUpperCase()
    : ''

  // coupon.discount is the fixed discount amount
  const couponValue = hasCoupon
    ? Number(couponRaw.discount ?? couponRaw.value ?? couponRaw.amount ?? 0)
    : 0

  const couponMeta = hasCoupon
    ? { type: 'fixed', value: couponValue, id: String(couponRaw._id || ''), expiry: couponRaw.expiry || null }
    : null

  // Note — API uses "note" key
  const note = String(root?.note || root?.note || '')

  return { items, couponName, couponCode, couponMeta, note, couponValue }
}

function payloadHasCartItems(payload) {
  // Support all common response shapes including { updatedCart: {...} }
  const root =
    payload?.updatedCart ||
    payload?.data ||
    payload?.cart ||
    payload ||
    {}
  return (
    Array.isArray(root?.products) ||
    Array.isArray(root?.items) ||
    Array.isArray(root?.cartItems) ||
    Array.isArray(root?.data?.products) ||
    Array.isArray(root?.data?.items) ||
    Array.isArray(root?.data?.cartItems)
  )
}

async function requestWithFallback(method, urls, config = {}) {
  const list = Array.isArray(urls) ? urls : [urls]
  let lastErr = null
  for (const url of list) {
    try {
      const res = await axios({ method, url, withCredentials: true, ...config })
      return res
    } catch (err) {
      lastErr = err
      const status = err?.response?.status
      if (status && status !== 404 && status !== 405) throw err
    }
  }
  throw lastErr
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState(EMPTY_CART_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentUserId = user?._id || user?.id || null
  const role = String(user?.role || user?.accountType || localStorage.getItem('user_role') || '').toLowerCase()
  const isAdmin = role === 'admin'
  const isCustomer = role === 'customer' || role === 'user'

  const ensureUserCartAccess = useCallback(() => {
    if (!user) return { ok: false, message: 'Please log in.' }
    if (isAdmin) return { ok: false, message: 'Admins cannot modify cart.' }
    return { ok: true }
  }, [user, isAdmin])

  const ensureAdminAccess = useCallback(() => {
    if (!isAdmin) return { ok: false, message: 'Admin access required.' }
    return { ok: true }
  }, [isAdmin])

  const hydrateFromPayload = useCallback((payload) => {
    if (!payload) return
    if (payloadHasCartItems(payload)) {
      const normalized = normalizeCartPayload(payload)
      setState((prev) => ({
        ...prev,
        items: normalized.items,
        couponName: normalized.couponName,
        couponCode: normalized.couponCode,
        couponMeta: normalized.couponMeta,
        couponValue: normalized.couponValue,
        note: normalized.note,
      }))
    } else {
      const normalized = normalizeCartPayload(payload)
      setState((prev) => ({
        ...prev,
        ...(normalized.couponCode !== undefined ? { couponCode: normalized.couponCode } : {}),
        ...(normalized.note !== undefined ? { note: normalized.note } : {}),
        ...(normalized.couponMeta ? { couponMeta: normalized.couponMeta } : {}),
        ...(Number.isFinite(Number(normalized.couponValue)) ? { couponValue: Number(normalized.couponValue) } : {}),
      }))
    }
  }, [])

  const getCart = useCallback(async () => {
    if (isAdmin || authLoading) return null
    if (!user) return null
    setLoading(true)
    setError('')
    try {
      const { data } = await requestWithFallback('get', [
        API_BASE_URL,
        `${API_BASE_URL}/get-cart`,
        `${API_BASE_URL}/my-cart`,
      ])
      hydrateFromPayload(data)
      return data
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch cart.'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [hydrateFromPayload, isAdmin, authLoading, user])

  const getAdminCarts = useCallback(async () => {
    const access = ensureAdminAccess()
    if (!access.ok) return []
    setError('')
    try {
      const { data } = await requestWithFallback('get', [`${API_BASE_URL}/get-carts`, `${API_BASE_URL}/carts`])
      return data?.data || data
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch carts.')
      return []
    }
  }, [ensureAdminAccess])

  const addToCart = useCallback(async (productOrId, quantity = 1) => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    const productId = resolveProductId(productOrId)
    if (!productId) return { ok: false, message: 'Missing productId' }

    const previousState = state
    const optimisticItem = toOptimisticCartItem(productOrId, quantity)
    if (optimisticItem) {
      setState((prev) => {
        const existingIndex = prev.items.findIndex((item) => String(item.productId) === String(optimisticItem.productId))
        if (existingIndex >= 0) {
          const nextItems = [...prev.items]
          nextItems[existingIndex] = {
            ...nextItems[existingIndex],
            quantity: Math.max(1, Number(nextItems[existingIndex].quantity) || 1) + optimisticItem.quantity,
          }
          return { ...prev, items: nextItems }
        }
        return { ...prev, items: [optimisticItem, ...prev.items] }
      })
    }

    setError('')
    try {
      const payload = { productId, quantity: Math.max(1, Number(quantity) || 1) }
      const { data } = await axios.post(API_BASE_URL, payload, { withCredentials: true })
      hydrateFromPayload(data)
      return { ok: true, data }
    } catch (err) {
      setState(previousState)
      const msg = err?.response?.data?.message || err?.message || 'Failed to add product to cart.'
      setError(msg)
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, hydrateFromPayload, state])

  const removeItem = useCallback(async (productId) => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    if (!productId) return { ok: false, message: 'Missing productId' }

    setError('')
    const previousState = state

    // Optimistic: remove immediately from UI — this is the source of truth
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => String(item.productId) !== String(productId)),
    }))

    try {
      await axios.delete(
        `${API_BASE_URL}?productId=${encodeURIComponent(productId)}`,
        { withCredentials: true }
      )
      // Do NOT hydrate from response — the backend may return unpopulated product
      // objects for the deleted item. The optimistic state above is already correct.
      return { ok: true }
    } catch (err) {
      // Revert optimistic removal on failure
      setState(previousState)
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove item from cart.'
      setError(msg)
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, state])

  const updateCart = useCallback(async (updates) => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    setError('')
    const previousState = state

    // Optimistic update for note/coupon fields
    setState((prev) => ({
      ...prev,
      ...(updates.note !== undefined ? { note: String(updates.note).slice(0, 300) } : {}),
      ...(updates.note !== undefined ? { note: String(updates.note).slice(0, 300) } : {}),
    }))

    try {
      const body = {
        ...(updates.couponCode !== undefined ? { couponCode: String(updates.couponCode) } : {}),
        ...(updates.note !== undefined ? { note: String(updates.note).slice(0, 300) } : {}),
        ...(updates.note !== undefined ? { note: String(updates.note).slice(0, 300) } : {}),
      }
      const { data } = await axios.patch(API_BASE_URL, body, { withCredentials: true })
      if (payloadHasCartItems(data)) {
        hydrateFromPayload(data)
      } else {
        const normalized = normalizeCartPayload(data)
        setState((prev) => ({
          ...prev,
          ...(normalized.couponCode !== undefined ? { couponCode: normalized.couponCode } : {}),
          ...(normalized.note !== undefined ? { note: normalized.note } : {}),
          ...(normalized.couponMeta ? { couponMeta: normalized.couponMeta } : {}),
          ...(Number.isFinite(Number(normalized.couponValue)) ? { couponValue: Number(normalized.couponValue) } : {}),
        }))
      }
      return { ok: true, data }
    } catch (err) {
      setState(previousState)
      const msg = err?.response?.data?.message || err?.message || 'Failed to update cart.'
      setError(msg)
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, hydrateFromPayload, state])

  const applyCoupon = useCallback(async (code) => {
    const normalized = String(code || '').trim().toUpperCase()
    if (!normalized) return { ok: false, message: 'Please enter a coupon code.' }
    return updateCart({ couponCode: normalized })
  }, [updateCart])

  const clearCoupon = useCallback(async () => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    const previousState = state
    setState((prev) => ({ ...prev, couponName: '', couponCode: '', couponMeta: null, couponValue: 0 }))
    setError('')
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/cancel-coupon`, { withCredentials: true })
      if (payloadHasCartItems(data)) {
        hydrateFromPayload(data)
      } else {
        setState((prev) => ({
          ...prev,
          couponName: '',
          couponCode: '',
          couponMeta: null,
          couponValue: 0,
        }))
      }
      return { ok: true, data }
    } catch (err) {
      setState(previousState)
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel coupon.'
      setError(msg)
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, hydrateFromPayload, state])

  const setOrderNote = useCallback(async (note) => {
    return updateCart({ note: String(note || '') })
  }, [updateCart])

  // FIX: Optimistic quantity change so navbar badge updates immediately
  const changeQuantity = useCallback(async (productId, opt) => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    if (!productId) return { ok: false, message: 'Missing productId' }
    const normalizedOpt = opt === 'dec' ? 'dec' : 'inc'
    setError('')

    // Optimistic update: change qty immediately in UI
    setState((prev) => {
      const idx = prev.items.findIndex((item) => String(item.productId) === String(productId))
      if (idx < 0) return prev
      const nextItems = [...prev.items]
      const current = nextItems[idx]
      const newQty = normalizedOpt === 'inc'
        ? current.quantity + 1
        : Math.max(1, current.quantity - 1)
      nextItems[idx] = { ...current, quantity: newQty }
      return { ...prev, items: nextItems }
    })

    try {
      // Use query params: PUT /cart/change-quantity?productId=...&opt=inc|dec
      const { data } = await axios.put(
        `${API_BASE_URL}/change-quantity?productId=${encodeURIComponent(productId)}&opt=${normalizedOpt}`,
        {},
        { withCredentials: true }
      )
      hydrateFromPayload(data)
      return { ok: true, data }
    } catch (err) {
      // Revert optimistic update on failure by re-fetching
      const msg = err?.response?.data?.message || err?.message || 'Failed to change quantity.'
      setError(msg)
      getCart().catch(() => {})
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, hydrateFromPayload, getCart])

  const increment = useCallback((productId) => changeQuantity(productId, 'inc'), [changeQuantity])
  const decrement = useCallback((productId) => changeQuantity(productId, 'dec'), [changeQuantity])

  const setQuantity = useCallback(async (productId, quantity) => {
    const q = Math.max(1, Number(quantity) || 1)
    const current = state.items.find((item) => String(item.productId) === String(productId))
    const currentQ = Math.max(1, Number(current?.quantity) || 1)
    if (!current) return { ok: false, message: 'Product not found in cart.' }
    if (q === currentQ) return { ok: true }

    let result = { ok: true }
    const times = Math.abs(q - currentQ)
    const opt = q > currentQ ? 'inc' : 'dec'
    for (let i = 0; i < times; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      result = await changeQuantity(productId, opt)
      if (!result.ok) break
    }
    return result
  }, [changeQuantity, state.items])

  const clear = useCallback(async () => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    setError('')
    const previousState = state
    setState({ ...EMPTY_CART_STATE })
    try {
      await axios.delete(API_BASE_URL, { withCredentials: true })
      setState({ ...EMPTY_CART_STATE })
      return { ok: true }
    } catch (err) {
      setState(previousState)
      const msg = err?.response?.data?.message || err?.message || 'Failed to clear cart.'
      setError(msg)
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, state])

  useEffect(() => {
    if (isAdmin || authLoading) return
    if (!user) {
      setState({ ...EMPTY_CART_STATE })
      return
    }
    getCart().catch(() => {})
  }, [getCart, isAdmin, authLoading, user])

  const totals = useMemo(
    () => calculateCartTotals(state.items, state.couponMeta, state.couponValue),
    [state.items, state.couponMeta, state.couponValue]
  )

  const value = useMemo(() => ({
    apiBaseUrl: API_BASE_URL,
    items: state.items,
    totalQuantity: totals.totalQuantity,
    subtotal: totals.subtotal,
    totalDiscount: totals.totalDiscount,
    finalTotal: totals.finalTotal,
    couponName: state.couponName,
    couponCode: state.couponCode,
    couponValue: state.couponValue,
    note: state.note,
    lineItems: totals.lines,
    couponDiscount: totals.couponDiscount,
    loading,
    error,
    getCart,
    getAdminCarts,
    addToCart,
    removeItem,
    updateCart,
    applyCoupon,
    clearCoupon,
    cancelCoupon: clearCoupon,
    setOrderNote,
    changeQuantity,
    setQuantity,
    increment,
    decrement,
    clear,
    clearCart: clear,
  }), [
    state.items,
    state.couponName,
    state.couponCode,
    state.couponValue,
    state.note,
    totals,
    loading,
    error,
    getCart,
    getAdminCarts,
    addToCart,
    removeItem,
    updateCart,
    applyCoupon,
    clearCoupon,
    setOrderNote,
    changeQuantity,
    setQuantity,
    increment,
    decrement,
    clear,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
