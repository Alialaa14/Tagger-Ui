import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const CategoriesContext = createContext(null)

const API_BASE_URL = '/api/v1/category'

function normalizeCategory(item) {
  if (!item || typeof item !== 'object') return null
  return {
    ...item,
    id: item.id || item._id || item.name,
  }
}

function normalizeProduct(item) {
  if (!item || typeof item !== 'object') return null
  return {
    ...item,
    id: item.id || item._id || item?.image?.public_id || item.name,
    price: Number(item?.price || 0),
    discount: Array.isArray(item?.discount) ? item.discount : [],
  }
}

function normalizeCategoriesPayload(payload) {
  const list =
    payload?.data?.categories ||
    payload?.data ||
    payload?.categories ||
    payload

  if (!Array.isArray(list)) return []
  return list.map(normalizeCategory).filter(Boolean)
}

function normalizeCategoryWithProductsPayload(payload) {
  const raw = payload?.data || payload
  const category = normalizeCategory(raw?.category || raw?.data?.category || null)
  const categoryProductsRaw =
    raw?.categoryProducts ||
    raw?.products ||
    raw?.data?.categoryProducts ||
    raw?.data?.products ||
    []
  const categoryProducts = Array.isArray(categoryProductsRaw)
    ? categoryProductsRaw.map(normalizeProduct).filter(Boolean)
    : []
  return { category, categoryProducts }
}

function toQueryString(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return
    search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function CategoriesProvider({ children, autoFetch = true }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const query = toQueryString(params)
      const { data } = await axios.get(`${API_BASE_URL}${query}`, { withCredentials: true })
      const next = normalizeCategoriesPayload(data)
      setCategories(next)
      return next
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategoryById = useCallback(async (categoryId) => {
    if (!categoryId) return null
    setError(null)
    const { data } = await axios.get(`${API_BASE_URL}/${encodeURIComponent(categoryId)}`, {
      withCredentials: true,
    })
    const raw = data?.data?.category || data?.data || data?.category || data
    return normalizeCategory(raw)
  }, [])

  const fetchRelatedCategories = useCallback(async (categoryId, params = {}) => {
    if (!categoryId) return []
    setError(null)
    try {
      const query = toQueryString(params)
      const { data } = await axios.get(
        `${API_BASE_URL}/${encodeURIComponent(categoryId)}/related${query}`,
        { withCredentials: true }
      )
      return normalizeCategoriesPayload(data)
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])

  const fetchCategoryWithProducts = useCallback(async (categoryId, params = {}) => {
    if (!categoryId) return { category: null, categoryProducts: [] }
    setError(null)
    try {
      const query = toQueryString(params)
      const { data } = await axios.get(`${API_BASE_URL}/${encodeURIComponent(categoryId)}${query}`, {
        withCredentials: true,
      })
      return normalizeCategoryWithProductsPayload(data)
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])

  const createCategory = useCallback(async (payload) => {
    setError(null)
    const { data } = await axios.post(API_BASE_URL, payload, { withCredentials: true })
    const created = normalizeCategory(data?.data?.category || data?.data || data?.category || data)
    if (created) {
      setCategories((prev) => [created, ...prev.filter((item) => item.id !== created.id)])
    }
    return created
  }, [])

  const updateCategory = useCallback(async (categoryId, payload) => {
    if (!categoryId) throw new Error('categoryId is required')
    setError(null)
    const { data } = await axios.patch(`${API_BASE_URL}/${encodeURIComponent(categoryId)}`, payload, {
      withCredentials: true,
    })
    const updated = normalizeCategory(data?.data?.category || data?.data || data?.category || data)
    if (updated) {
      setCategories((prev) =>
        prev.map((item) => (String(item.id) === String(categoryId) ? updated : item))
      )
    }
    return updated
  }, [])

  const deleteCategory = useCallback(async (categoryId) => {
    if (!categoryId) throw new Error('categoryId is required')
    setError(null)
    await axios.delete(`${API_BASE_URL}/${encodeURIComponent(categoryId)}`, { withCredentials: true })
    setCategories((prev) => prev.filter((item) => String(item.id) !== String(categoryId)))
    return true
  }, [])

  useEffect(() => {
    if (!autoFetch) return
    fetchCategories().catch(() => {
      // error state is already handled in fetchCategories
    })
  }, [autoFetch, fetchCategories])

  const value = useMemo(
    () => ({
      apiBaseUrl: API_BASE_URL,
      categories,
      loading,
      error,
      fetchCategories,
      fetchCategoryById,
      fetchRelatedCategories,
      fetchCategoryWithProducts,
      createCategory,
      updateCategory,
      deleteCategory,
      setCategories,
    }),
    [
      categories,
      loading,
      error,
      fetchCategories,
      fetchCategoryById,
      fetchRelatedCategories,
      fetchCategoryWithProducts,
      createCategory,
      updateCategory,
      deleteCategory,
    ]
  )

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used inside CategoriesProvider')
  return ctx
}
