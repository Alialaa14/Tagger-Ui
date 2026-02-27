import React from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from '../store/store'
import { toggle, open, close, add, increment, decrement, remove, setNote as setNoteAction, applyCoupon as applyCouponAction, clear, selectCart } from '../store/cartSlice'
import productsSeed from '../data/seed_products'

// CartProvider still used in main.jsx — wrap redux Provider
export function CartProvider({ children }){
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

// useCart keeps the original API but backed by redux
export function useCart(){
  const state = useSelector(selectCart)
  const dispatch = useDispatch()

  const addToCart = (product, quantity=1) => dispatch(add({ product, quantity }))
  const inc = (name) => dispatch(increment(name))
  const dec = (name) => dispatch(decrement(name))
  const rm = (name) => dispatch(remove(name))
  const toggleCart = () => dispatch(toggle())
  const openCart = () => dispatch(open())
  const closeCart = () => dispatch(close())
  const setNote = (note) => dispatch(setNoteAction(note))
  const clearCart = () => dispatch(clear())

  const applyCoupon = (code) => {
    const found = productsSeed.find(p => p.coupons && p.coupons.some(c => c.code.toLowerCase() === code.toLowerCase()))
    if(found){
      const coupon = found.coupons.find(c => c.code.toLowerCase() === code.toLowerCase())
      dispatch(applyCouponAction({ code: coupon.code, value: coupon.value }))
      return { ok:true, coupon }
    }
    return { ok:false }
  }

  return {
    ...state,
    addToCart, increment: inc, decrement: dec, remove: rm,
    toggle: toggleCart, open: openCart, close: closeCart,
    setNote, applyCoupon, clear: clearCart
  }
}
