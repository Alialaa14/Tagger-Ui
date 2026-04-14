import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminDashboardStats } from '../../controllers/admin/dashboardController'
import BannerCarousel from '../../components/BannerCarousel'
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
        <p className="admin-kicker">????? ??????</p>
        <h2>???? ???????</h2>
        <p className="admin-muted">
          ????? ?? ??? ????? ???????? ??????? ???????? ?? ???? ????? ??? ??????.
        </p>

        <div className="admin-grid-2">
          <Link className="admin-quick-link" to="/admin/products">????? ????????</Link>
          <Link className="admin-quick-link" to="/admin/products/new">????? ???? ????</Link>
          <Link className="admin-quick-link" to="/admin/orders">????? ???????</Link>
          <Link className="admin-quick-link" to="/admin/categories">????? ??????</Link>
        </div>
      </div>

      <div className="admin-card">
        <p className="admin-kicker">????????</p>
        <h2>???? ???????</h2>
        <p className="admin-muted">????? ????? ??????? ??????? ???????.</p>
        {error && <p className="admin-muted" style={{ color: '#dc2626', marginTop: 10 }}>{error}</p>}

        {loading && (
          <div className="admin-kpi-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="admin-kpi">
                <span className="admin-kpi-label">...</span>
                <span className="admin-kpi-value">�</span>
              </div>
            ))}
          </div>
        )}

        {!loading && stats && (
          <div className="admin-kpi-grid">
            <div className="admin-kpi">
              <span className="admin-kpi-label">?????? ???????</span>
              <span className="admin-kpi-value">{stats.totalOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">????? ??? ????????</span>
              <span className="admin-kpi-value">{stats.pendingOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">????? ??????</span>
              <span className="admin-kpi-value">{stats.acceptedOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">????? ??????</span>
              <span className="admin-kpi-value">{stats.rejectedOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">????? ??????</span>
              <span className="admin-kpi-value">{stats.forwardedOrders}</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">?????? ????????</span>
              <span className="admin-kpi-value">{fmtMoney(stats.revenueTotal)} ?.?</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi-label">????? ???? ?????</span>
              <span className="admin-kpi-value">{fmtMoney(stats.revenueAvg)} ?.?</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
