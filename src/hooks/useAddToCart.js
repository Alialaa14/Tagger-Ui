import { useCallback, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'

function resolveProductId(product) {
  return product?._id || product?.id || product?.image?.public_id || null
}

export default function useAddToCart() {
  const { addToCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [error, setError] = useState('')

  const add = useCallback(async (product) => {
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
  }, [addToCart])

  return {
    isAddingToCart,
    addToCartRequest: add,
    addToCartError: error,
    clearAddToCartError: () => setError(''),
  }
}
