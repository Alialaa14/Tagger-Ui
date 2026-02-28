import React from 'react'
import useCategories from '../../hooks/useCategories'
import CategoryCard from './CategoryCard'
import CategorySkeleton from './CategorySkeleton'

export default function CategorySection() {
  const { categories, isLoading, error, hasData } = useCategories()

  return (
    <section className="home-category-section section container" dir="rtl" aria-labelledby="home-categories-title">
      <header className="home-category-header">
        <h3 id="home-categories-title">تصفح حسب الفئة</h3>
        <span className="home-category-accent" />
        <p>اختر الفئة المناسبة واستكشف المنتجات</p>
      </header>

      {error && (
        <div className="home-category-error" role="alert">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="home-category-grid">
          {[1, 2, 3, 4].map((n) => <CategorySkeleton key={n} />)}
        </div>
      )}

      {!isLoading && !hasData && (
        <div className="home-category-empty">
          لا توجد فئات متاحة حاليا.
        </div>
      )}

      {!isLoading && hasData && (
        <div className="home-category-grid">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </section>
  )
}
