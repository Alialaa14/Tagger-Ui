import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import products from '../data/products'
import socket from '../socket'
import { useAuth } from '../context/AuthContext'
import CategorySection from '../components/home/CategorySection'

function UserSummaryCard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const imageSrc = user?.image || user?.avatar || user?.profileImage || ''
  const name = user?.username || user?.name || user?.shopName || 'المستخدم'
  const role = user?.role || user?.accountType || '-'
  const city = user?.city || '-'

  return (
    <aside className="home-user-corner">
      <div className="home-user-corner-top">
        {imageSrc ? (
          <img src={imageSrc} alt={name} className="home-user-corner-avatar" />
        ) : (
          <div className="home-user-corner-avatar home-user-corner-avatar-fallback">{String(name).slice(0, 1)}</div>
        )}
        <div className="home-user-corner-copy">
          <h4>{name}</h4>
          <p>{String(role)} · {city}</p>
        </div>
      </div>
      <div className="home-user-corner-actions">
        <button className="btn btn-primary" onClick={() => navigate('/profile')}>الملف</button>
        <button className="btn btn-ghost" onClick={async () => { await logout(); navigate('/login') }}>خروج</button>
      </div>
    </aside>
  )
}

export default function Home() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server')
    })
    return () => {
      socket.off('connect')
    }
  }, [])

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-content">
        {isAuthenticated && <UserSummaryCard />}
        <BannerCarousel />
        <CategorySection />

        <section className="section container">
          <div className="section-head">
            <h3>الأكثر شراء</h3>
            <p>منتجات مختارة بناء على طلبات العملاء.</p>
          </div>
          <div className="products-grid">
            {products.slice(0, 4).map((p) => <ProductCard key={p.id || p.name} product={p} />)}
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
