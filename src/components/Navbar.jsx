import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import "./navbar.css"
import NotificationIcon from "../pages/NotificationIcon"

/* ── Icons ─────────────────────────────────────────────────── */
const Icon = ({ d, size = 18, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ICONS = {
  search: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
  cart: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  profile: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  verify: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  admin: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  menu: 'M3 12h18M3 6h18M3 18h18',
  close: 'M18 6L6 18M6 6l12 12',
  chevron: 'M19 9l-7 7-7-7',
  pin: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  store: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  package: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
}

/* ── Helpers ────────────────────────────────────────────────── */
function roleLabel(role) {
  const map = { admin: 'مدير', trader: 'تاجر', customer: 'عميل', user: 'عميل' }
  return map[role] || role || 'مستخدم'
}

function roleBadgeClass(role) {
  if (role === 'admin') return 'nb-badge nb-badge--admin'
  if (role === 'trader') return 'nb-badge nb-badge--trader'
  if (role === 'customer') return 'nb-badge nb-badge--customer'
  if (role === 'user') return 'nb-badge nb-badge--customer'
  return 'nb-badge'
}

/* ── User dropdown panel ────────────────────────────────────── */
function UserDropdown({ user, role, isAdmin, isCustomer, totalQuantity, onClose, logout, navigate }) {
  const imageSrc = user?.logo?.url || user?.logo || user?.avatar || user?.logo?.url || ''
  const userName = user?.username || user?.name || user?.shopName || 'المستخدم'
  const city = user?.city || ''
  const governorate = user?.governorate || ''
  const phone = user?.phoneNumber || ''
  const shopName = user?.shopName || ''
  const location = [city, governorate].filter(Boolean).join('، ')

  const go = (path) => { navigate(path); onClose() }
  return (
    <div className="nb-dropdown" dir="rtl">
      {/* ── User info card ── */}
      <div className="nb-dropdown__head">
        <div className="nb-dropdown__avatar-wrap">
          {imageSrc
            ? <img src={imageSrc} alt={userName} className="nb-dropdown__avatar" />
            : <div className="nb-dropdown__avatar nb-dropdown__avatar--fallback">{String(userName).slice(0, 1).toUpperCase()}</div>
          }
          <span className={roleBadgeClass(role)}>{roleLabel(role)}</span>
        </div>
        <div className="nb-dropdown__info">
          <strong className="nb-dropdown__name">{userName}</strong>
          {shopName && shopName !== userName && (
            <span className="nb-dropdown__shop">🏪 {shopName}</span>
          )}
          {phone && (
            <span className="nb-dropdown__meta">
              <Icon d={ICONS.phone} size={12} /> {phone}
            </span>
          )}
          {location && (
            <span className="nb-dropdown__meta">
              <Icon d={ICONS.pin} size={12} /> {location}
            </span>
          )}
        </div>
      </div>

      <div className="nb-dropdown__divider" />

      {/* ── Menu items ── */}
      <nav className="nb-dropdown__menu">
        <button className="nb-dropdown__item" onClick={() => go('/profile')}>
          <span className="nb-dropdown__item-icon"><Icon d={ICONS.profile} size={16} /></span>
          تعديل الملف الشخصي
        </button>

        <button className="nb-dropdown__item" onClick={() => go('/verify-otp')}>
          <span className="nb-dropdown__item-icon nb-dropdown__item-icon--green"><Icon d={ICONS.verify} size={16} /></span>
          توثيق الحساب
        </button>

        {!isAdmin && (
          <button className="nb-dropdown__item" onClick={() => go('/my-reviews')}>
            <span className="nb-dropdown__item-icon nb-dropdown__item-icon--amber"><Icon d={ICONS.star} size={16} /></span>
            تقييماتي
          </button>
        )}

        {role === 'user' && (
          <button className="nb-dropdown__item" onClick={() => go('/inventory')}>
            <span className="nb-dropdown__item-icon nb-dropdown__item-icon--green"><Icon d={ICONS.package} size={16} /></span>
            مخزني (Inventory)
          </button>
        )}

        {(role === 'trader' || role === 'user') && (
          <button className="nb-dropdown__item" onClick={() => go('/catalog')}>
            <span className="nb-dropdown__item-icon nb-dropdown__item-icon--amber"><Icon d={ICONS.store} size={16} /></span>
            {role === 'trader' ? 'كتالوج المنتجات' : 'كتالوج المنصة'}
          </button>
        )}

        {isCustomer && (
          <button className="nb-dropdown__item" onClick={() => go('/orders')}>
            <span className="nb-dropdown__item-icon"><Icon d={ICONS.orders} size={16} /></span>
            طلباتي
            {totalQuantity > 0 && <span className="nb-dropdown__item-badge">{totalQuantity}</span>}
          </button>
        )}

        {isAdmin && (
          <button className="nb-dropdown__item" onClick={() => go('/admin')}>
            <span className="nb-dropdown__item-icon nb-dropdown__item-icon--amber"><Icon d={ICONS.admin} size={16} /></span>
            لوحة التحكم
          </button>
        )}
      </nav>

      <div className="nb-dropdown__divider" />

      {/* ── Logout ── */}
      <button
        className="nb-dropdown__item nb-dropdown__item--danger"
        onClick={async () => { await logout(); navigate('/login'); onClose() }}
      >
        <span className="nb-dropdown__item-icon nb-dropdown__item-icon--red"><Icon d={ICONS.logout} size={16} /></span>
        تسجيل الخروج
      </button>
    </div>
  )
}

/* ── Main Navbar ────────────────────────────────────────────── */
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleAdminSidebar } = useUI()
  
  const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/trader')
  
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const dropRef = useRef(null)
  const inputRef = useRef(null)

  const { totalQuantity } = useCart()
  const { user, isAuthenticated, loading, logout } = useAuth()

  const imageSrc = user?.image?.url || ''
  const userName = user?.username || user?.name || user?.shopName || 'المستخدم'
  const role = String(user?.role || user?.accountType || localStorage.getItem('user_role') || '').toLowerCase()
  const isAdmin = role === 'admin'
  const isCustomer = role === 'customer' || role === 'user'

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!dropOpen) return
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropOpen])

  const handleSearch = useCallback((e) => {
    e?.preventDefault()
    const query = q.trim()
    if (!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setMobileMenu(false)
  }, [q, navigate])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setQ(''); inputRef.current?.blur() }
  }

  return (
    <>
      <header className="nb-root" dir="rtl">
        <div className="nb-inner">

          {/* ── Dashboard Menu Toggle (Mobile Admin/Trader) ── */}
          {isDashboardRoute && (
            <button 
              className="nb-dashboard-toggle" 
              onClick={toggleAdminSidebar}
              aria-label="قائمة اللوحة"
            >
              <Icon d={ICONS.menu} size={22} />
            </button>
          )}

          {/* ── Logo ── */}
          <Link to="/" className="nb-logo" aria-label="الصفحة الرئيسية">
            <div className="nb-logo__icon">ت</div>
            <span className="nb-logo__text">تاجر</span>
          </Link>

          {/* ── Search bar (desktop) ── */}
          <form className={`nb-search ${focused ? 'nb-search--focused' : ''}`} onSubmit={handleSearch} role="search">
            <button type="submit" className="nb-search__btn" aria-label="بحث">
              <Icon d={ICONS.search} size={17} />
            </button>
            <input
              ref={inputRef}
              type="search"
              className="nb-search__input"
              placeholder="ابحث عن منتج أو قسم أو علامة تجارية…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              aria-label="حقل البحث"
              autoComplete="off"
            />
            {q && (
              <button type="button" className="nb-search__clear" onClick={() => { setQ(''); inputRef.current?.focus() }} aria-label="مسح البحث">
                <Icon d={ICONS.close} size={14} stroke={2.5} />
              </button>
            )}
          </form>

          {/* ── Actions ── */}
          <div className="nb-actions">

            {/* Guest */}
            {!loading && !isAuthenticated && (
              <>

                <button className="nb-btn-ghost" onClick={() => navigate('/login')}>
                  تسجيل الدخول
                </button>
                <button className="nb-btn-primary" onClick={() => navigate('/signup')}>
                  إنشاء حساب
                </button>
              </>
            )}

            {/* Authenticated */}
            {!loading && isAuthenticated && (
              <>
                <NotificationIcon />
                {/* Cart — customers only */}
                {isCustomer && (
                  <button className="nb-cart-btn" onClick={() => navigate('/cart')} aria-label={`السلة - ${totalQuantity} عناصر`}>
                    <Icon d={ICONS.cart} size={20} />
                    {totalQuantity > 0 && (
                      <span className="nb-cart-badge">{totalQuantity > 99 ? '99+' : totalQuantity}</span>
                    )}
                  </button>
                )}

                {/* User avatar + dropdown trigger */}
                <div className="nb-user-wrap" ref={dropRef}>
                  <button
                    className={`nb-user-btn ${dropOpen ? 'nb-user-btn--open' : ''}`}
                    onClick={() => setDropOpen(v => !v)}
                    aria-expanded={dropOpen}
                    aria-haspopup="true"
                    aria-label="قائمة المستخدم"
                  >
                    {imageSrc
                      ? <img src={imageSrc} alt={userName} className="nb-user-avatar" />
                      : <div className="nb-user-avatar nb-user-avatar--fallback">{String(userName).slice(0, 1).toUpperCase()}</div>
                    }
                    <span className="nb-user-name">{userName}</span>
                    <span className={`nb-user-chevron ${dropOpen ? 'nb-user-chevron--up' : ''}`}>
                      <Icon d={ICONS.chevron} size={14} stroke={2.5} />
                    </span>
                  </button>

                  {/* Dropdown */}
                  {dropOpen && (
                    <UserDropdown
                      user={user}
                      role={role}
                      isAdmin={isAdmin}
                      isCustomer={isCustomer}
                      totalQuantity={totalQuantity}
                      onClose={() => setDropOpen(false)}
                      logout={logout}
                      navigate={navigate}
                    />
                  )}
                </div>
              </>
            )}

            {/* Loading skeleton */}
            {loading && <div className="nb-skeleton" />}

            {/* Mobile menu toggle */}
            <button
              className="nb-mobile-toggle"
              onClick={() => setMobileMenu(v => !v)}
              aria-label="القائمة"
              aria-expanded={mobileMenu}
            >
              <Icon d={mobileMenu ? ICONS.close : ICONS.menu} size={22} />
            </button>
          </div>
        </div>

        {/* ── Mobile search ── */}
        <div className={`nb-mobile-search ${mobileMenu ? 'nb-mobile-search--open' : ''}`}>
          <form className="nb-search nb-search--mobile" onSubmit={handleSearch} role="search">
            <button type="submit" className="nb-search__btn" aria-label="بحث">
              <Icon d={ICONS.search} size={17} />
            </button>
            <input
              type="search"
              className="nb-search__input"
              placeholder="ابحث عن منتجات…"
              value={q}
              onChange={e => setQ(e.target.value)}
              autoComplete="off"
            />
          </form>

          {/* Mobile guest links */}
          {!loading && !isAuthenticated && (
            <div className="nb-mobile-auth">
              <button className="nb-btn-ghost nb-btn--full" onClick={() => { navigate('/login'); setMobileMenu(false) }}>تسجيل الدخول</button>
              <button className="nb-btn-primary nb-btn--full" onClick={() => { navigate('/signup'); setMobileMenu(false) }}>إنشاء حساب</button>
            </div>
          )}

          {/* Mobile cart controls */}
          {!loading && isAuthenticated && isCustomer && (
            <div className="nb-mobile-auth">
              {role === 'user' && (
                <button className="nb-btn-primary nb-btn--full" style={{ marginBottom: '8px' }} onClick={() => { navigate('/inventory'); setMobileMenu(false) }}>إدارة المخزن (Inventory)</button>
              )}
              {(role === 'user' || role === 'trader') && (
                 <button className="nb-btn-ghost nb-btn--full" style={{ marginBottom: '8px' }} onClick={() => { navigate('/catalog'); setMobileMenu(false) }}>
                   {role === 'trader' ? 'كتالوج المنتجات' : 'كتالوج المنصة'}
                 </button>
              )}
              <button
                className="nb-btn-ghost nb-btn--full"
                onClick={() => { navigate('/cart'); setMobileMenu(false) }}
              >
                السلة {totalQuantity > 0 ? `(${totalQuantity})` : ''}
              </button>
              <button
                className="nb-btn-primary nb-btn--full"
                onClick={() => { navigate('/checkout'); setMobileMenu(false) }}
              >
                إتمام الطلب
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
