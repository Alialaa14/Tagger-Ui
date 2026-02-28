import { useCallback, useState } from 'react'
import axios from 'axios'

function resolveProductId(product) {
  return product?._id || product?.id || product?.image?.public_id || null
}

function normalizeAvailability(payload) {
  const data = payload?.data || payload
  return {
    available: Boolean(data?.available ?? data?.isAvailable),
    quantity: Number(data?.quantity || 0),
    discount: Array.isArray(data?.discount) ? data.discount : [],
    message: data?.message || '',
  }
}

export default function useCheckAvailability() {
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityData, setAvailabilityData] = useState(null)

  const checkAvailability = useCallback(async (product) => {
    const productId = resolveProductId(product)
    if (!productId) {
      setAvailabilityError('معرف المنتج غير متوفر للتحقق من التوفر.')
      return { ok: false, message: 'Missing productId' }
    }

    setIsCheckingAvailability(true)
    setAvailabilityError('')
    try {
      const { data } = await axios.get(`http://localhost:3000/api/products/${productId}/availability`, {
        withCredentials: true,
      })
      const normalized = normalizeAvailability(data)
      setAvailabilityData(normalized)
      return { ok: true, data: normalized }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'فشل التحقق من التوفر.'
      setAvailabilityError(msg)
      return { ok: false, message: msg }
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [])

  return {
    isCheckingAvailability,
    availabilityData,
    availabilityError,
    checkAvailability,
    clearAvailabilityError: () => setAvailabilityError(''),
    clearAvailabilityData: () => setAvailabilityData(null),
  }
}
