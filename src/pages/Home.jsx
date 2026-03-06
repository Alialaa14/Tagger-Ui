import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import CategoryCard from '../components/home/CategoryCard'
import CategorySkeleton from '../components/home/CategorySkeleton'
import socket from '../socket'
import { useAuth } from '../context/AuthContext'
import useHomeData from '../hooks/useHomeData'


// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated } = useAuth()

  // Single request → both categories and best-selling products
  const {
    categories,
    bestSelling,
    isLoading,
    error,
    hasCategories,
    hasBestSelling,
  } = useHomeData()

  useEffect(() => {
    socket.on('connect', () => console.log(`connected to ${socket.id}`))
    return () => { socket.off('connect') }
  }, [])

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-content">
        <BannerCarousel />

        {/* ── Categories ───────────────────────────────────────── */}
        <section
          className="home-category-section section container"
          dir="rtl"
          aria-labelledby="home-categories-title"
        >
          <header className="home-category-header">
            <h3 id="home-categories-title">تصفح حسب الفئة</h3>
            <span className="home-category-accent" />
            <p>اختر الفئة المناسبة واستكشف المنتجات</p>
          </header>

          {error && (
            <div className="home-category-error" role="alert">{error}</div>
          )}

          {isLoading && (
            <div className="home-category-grid">
              {[1, 2, 3, 4].map((n) => <CategorySkeleton key={n} />)}
            </div>
          )}

          {!isLoading && !hasCategories && (
            <div className="home-category-empty">لا توجد فئات متاحة حاليا.</div>
          )}

          {!isLoading && hasCategories && (
            <div className="home-category-grid">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </section>

        {/* ── Best-selling products ─────────────────────────────── */}
        <section className="section container" dir="rtl">
          <div className="section-head">
            <h3>الأكثر شراء</h3>
            <p>منتجات مختارة بناء على طلبات العملاء.</p>
          </div>

          {isLoading && (
            <div className="products-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="home-category-skeleton product-card-skeleton" />
              ))}
            </div>
          )}

          {!isLoading && !hasBestSelling && (
            <div className="home-category-empty">لا توجد منتجات متاحة حاليا.</div>
          )}

          {!isLoading && hasBestSelling && (
            <div className="products-grid">
              {bestSelling.map((p) => (
                <ProductCard key={p.id || p.name} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* ── Values banner (unchanged) ─────────────────────────── */}
        <section className="values-banner">
          <div className="values-inner">
            <div>
              <h3>قيمنا في كل طلب</h3>
              <p>جودة موثوقة، أسعار واضحة، ودعم سريع يساعدك على النمو.</p>
            </div>
            <div className="values-tags">
              <span>تجربة عربية متكاملة</span>
              <span>شحن سريع</span>
              <span>دفع آمن</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
