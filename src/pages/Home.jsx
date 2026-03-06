import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import BannerCarousel from '../components/BannerCarousel'
import Footer from '../components/Footer'
import socket from '../socket'
import CategorySection from '../components/home/CategorySection'
import HomeProductCard, { HomeProductCardSkeleton } from '../components/home/HomeProductCard'
import seedProducts from '../data/seed_products'

/* ─── Hook: fetch best-sellers ───────────────────────────────── */
function useBestSellers(limit = 8) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get('http://localhost:3000/api/v1/product', {
          params: { sortBy: 'sales', sortOrder: 'desc', limit },
          withCredentials: true,
        })
        const payload = data?.data?.products || data?.data || data?.products || data
        const list = Array.isArray(payload) ? payload : []
        if (!mounted) return
        setProducts(
          list.length
            ? list
            : [...seedProducts].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, limit)
        )
      } catch {
        if (!mounted) return
        setError('تعذر تحميل المنتجات — يتم عرض بيانات تجريبية.')
        setProducts([...seedProducts].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, limit))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [limit])

  return { products, loading, error }
}

/* ─── Best Sellers Section ───────────────────────────────────── */
function BestSellersSection() {
  const { products, loading, error } = useBestSellers(8)

  return (
    <section className="bs-root section container" dir="rtl" aria-labelledby="bs-title">

      {/* Header */}
      <header className="bs-header">
        <span className="bs-header__label">🔥 الأكثر مبيعاً</span>
        <h2 id="bs-title" className="bs-header__title">منتجات يختارها عملاؤنا</h2>
        <div className="bs-header__bar" />
        <p className="bs-header__sub">مختارة بناءً على أعلى معدلات المبيعات</p>
      </header>

      {error && <div className="bs-error" role="alert">⚠️ {error}</div>}

      <div className="bs-grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <HomeProductCardSkeleton key={i} />)
          : products.map((p, i) => (
              <HomeProductCard key={p._id || p.id || p.name || i} product={p} />
            ))
        }
      </div>
    </section>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Home() {
  useEffect(() => {
    socket.on('connect', () => console.log(`socket: ${socket.id}`))
    return () => { socket.off('connect') }
  }, [])

  return (
    <div className="home-page">
      <Navbar />
      <main className="home-content">
        <BannerCarousel />
        <CategorySection />
        <BestSellersSection />

        <section className="values-banner">
          <div className="values-inner">
            <div>
              <h3>قيمنا في كل طلب</h3>
              <p>جودة موثوقة، أسعار واضحة، ودعم سريع يساعدك على النمو.</p>
            </div>
            <div className="values-tags">
              <span>🌿 تجربة عربية متكاملة</span>
              <span>🚚 شحن سريع</span>
              <span>🔒 دفع آمن</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
