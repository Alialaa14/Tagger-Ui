import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <section className="admin-card">
      <p className="admin-kicker">إدارة المتجر</p>
      <h2>لوحة إدارة المنتجات</h2>
      <p className="admin-muted">
        يمكنك من هنا إدارة جميع المنتجات وإنشاء منتجات جديدة مع دعم مستويات خصم متعددة.
      </p>

      <div className="admin-grid-2">
        <Link className="admin-quick-link" to="/admin/products">إدارة المنتجات</Link>
        <Link className="admin-quick-link" to="/admin/products/new">إنشاء منتج جديد</Link>
      </div>
    </section>
  )
}
