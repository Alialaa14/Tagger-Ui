import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import CategoryHero from '../components/category/CategoryHero'
import CategoryFilters from '../components/category/CategoryFilters'
import { productApi } from '../utils/productApi'
import { companyApi } from '../utils/companyApi'
import { useCategories } from '../context/CategoriesContext'
import BackNavigator from '../components/common/BackNavigator'
import './home.css'
import './category-page.css'

function parseFilters(searchParams) {
  return {
    search: searchParams.get('q') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sort') || 'newest',
    category: searchParams.get('category') || '',
    company: searchParams.get('company') || '',
    page: searchParams.get('page') || '1',
  }
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => parseFilters(searchParams))
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [heroData, setHeroData] = useState(null)

  const { categories } = useCategories()

  // Sync state with URL params
  useEffect(() => {
    setFilters(parseFilters(searchParams))
  }, [searchParams])

  // Fetch Hero Metadata (Category or Company info)
  useEffect(() => {
    const fetchMetadata = async () => {
      if (filters.category) {
        const matched = categories.find(c => c._id === filters.category || c.id === filters.category)
        if (matched) {
          setHeroData({
            name: matched.name,
            description: matched.description,
            image: matched.image
          })
        }
      } else if (filters.company) {
        try {
          const companies = await companyApi.getActiveCompanies()
          const matched = companies.find(c => c._id === filters.company)
          if (matched) {
            setHeroData({
              name: matched.name,
              description: matched.description,
              image: matched.logo // Use logo as hero background or adjust CategoryHero to handle it
            })
          }
        } catch (err) { console.error(err) }
      } else if (filters.search) {
        setHeroData({
          name: `نتائج البحث: ${filters.search}`,
          description: 'استكشف النتائج المتعلقة ببحثك',
          image: null
        })
      } else {
        setHeroData({
          name: 'جميع المنتجات',
          description: 'استكشف تشكيلتنا الكاملة من المنتجات المميزة',
          image: null
        })
      }
    }
    fetchMetadata()
  }, [filters.category, filters.company, filters.search, categories])

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const data = await productApi.getProducts({
          page: filters.page,
          search: filters.search,
          category: filters.category,
          company: filters.company,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sortBy: filters.sortBy === 'newest' ? 'createdAt' : 'price',
          sortOrder: filters.sortBy === 'price_desc' ? 'desc' : 'asc'
        })
        setProducts(data?.products || [])
        setTotal(data?.total || 0)
      } catch (err) {
        console.error('Failed to fetch products:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [filters])

  // Update URL search params
  useEffect(() => {
    const next = {}
    if (filters.search) next.q = filters.search
    if (filters.category) next.category = filters.category
    if (filters.company) next.company = filters.company
    if (filters.minPrice) next.minPrice = filters.minPrice
    if (filters.maxPrice) next.maxPrice = filters.maxPrice
    if (filters.sortBy && filters.sortBy !== 'newest') next.sort = filters.sortBy
    if (filters.page && filters.page !== '1') next.page = filters.page
    setSearchParams(next, { replace: true })
  }, [filters, setSearchParams])

  const onFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: '1' }))
  }

  const onReset = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      category: filters.category, // Keep context if wanted
      company: filters.company,
      page: '1'
    })
  }

  return (
    <div className="home-page category-page-v2">

      <CategoryHero category={heroData} />

      <main className="container section" dir="rtl">
        <div style={{ marginBottom: '24px' }}>
          <BackNavigator fallback="/" />
        </div>

        <CategoryFilters
          filters={filters}
          onChange={onFilterChange}
          onReset={onReset}
          isFiltering={isLoading}
        />

        {isLoading ? (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="product-card-skeleton" style={{ height: '300px', background: '#f1f5f9', borderRadius: '16px' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: '#f8fafc', borderRadius: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3>عذراً، لم نتمكن من العثور على أي منتجات</h3>
            <p style={{ color: '#64748b' }}>جرب البحث عن منتجات أخرى أو تغيير الفلاتر.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
