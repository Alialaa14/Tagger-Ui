import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CategoryHero from '../components/category/CategoryHero'
import CategoryFilters from '../components/category/CategoryFilters'
import CategoryProductsGrid from '../components/category/CategoryProductsGrid'
import useCategory from '../hooks/useCategory'
import useCategoryProducts from '../hooks/useCategoryProducts'

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

  const { category, isLoading: isCategoryLoading, error: categoryError } = useCategory(id)
  const {
    products,
    isLoading: isProductsLoading,
    isFiltering,
    error: productsError,
  } = useCategoryProducts(id, filters)

  useEffect(() => {
    setFilters(parseFilters(searchParams))
  }, [id, searchParams])

  useEffect(() => {
    const next = {}
    if (filters.search) next.search = filters.search
    if (filters.minPrice) next.minPrice = filters.minPrice
    if (filters.maxPrice) next.maxPrice = filters.maxPrice
    if (filters.sortBy && filters.sortBy !== 'newest') next.sort = filters.sortBy
    setSearchParams(next, { replace: true })
  }, [filters, setSearchParams])

  const pageError = useMemo(() => categoryError || productsError, [categoryError, productsError])

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
          isLoading={isCategoryLoading || isProductsLoading}
          isFiltering={isFiltering}
          error={pageError}
        />
      </main>

      <Footer />
    </div>
  )
}
