import React from 'react'
import ProductCard, { ProductCardSkeleton } from '../ProductCard'

export default function CategoryProductsGrid({ products, isLoading, isFiltering, error }) {
  if (isLoading) {
    return (
      <div className="products-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <ProductCardSkeleton key={n} />)}
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="category-page-error" role="alert">
        {error}
      </div>
    )
  }

  if (products.length === 0) {
    return <div className="category-empty">لا توجد منتجات مطابقة للبحث</div>
  }

  return (
    <div className={`products-grid category-products-grid ${isFiltering ? 'is-filtering' : ''}`}>
      {products.map((product) => <ProductCard key={product.id || product.name} product={product} />)}
    </div>
  )
}
