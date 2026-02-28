import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import seedProducts from '../data/seed_products'

function normalizeProduct(raw) {
  return {
    ...raw,
    id: raw?._id || raw?.id || raw?.image?.public_id || raw?.name,
    image: raw?.image || { public_id: '', url: '' },
    price: Number(raw?.price || 0),
    discount: Array.isArray(raw?.discount) ? raw.discount : [],
  }
}

export default function useCategoryProducts(categoryId, filters) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [error, setError] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search || ''), 500)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    if (!categoryId) return
    let mounted = true

    ;(async () => {
      const firstLoad = products.length === 0
      if (firstLoad) setIsLoading(true)
      else setIsFiltering(true)
      setError('')

      const params = {
        category: categoryId,
        search: debouncedSearch || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        sort: filters.sortBy || '',
      }

      try {
        const { data } = await axios.get('http://localhost:3000/api/products', {
          params,
          withCredentials: true,
        })
        const payload = data?.data || data?.products || data
        const normalized = Array.isArray(payload) ? payload.map(normalizeProduct) : []
        if (!mounted) return
        setProducts(normalized)
      } catch (err) {
        if (!mounted) return
        const fallback = seedProducts
          .filter((p) => p.category === categoryId)
          .map(normalizeProduct)
        setProducts(fallback)
        setError(err?.response?.data?.message || err?.message || 'تعذر تحميل منتجات الفئة.')
      } finally {
        if (!mounted) return
        setIsLoading(false)
        setIsFiltering(false)
      }
    })()

    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, debouncedSearch, filters.minPrice, filters.maxPrice, filters.sortBy])

  const displayProducts = useMemo(() => {
    const list = [...products]
    if (filters.sortBy === 'price_asc') list.sort((a, b) => a.price - b.price)
    if (filters.sortBy === 'price_desc') list.sort((a, b) => b.price - a.price)
    return list
  }, [products, filters.sortBy])

  return { products: displayProducts, isLoading, isFiltering, error }
}
