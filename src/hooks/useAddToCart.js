import { useCallback, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function resolveProductId(product) {
  return product?._id || product?.id || product?.image?.public_id || null
}

export default function useAddToCart() {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [error, setError] = useState('')

  const add = useCallback(async (product) => {
    const role = String(user?.role || user?.accountType || localStorage.getItem('user_role') || '').toLowerCase()
    if (role !== 'customer') {
      const msg = 'الإضافة للسلة متاحة للعملاء فقط.'
      setError(msg)
      return { ok: false, message: msg }
    }

    const productId = resolveProductId(product)
    if (!productId) {
      setError('لا يمكن إضافة المنتج لأن معرف المنتج غير متوفر.')
      return { ok: false, message: 'Missing productId' }
    }

    setIsAddingToCart(true)
    setError('')
    try {
      await axios.post('http://localhost:3000/api/cart/add', { productId }, { withCredentials: true })
      addToCart(product, 1)
      return { ok: true }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'فشل إضافة المنتج إلى السلة.'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setIsAddingToCart(false)
    }
  }, [addToCart, user])

  return {
    isAddingToCart,
    addToCartRequest: add,
    addToCartError: error,
    clearAddToCartError: () => setError(''),
  }
}
