import React from 'react'
import { NavLink } from 'react-router-dom'

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  categories: 'M4 6h16M4 12h16M4 18h7',
  companies: 'M3 21h18M3 7v14M21 7v14M12 3L3 7l9 4 9-4-9-4z',
  products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14v4m0 0l8 4m-8-4l-8 4m0-4v10l8 4',
  notifications: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  pages: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  reviews: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  inventory: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  stats: 'M18 20V10M12 20V4M6 20v-6',
  collapse: 'M11 19l-7-7 7-7M20 19l-7-7 7-7'
}

const items = [
  { to: '/admin', label: 'لوحة التحكم', icon: ICONS.dashboard },
  { to: '/admin/stats', label: 'الإحصائيات والنمو', icon: ICONS.stats },
  { to: '/admin/orders', label: 'إدارة الطلبات', icon: ICONS.orders },
  { to: '/admin/categories', label: 'إدارة الفئات', icon: ICONS.categories },
  { to: '/admin/companies', label: 'إدارة الشركات', icon: ICONS.companies },
  { to: '/admin/products', label: 'إدارة المنتجات', icon: ICONS.products },
  { to: '/admin/trader-products', label: 'منتجات التجار', icon: ICONS.products },
  { to: '/admin/admins', label: 'إدارة المسئولين', icon: ICONS.users },
  { to: '/admin/notifications', label: 'إدارة الإشعارات', icon: ICONS.notifications },
  { to: '/admin/users-online', label: 'إدارة المستخدمين', icon: ICONS.users },
  { to: '/admin/pages', label: 'تخصيص الواجهة', icon: ICONS.pages },
  { to: '/admin/reviews', label: 'إدارة التقييمات', icon: ICONS.reviews },
  { to: '/admin/inventory', label: 'إدارة المخزون', icon: ICONS.inventory },
]

export default function AdminSidebar({ open, onClose, isCollapsed, onToggleCollapse }) {
  return (
    <>
      <button
        type="button"
        className={`admin-overlay ${open ? 'is-visible' : ''}`}
        aria-label="إغلاق القائمة"
        onClick={onClose}
      />

      <aside className={`admin-sidebar ${open ? 'is-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
        <div className="admin-sidebar-head">
          {!isCollapsed && <h2>لوحة التحكم</h2>}
          <button 
            type="button" 
            className="admin-sidebar-collapse-btn" 
            onClick={onToggleCollapse}
            title={isCollapsed ? 'توسيع' : 'طي'}
          >
            <Icon d={ICONS.collapse} size={16} />
          </button>
          <button type="button" className="admin-sidebar-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if (window.innerWidth < 1024) onClose() }}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon d={item.icon} size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
