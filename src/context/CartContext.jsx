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
  orderNote: '',
  couponValue: 0,
}

function resolveProductId(productOrId) {
  if (typeof productOrId === 'string') return productOrId
  return productOrId?._id || productOrId?.id || productOrId?.image?.public_id || null
}

function normalizeCartItem(raw) {
  const product = raw?.product || raw?.productData || raw
  const resolvedProductId =
    raw?.productId ||
    product?._id ||
    product?.id ||
    product?.image?.public_id ||
    product?.name
  if (!resolvedProductId) return null

  const productId = String(resolvedProductId)
  return {
    productId,
    name: product?.name || raw?.name || 'Unknown product',
    imageUrl: product?.image?.url || product?.image || raw?.imageUrl || '',
    unitPrice: Number(raw?.unitPrice ?? product?.price ?? 0),
    quantity: Math.max(1, Number(raw?.quantity ?? raw?.qty ?? 1)),
    discounts: Array.isArray(raw?.discounts)
      ? raw.discounts
      : Array.isArray(product?.discount)
      ? product.discount
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
  const root = payload?.data || payload?.cart || payload || {}
  const itemsRaw =
    root?.items ||
    root?.products ||
    root?.cartItems ||
    root?.data?.items ||
    root?.data?.products ||
    root?.data?.cartItems ||
    []
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeCartItem).filter(Boolean) : []
  const couponRaw = root?.coupon || root?.couponMeta || null
  const couponName = String(
    root?.couponName ||
      root?.coupon?.name ||
      root?.coupon?.code ||
      root?.couponCode ||
      (typeof root?.coupon === 'string' ? root.coupon : '')
  ).trim()
  const couponCode = String(root?.couponCode || root?.coupon?.code || couponName).trim().toUpperCase()
  const couponValue = Number(
    root?.coupon?.discount ??
      root?.coupon?.value ??
      root?.coupon?.amount ??
      root?.couponDiscount ??
      root?.couponValue ??
      0
  )
  const couponMeta = normalizeCouponMeta(couponRaw, couponValue)
  const orderNote = String(root?.orderNote || root?.note || '')
  console.log(`Cart payload:`, { items, couponName, couponCode, couponMeta, orderNote, couponValue })
  return { items, couponName, couponCode, couponMeta, orderNote, couponValue }
}


function payloadHasCartItems(payload) {
  const root = payload?.data || payload?.cart || payload || {}
  return (
    Array.isArray(root?.items) ||
    Array.isArray(root?.products) ||
    Array.isArray(root?.cartItems) ||
    Array.isArray(root?.data?.items) ||
    Array.isArray(root?.data?.products) ||
    Array.isArray(root?.data?.cartItems)
  )
}

async function requestWithFallback(method, urls, config = {}) {
  const list = Array.isArray(urls) ? urls : [urls]
  let lastError = null
  for (const url of list) {
    try {
      return await axios({ method, url, withCredentials: true, ...config })
    } catch (err) {
      lastError = err
      const status = err?.response?.status
      if (status && status !== 404) break
    }
  }
  throw lastError
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [state, setState] = useState({
    ...EMPTY_CART_STATE,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const role = String(user?.role || user?.accountType || localStorage.getItem('user_role') || '').toLowerCase()
  const isAdmin = role === 'admin'
  const currentUserId = String(user?._id || user?.id || '')

  const ensureUserCartAccess = useCallback(() => {
    if (isAdmin) {
      const message = 'This cart operation is for user accounts only.'
      setError(message)
      return { ok: false, message }
    }
    return { ok: true }
  }, [isAdmin])

  const ensureAdminAccess = useCallback(() => {
    if (!isAdmin) {
      const message = 'This operation is for admin accounts only.'
      setError(message)
      return { ok: false, message }
    }
    return { ok: true }
  }, [isAdmin])

  const hydrateFromPayload = useCallback((payload) => {
    const normalized = normalizeCartPayload(payload)
    setState(normalized)
    return normalized
  }, [])

  const getCart = useCallback(async (userId = null) => {
    setLoading(true)
    setError('')
    try {
      const targetUserId = userId ? String(userId) : ''
      let urls = []

      if (targetUserId) {
        if (!isAdmin) {
          const message = 'Passing userId to getCart is allowed for admin only.'
          setError(message)
          return null
        }
        urls = [
          `${API_BASE_URL}/${encodeURIComponent(targetUserId)}`,
          `${API_BASE_URL}/get-cart/${encodeURIComponent(targetUserId)}`,
          `${API_BASE_URL}?userId=${encodeURIComponent(targetUserId)}`,
        ]
      } else {
        urls = [
          `${API_BASE_URL}`,
          `${API_BASE_URL}/my-cart`,
          `${API_BASE_URL}/get-cart`,
        ]
        if (currentUserId) {
          urls.push(`${API_BASE_URL}?userId=${encodeURIComponent(currentUserId)}`)
        }
      }

      const { data } = await requestWithFallback('get', urls)
      return hydrateFromPayload(data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch cart.')
      return null
    } finally {
      setLoading(false)
    }
  }, [hydrateFromPayload, isAdmin, currentUserId])

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
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => String(item.productId) !== String(productId)),
    }))
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}?productId=${encodeURIComponent(productId)}`,
        {},
        { withCredentials: true }
      )
      hydrateFromPayload(data)
      return { ok: true, data }
    } catch (err) {
      setState(previousState)
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove item from cart.'
      setError(msg)
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, state])

  const updateCart = useCallback(async ({ note, couponCode, coupon, order } = {}) => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    setError('')
    const previousState = state
    try {
      const payload = {}
      const resolvedCoupon = coupon != null ? coupon : couponCode
      const resolvedOrder = order != null ? order : note
      if (resolvedCoupon != null) {
        payload.coupon = String(resolvedCoupon).trim().toUpperCase()
      }
      if (resolvedOrder != null) {
        payload.order = String(resolvedOrder).slice(0, 300)
      }

      // Optimistic local update so fields are reflected immediately.
      setState((prev) => ({
        ...prev,
        ...(resolvedCoupon != null ? { couponCode: String(resolvedCoupon).trim().toUpperCase() } : {}),
        ...(resolvedOrder != null ? { orderNote: String(resolvedOrder).slice(0, 300) } : {}),
      }))

      const { data } = await axios.patch(API_BASE_URL, payload, { withCredentials: true })

      // Some backends return only message/partial payload on patch.
      // Hydrate full state only when cart items are present; otherwise keep existing items.
      if (payloadHasCartItems(data)) {
        hydrateFromPayload(data)
      } else {
        const normalized = normalizeCartPayload(data)
        setState((prev) => ({
          ...prev,
          ...(normalized.couponName !== undefined ? { couponName: normalized.couponName } : {}),
          ...(normalized.couponCode !== undefined ? { couponCode: normalized.couponCode } : {}),
          ...(normalized.orderNote !== undefined ? { orderNote: normalized.orderNote } : {}),
          ...(normalized.couponMeta !== undefined ? { couponMeta: normalized.couponMeta } : {}),
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
  }, [ensureUserCartAccess, state])

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
        const normalized = normalizeCartPayload(data)
        setState((prev) => ({
          ...prev,
          ...(normalized.orderNote !== undefined ? { orderNote: normalized.orderNote } : {}),
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

  const changeQuantity = useCallback(async (productId, opt) => {
    const access = ensureUserCartAccess()
    if (!access.ok) return access
    if (!productId) return { ok: false, message: 'Missing productId' }
    const normalizedOpt = opt === 'dec' ? 'dec' : 'inc'
    setError('')
    try {
      const { data } = await requestWithFallback(
        'put',
        [`${API_BASE_URL}/quantity`, `${API_BASE_URL}/change-quantity`, `${API_BASE_URL}/changeQuantity`],
        { data: { productId, opt: normalizedOpt } }
      )
      hydrateFromPayload(data)
      return { ok: true, data }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to change quantity.'
      setError(msg)
      return { ok: false, message: msg }
    }
  }, [ensureUserCartAccess, hydrateFromPayload])

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
    if (isAdmin) return
    getCart().catch(() => {
      // errors are set in state
    })
  }, [getCart, isAdmin])

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
    orderNote: state.orderNote,
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
    state.orderNote,
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
