import React from 'react'
import { useLocation } from 'react-router-dom'

const pageMeta = {
  '/admin': { title: 'لوحة التحكم', description: 'نظرة سريعة على إدارة النظام' },
  '/admin/categories': { title: 'إدارة الفئات', description: 'إضافة وتعديل وحذف الفئات' },
  '/admin/products': { title: 'إدارة المنتجات', description: 'عرض المنتجات وتعديلها وحذفها' },
  '/admin/users-online': { title: 'إدارة المستخدمين', description: 'عرض المستخدمين مع التعديل والحذف عبر API' },
}

export default function AdminHeader({ onMenuClick }) {
  const location = useLocation()
  const meta = pageMeta[location.pathname] || pageMeta['/admin']

  return (
    <header className="admin-header">
      <button type="button" className="admin-menu-btn" onClick={onMenuClick} aria-label="فتح القائمة">
        ☰
      </button>
      <div>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>
    </header>
  )
}
