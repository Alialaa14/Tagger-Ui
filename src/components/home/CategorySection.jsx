import React from 'react'
import { useNavigate } from 'react-router-dom'
import useCategories from '../../hooks/useCategories'

function CategoryCardSkeleton() {
  return (
    <div className="cs-card cs-card--skeleton" aria-hidden="true">
      <div className="cs-card__img shimmer" />
      <div className="cs-card__foot">
        <div className="cs-skel-line cs-skel-line--lg shimmer" />
        <div className="cs-skel-line shimmer" />
      </div>
    </div>
  )
}

function CategoryCard({ category }) {
  const navigate = useNavigate()
  const imgUrl = category?.image?.url || category?.image || ''

  function go() {
    navigate(`/categories/${encodeURIComponent(category.id)}`)
  }

  return (
    <article
      className="cs-card"
      tabIndex={0}
      role="button"
      aria-label={`استكشف فئة ${category.name}`}
      onClick={go}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') go() }}
    >
      {/* Image */}
      <div className="cs-card__img-wrap">
        {imgUrl ? (
          <img src={imgUrl} alt={category.name} className="cs-card__img" loading="lazy" />
        ) : (
          <div className="cs-card__img cs-card__img--placeholder">🛒</div>
        )}
        <div className="cs-card__overlay" />
        {/* Floating name on image */}
        <h3 className="cs-card__name-overlay">{category.name}</h3>
      </div>

      {/* Footer */}
      <div className="cs-card__foot">
        <p className="cs-card__desc">{category.description || 'استكشف هذه الفئة'}</p>
        <span className="cs-card__cta">
          تصفح
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      {/* Hover ripple corner */}
      <div className="cs-card__corner" />
    </article>
  )
}

export default function CategorySection() {
  const { categories, isLoading, error, hasData } = useCategories()

  return (
    <section className="cs-root section container" dir="rtl" aria-labelledby="cs-title">

      {/* Header */}
      <header className="cs-header">
        <div className="cs-header__label">الأقسام</div>
        <h2 id="cs-title" className="cs-header__title">تسوق حسب الفئة</h2>
        <div className="cs-header__bar" />
        <p className="cs-header__sub">اختر ما تحتاجه واستكشف آلاف المنتجات</p>
      </header>

      {/* Error */}
      {error && (
        <div className="cs-error" role="alert">⚠️ {error}</div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="cs-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => <CategoryCardSkeleton key={n} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !hasData && (
        <div className="cs-empty">لا توجد فئات متاحة حالياً.</div>
      )}

      {/* Cards */}
      {!isLoading && hasData && (
        <div className="cs-grid">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </section>
  )
}
