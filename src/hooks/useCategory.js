import { useEffect, useState } from 'react'
import axios from 'axios'
import seedCategories from '../data/seed_categories'

function normalizeCategory(raw) {
  return {
    id: raw?._id || raw?.id || raw?.image?.public_id || '',
    name: raw?.name || 'فئة بدون اسم',
    description: raw?.description || 'لا يوجد وصف.',
    image: {
      public_id: raw?.image?.public_id || '',
      url: raw?.image?.url || '',
    },
  }
}

export default function useCategory(categoryId) {
  const [category, setCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!categoryId) {
      setCategory(null)
      setIsLoading(false)
      setError('معرف الفئة غير صالح.')
      return
    }

    let mounted = true
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await axios.get(`http://localhost:3000/api/categories/${encodeURIComponent(categoryId)}`, {
          withCredentials: true,
        })
        const payload = data?.data || data?.category || data
        if (!mounted) return
        setCategory(payload ? normalizeCategory(payload) : null)
      } catch (err) {
        if (!mounted) return
        const fallback = seedCategories.find((c) => c._id === categoryId)
        if (fallback) {
          setCategory(normalizeCategory(fallback))
          setError('')
        } else {
          setError(err?.response?.data?.message || err?.message || 'تعذر تحميل بيانات الفئة.')
          setCategory(null)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [categoryId])

  return { category, isLoading, error }
}
