import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminDashboardStats } from '../../controllers/admin/dashboardController'
import "./admin-theme.css"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetchAdminDashboardStats()
      .then((res) => {
        if (!active) return
        setStats(res)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard stats.')
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  const fmtMoney = (value) => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(value || 0)

  return (
    <section className="admin-stack">
      <div className="admin-card">
        <p className="admin-kicker">إدارة المتجر</p>
        <h2>لوحة الإدارة</h2>
        <p className="admin-muted">
          يمكنك من هنا إدارة المنتجات والفئات والطلبات مع نظرة سريعة على الأداء.
        </p>

        <div className="admin-grid-2">
          <Link className="admin-quick-link" to="/admin/products">إدارة المنتجات</Link>
          <Link className="admin-quick-link" to="/admin/products/new">إنشاء منتج جديد</Link>
          <Link className="admin-quick-link" to="/admin/orders">إدارة الطلبات</Link>
          <Link className="admin-quick-link" to="/admin/categories">إدارة الفئات</Link>
        </div>
      </div>

      <div className="admin-card">
        <p className="admin-kicker">إحصائيات</p>
        <h2>ملخص الطلبات</h2>
        <p className="admin-muted">أرقام سريعة لإجمالي الطلبات وقيمتها.</p>
        {error && <p className="admin-muted" style={{ color: '#dc2626', marginTop: 10 }}>{error}</p>}

        {loading && (
          <div className="admin-kpi-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="admin-kpi">
                <span className="admin-kpi-label">...</span>
                <span className="admin-kpi-value">—</span>
              </div>
            ))}
          </div>
        )}

        {!loading && stats && (
          <div className="admin-kpi-grid">
            <div className="admin-kpi">
              <span className="admin-kpi-label">إجمالي الطلبات</span>
              <span className="admin-kpi-value">{stats.totalOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">طلبات قيد الانتظار</span>
              <span className="admin-kpi-value">{stats.pendingOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">طلبات مقبولة</span>
              <span className="admin-kpi-value">{stats.acceptedOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">طلبات مرفوضة</span>
              <span className="admin-kpi-value">{stats.rejectedOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">طلبات محوّلة</span>
              <span className="admin-kpi-value">{stats.forwardedOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">إجمالي المبيعات</span>
              <span className="admin-kpi-value">{fmtMoney(stats.revenueTotal)} ج.م</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">متوسط قيمة الطلب</span>
              <span className="admin-kpi-value">{fmtMoney(stats.revenueAvg)} ج.م</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
