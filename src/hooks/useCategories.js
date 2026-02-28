import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import seedCategories from '../data/seed_categories'

function normalizeCategory(raw) {
  return {
    id: raw?._id || raw?.id || raw?.image?.public_id || raw?.name,
    name: raw?.name || 'بدون اسم',
    description: raw?.description || 'لا يوجد وصف متاح.',
    image: {
      public_id: raw?.image?.public_id || '',
      url: raw?.image?.url || '',
    },
  }
}

export default function useCategories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await axios.get('http://localhost:3000/api/categories', { withCredentials: true })
        const payload = data?.data || data?.categories || data
        const next = Array.isArray(payload) ? payload.map(normalizeCategory) : []
        if (!mounted) return
        setCategories(next)
      } catch (err) {
        if (!mounted) return
        const msg = err?.response?.data?.message || err?.message || 'تعذر تحميل الفئات حاليا.'
        setError(msg)
        setCategories(seedCategories.map(normalizeCategory))
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const hasData = useMemo(() => categories.length > 0, [categories.length])
  return { categories, isLoading, error, hasData }
}
