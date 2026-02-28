import React, { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CategoryCard({ category }) {
  const navigate = useNavigate()
  const prefetchedRef = useRef(false)

  const onEnter = useCallback(async () => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    try {
      await axios.get(`http://localhost:3000/api/products?category=${encodeURIComponent(category.id)}`, {
        withCredentials: true,
      })
    } catch (_) {
      // optional prefetch
    }
  }, [category.id])

  return (
    <article
      className="home-category-card"
      tabIndex={0}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      onClick={() => navigate(`/categories/${encodeURIComponent(category.id)}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/categories/${encodeURIComponent(category.id)}`) }}
      role="button"
      aria-label={`استكشف فئة ${category.name}`}
      dir="rtl"
    >
      <div className="home-category-image-wrap">
        <img src={category.image.url} alt={category.name} className="home-category-image" loading="lazy" />
        <div className="home-category-overlay" />
        <h3 className="home-category-title">{category.name}</h3>
      </div>

      <div className="home-category-body">
        <p className="home-category-description line-clamp-2">{category.description}</p>
        <span className="home-category-link">
          استكشف الفئة <span aria-hidden="true">←</span>
        </span>
      </div>
    </article>
  )
}
