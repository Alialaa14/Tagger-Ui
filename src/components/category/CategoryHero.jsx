import React from 'react'
import { Link } from 'react-router-dom'

export default function CategoryHero({ category }) {
  return (
    <section
      className="category-hero"
      style={{ backgroundImage: `url(${category?.image?.url || ''})` }}
      dir="rtl"
    >
      <div className="category-hero-overlay" />
      <div className="category-hero-inner container">
        <nav className="category-breadcrumb" aria-label="breadcrumb">
          <Link to="/">الرئيسية</Link>
          <span>/</span>
          <span>الفئات</span>
          <span>/</span>
          <span>{category?.name}</span>
        </nav>
        <h1>{category?.name}</h1>
        <p>{category?.description}</p>
      </div>
    </section>
  )
}
