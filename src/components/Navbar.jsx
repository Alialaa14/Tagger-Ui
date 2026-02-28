import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const { totalQuantity } = useCart()
  const { user, isAuthenticated, loading, logout } = useAuth()

  const imageSrc = user?.image || user?.avatar || user?.profileImage || ''
  const userName = user?.username || user?.name || user?.shopName || 'المستخدم'

  const handleSubmit = (value) => {
    const query = (value || q || '').trim()
    if (!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link to="/" className="brand">تاجر</Link>
        <SearchBar value={q} onChange={setQ} onSubmit={handleSubmit} />
        <div className="nav-actions">
          {!loading && !isAuthenticated && (
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>تسجيل الدخول</button>
          )}
          {!loading && isAuthenticated && (
            <>
              <button className="btn btn-ghost nav-user-btn" onClick={() => navigate('/profile')}>
                {imageSrc ? (
                  <img src={imageSrc} alt={userName} className="nav-user-avatar" />
                ) : (
                  <span className="nav-user-avatar-fallback">{String(userName).slice(0, 1)}</span>
                )}
                <span>{userName}</span>
              </button>
              <button className="btn btn-ghost" onClick={async () => { await logout(); navigate('/login') }}>تسجيل خروج</button>
            </>
          )}
          <button className="btn" onClick={() => navigate('/cart')}>
            سلة (<span className="cart-count">{totalQuantity}</span>)
          </button>
        </div>
      </div>
    </header>
  )
}
