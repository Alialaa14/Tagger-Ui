import React from 'react'
import { Link } from 'react-router-dom'

export default function CategoryHero({ category }) {
  return (
    <section
      className="category-hero"
      style={{ 
        backgroundImage: category?.image?.url ? `url(${category.image.url})` : 'none',
        backgroundColor: '#16a34a' // Brand green fallback
      }}
      dir="rtl"
    >
      <div className="category-hero-overlay" />
      <div className="category-hero-inner container">
        <nav className="category-breadcrumb" aria-label="breadcrumb">
          <Link to="/">الرئيسية</Link>
          <span>/</span>
          <span>{category?.name ? category.name : 'البحث'}</span>
        </nav>
        <h1>{category?.name || 'استكشف منتجاتنا'}</h1>
        <p>{category?.description || 'اكتشف أفضل العروض والمنتجات الحصرية المتاحة الآن.'}</p>
      </div>
    </section>
  )
}
