import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CategoryHero from '../components/category/CategoryHero'
import CategoryFilters from '../components/category/CategoryFilters'
import CategoryProductsGrid from '../components/category/CategoryProductsGrid'
import { useCategories } from '../context/CategoriesContext'
import './home.css'
import './category-page.css'

function parseFilters(searchParams) {
  return {
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sort') || 'newest',
  }
}

export default function CategoryPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => parseFilters(searchParams))
  const [category, setCategory] = useState(null)
  const [categoryProducts, setCategoryProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '')
  const { fetchCategoryWithProducts } = useCategories()

  const isFiltering = debouncedSearch !== (filters.search || '')

  useEffect(() => {
    setFilters(parseFilters(searchParams))
  }, [id, searchParams])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search || ''), 350)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    if (!id) {
      setCategory(null)
      setCategoryProducts([])
      setPageError('Invalid category id.')
      setIsLoading(false)
      return
    }

    let mounted = true
    ;(async () => {
      setIsLoading(true)
      setPageError('')
      try {
        const res = await fetchCategoryWithProducts(id)
        if (!mounted) return
        setCategory(res?.category || null)
        setCategoryProducts(Array.isArray(res?.categoryProducts) ? res.categoryProducts : [])
      } catch (err) {
        if (!mounted) return
        setPageError(err?.response?.data?.message || err?.message || 'Failed to load category data.')
        setCategory(null)
        setCategoryProducts([])
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [id, fetchCategoryWithProducts])

  useEffect(() => {
    const next = {}
    if (filters.search) next.search = filters.search
    if (filters.minPrice) next.minPrice = filters.minPrice
    if (filters.maxPrice) next.maxPrice = filters.maxPrice
    if (filters.sortBy && filters.sortBy !== 'newest') next.sort = filters.sortBy
    setSearchParams(next, { replace: true })
  }, [filters, setSearchParams])

  const products = useMemo(() => {
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice)
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice)
    const q = String(debouncedSearch || '').trim().toLowerCase()

    const next = categoryProducts.filter((item) => {
      const price = Number(item?.price || 0)
      if (minPrice != null && !Number.isNaN(minPrice) && price < minPrice) return false
      if (maxPrice != null && !Number.isNaN(maxPrice) && price > maxPrice) return false
      if (!q) return true
      const haystack = `${item?.name || ''} ${item?.description || ''}`.toLowerCase()
      return haystack.includes(q)
    })

    if (filters.sortBy === 'price_asc') next.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    else if (filters.sortBy === 'price_desc') next.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))

    return next
  }, [categoryProducts, filters.minPrice, filters.maxPrice, filters.sortBy, debouncedSearch])

  function onFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  function onReset() {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    })
  }

  return (
    <div className="home-page category-page-v2">
      <Navbar />

      {category && <CategoryHero category={category} />}

      <main className="container category-main-v2">
        <CategoryFilters
          filters={filters}
          onChange={onFilterChange}
          onReset={onReset}
          isFiltering={isFiltering}
        />

        {pageError && <div className="category-page-warning">{pageError}</div>}

        <CategoryProductsGrid
          products={products}
          isLoading={isLoading}
          isFiltering={isFiltering}
          error={pageError}
        />
      </main>

      <Footer />
    </div>
  )
}
