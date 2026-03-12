import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CategoryCard from '../components/home/CategoryCard'
import CategorySkeleton from '../components/home/CategorySkeleton'
import CategoriesFilters from '../components/category/CategoriesFilters'
import { useCategories } from '../context/CategoriesContext'
import './home.css'
import './category-page.css'
import './categories-page.css'

function parseFilters(searchParams) {
  return {
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sort') || 'newest',
  }
}

export default function CategoriesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => parseFilters(searchParams))
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '')
  const { categories, loading, error, fetchCategories } = useCategories()

  useEffect(() => {
    setFilters(parseFilters(searchParams))
  }, [searchParams])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search || ''), 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    const next = {}
    if (filters.search) next.search = filters.search
    if (filters.sortBy && filters.sortBy !== 'newest') next.sort = filters.sortBy
    setSearchParams(next, { replace: true })
  }, [filters, setSearchParams])

  useEffect(() => {
    fetchCategories().catch(() => {
      // handled by context error state
    })
  }, [fetchCategories])

  const filtered = useMemo(() => {
    const q = String(debouncedSearch || '').trim().toLowerCase()
    const list = categories.filter((item) => {
      if (!q) return true
      const haystack = `${item?.name || ''} ${item?.description || ''}`.toLowerCase()
      return haystack.includes(q)
    })

    if (filters.sortBy === 'name_asc') {
      list.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'ar'))
    } else if (filters.sortBy === 'name_desc') {
      list.sort((a, b) => String(b?.name || '').localeCompare(String(a?.name || ''), 'ar'))
    }
    return list
  }, [categories, debouncedSearch, filters.sortBy])

  const isFiltering = debouncedSearch !== (filters.search || '')

  function onFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  function onReset() {
    setFilters({ search: '', sortBy: 'newest' })
  }

  return (
    <div className="home-page categories-page-v2">
      <Navbar />

      <section className="categories-banner" dir="rtl">
        <div className="categories-banner__overlay" />
        <div className="container categories-banner__inner">
          <p className="categories-banner__eyebrow">كل التصنيفات</p>
          <h1>استكشف جميع الفئات</h1>
          <p>تصفح كل الأقسام المتاحة واختر الفئة المناسبة للوصول إلى منتجاتها بسرعة.</p>
          <div className="categories-banner__actions">
            <button type="button" className="categories-banner__btn categories-banner__btn--primary" onClick={() => navigate('/')}>
              الرئيسية
            </button>
          </div>
        </div>
      </section>

      <main className="container category-main-v2">
        <CategoriesFilters
          filters={filters}
          onChange={onFilterChange}
          onReset={onReset}
          isFiltering={isFiltering}
        />

        {error ? <div className="category-page-warning">{error?.message || String(error)}</div> : null}

        {loading ? (
          <div className="home-category-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <CategorySkeleton key={n} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="category-empty">لا توجد فئات مطابقة للبحث.</div>
        ) : (
          <div className="home-category-grid categories-grid-v2">
            {filtered.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

