import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import products from '../data/products'
import categories from '../data/categories'
import socket from '../socket'

export default function Home() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log('Connected to server')
    })
  }, [])

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-content">
        <BannerCarousel />

        <section className="section container">
          <div className="section-head">
            <h3>تصفح الأقسام</h3>
            <p>اختصر طريقك إلى ما تبحث عنه عبر أقسام واضحة.</p>
          </div>
          <div className="category-buttons">
            {categories.map(cat => (
              <Link key={cat.name} to={`/category/${encodeURIComponent(cat.name)}`} className="category-btn">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="section container">
          <div className="section-head">
            <h3>الأكثر شراءً</h3>
            <p>منتجات مختارة بناء على طلبات العملاء.</p>
          </div>
          <div className="products-grid">
            {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

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
