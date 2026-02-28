import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import axios from 'axios'
import seedProducts from '../data/seed_products'
import { calculateCartTotals } from '../utils/cartPricing'

const STORAGE_KEY = 'cart_context_state_v2'

const CartContext = createContext(null)

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], couponCode: '', orderNote: '', couponMeta: null }
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      couponCode: parsed.couponCode || '',
      orderNote: parsed.orderNote || '',
      couponMeta: parsed.couponMeta || null,
    }
  } catch (_) {
    return { items: [], couponCode: '', orderNote: '', couponMeta: null }
  }
}

function persistState(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  } catch (_) {
    // ignore persistence issues
  }
}

function toCartItem(product, quantity = 1) {
  return {
    productId: String(product?._id || product?.id || product?.name || Date.now()),
    name: product?.name || 'Unknown product',
    imageUrl: product?.image?.url || product?.image || '',
    unitPrice: Number(product?.price) || 0,
    quantity: Math.max(1, Number(quantity) || 1),
    discounts: Array.isArray(product?.discount) ? product.discount : [],
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const incoming = action.payload
      const existing = state.items.find((item) => item.productId === incoming.productId)
      const items = existing
        ? state.items.map((item) =>
            item.productId === incoming.productId
              ? { ...item, quantity: item.quantity + incoming.quantity }
              : item
          )
        : [incoming, ...state.items]
      return { ...state, items }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.productId !== action.payload) }
    case 'SET_QUANTITY': {
      const { productId, quantity } = action.payload
      const q = Math.max(1, Number(quantity) || 1)
      return {
        ...state,
        items: state.items.map((item) => (item.productId === productId ? { ...item, quantity: q } : item)),
      }
    }
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }
    case 'DECREMENT':
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        ),
      }
    case 'SET_COUPON':
      return { ...state, couponCode: action.payload.code, couponMeta: action.payload.meta }
    case 'CLEAR_COUPON':
      return { ...state, couponCode: '', couponMeta: null }
    case 'SET_ORDER_NOTE':
      return { ...state, orderNote: action.payload.slice(0, 300) }
    case 'CLEAR_CART':
      return { ...state, items: [], couponCode: '', orderNote: '', couponMeta: null }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)

  const totals = useMemo(
    () => calculateCartTotals(state.items, state.couponMeta),
    [state.items, state.couponMeta]
  )

  const addToCart = useCallback((product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: toCartItem(product, quantity) })
  }, [])

  const removeItem = useCallback((productId) => dispatch({ type: 'REMOVE_ITEM', payload: productId }), [])
  const setQuantity = useCallback(
    (productId, quantity) => dispatch({ type: 'SET_QUANTITY', payload: { productId, quantity } }),
    []
  )
  const increment = useCallback((productId) => dispatch({ type: 'INCREMENT', payload: productId }), [])
  const decrement = useCallback((productId) => dispatch({ type: 'DECREMENT', payload: productId }), [])
  const clear = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
  const setOrderNote = useCallback((value) => dispatch({ type: 'SET_ORDER_NOTE', payload: value }), [])

  const applyCoupon = useCallback(async (code) => {
    const normalized = String(code || '').trim().toUpperCase()
    if (!normalized) return { ok: false, message: 'Please enter a coupon code.' }

    try {
      const { data } = await axios.post('http://localhost:3000/api/v1/coupons/validate', {
        code: normalized,
        items: state.items,
      })
      const payload = data?.data || data
      if (!payload || payload.valid === false) {
        return { ok: false, message: payload?.message || 'Invalid coupon code.' }
      }

      const type = payload?.type === 'percent' ? 'percent' : 'fixed'
      const value = Number(payload?.value) || 0
      dispatch({ type: 'SET_COUPON', payload: { code: normalized, meta: { type, value } } })
      return { ok: true, message: payload?.message || 'Coupon applied successfully.' }
    } catch (_) {
      // fallback for local development using seeded coupons
      const found = seedProducts.find((p) => Array.isArray(p.coupons) && p.coupons.some((c) => c.code === normalized))
      if (!found) return { ok: false, message: 'Invalid coupon code.' }
      const localCoupon = found.coupons.find((c) => c.code === normalized)
      dispatch({ type: 'SET_COUPON', payload: { code: normalized, meta: { type: 'fixed', value: Number(localCoupon.value) || 0 } } })
      return { ok: true, message: 'Coupon applied in local mode.' }
    }
  }, [state.items])

  const clearCoupon = useCallback(() => dispatch({ type: 'CLEAR_COUPON' }), [])

  const value = useMemo(() => ({
    items: state.items,
    totalQuantity: totals.totalQuantity,
    subtotal: totals.subtotal,
    totalDiscount: totals.totalDiscount,
    finalTotal: totals.finalTotal,
    couponCode: state.couponCode,
    orderNote: state.orderNote,
    lineItems: totals.lines,
    couponDiscount: totals.couponDiscount,
    addToCart,
    removeItem,
    setQuantity,
    increment,
    decrement,
    clear,
    setOrderNote,
    applyCoupon,
    clearCoupon,
  }), [
    state.items,
    state.couponCode,
    state.orderNote,
    totals,
    addToCart,
    removeItem,
    setQuantity,
    increment,
    decrement,
    clear,
    setOrderNote,
    applyCoupon,
    clearCoupon,
  ])

  useEffect(() => {
    persistState({
      items: state.items,
      couponCode: state.couponCode,
      orderNote: state.orderNote,
      couponMeta: state.couponMeta,
    })
  }, [state.items, state.couponCode, state.orderNote, state.couponMeta])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
