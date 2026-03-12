import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/admin', label: 'لوحة التحكم' },
  { to: '/admin/orders', label: 'إدارة الطلبات' },
  { to: '/admin/categories', label: 'إدارة الفئات' },
  { to: '/admin/products', label: 'إدارة المنتجات' },
  { to: '/admin/notifications', label: 'إدارة الإشعارات' },
  { to: '/admin/users-online', label: 'إدارة المستخدمين' },
]

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      <button
        type="button"
        className={`admin-overlay ${open ? 'is-visible' : ''}`}
        aria-label="إغلاق القائمة"
        onClick={onClose}
      />

      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar-head">
          <h2>لوحة التحكم</h2>
          <button type="button" className="admin-sidebar-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
