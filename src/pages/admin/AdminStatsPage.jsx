import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { fetchOrderStats, fetchUserOrderStats, fetchUsers } from '../../controllers/admin/statsController'
import { useAuth } from '../../context/AuthContext'
import toast from '../../utils/toast'
import "./admin-theme.css"

/* ── HELPERS ────────────────────────────────────────────────── */
const fmtMoney = (v) => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(v || 0)
const STATUS_COLORS = {
  pending: '#94a3b8',
  accepted: '#22c55e',
  shipped: '#3b82f6',
  delivered: '#16a34a',
  rejected: '#ef4444',
  cancelled: '#64748b'
}
const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  accepted: 'تم القبول',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  rejected: 'مرفوض',
  cancelled: 'ملغي'
}

export default function AdminStatsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [dates, setDates] = useState({ start: '', end: '' })
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => { })
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = selectedUserId
        ? await fetchUserOrderStats(selectedUserId, dates.start, dates.end)
        : await fetchOrderStats(dates.start, dates.end)
      setStats(data)
    } catch (err) {
      toast(err?.message || 'فشل تحميل الإحصائيات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [selectedUserId])

  // The global endpoint returns { overall, daily }
  // The user endpoint returns   { user, statistics }
  const overall = stats?.overall || {}
  const daily = stats?.daily || []
  const userInfo = stats?.user || null

  // Prepare data for status distribution
  const statusData = useMemo(() => {
    return Object.keys(STATUS_LABELS).map(key => ({
      name: STATUS_LABELS[key],
      value: overall[`${key}Orders`] || 0,
      color: STATUS_COLORS[key]
    })).filter(d => d.value > 0)
  }, [overall])

  return (
    <section className="admin-stack">
      {/* ── Header & Filters ── */}
      <div className="admin-section-head">
        <div>
          <h2>إحصائيات المبيعات والنمو</h2>
          <p>تحليل الأداء للفترة المختارة ومتابعة المبيعات اليومية.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="admin-input"
            style={{ minWidth: '200px' }}
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
          >
            <option value="">📊 إحصائيات عامة</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>
                {u.role === 'trader' ? '🏪' : '👤'} {u.shopName || u.username}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="admin-input"
            value={dates.start}
            onChange={e => setDates({ ...dates, start: e.target.value })}
          />
          <input
            type="date"
            className="admin-input"
            value={dates.end}
            onChange={e => setDates({ ...dates, end: e.target.value })}
          />
          <button className="admin-btn admin-btn-primary" onClick={load}>تحديث</button>
        </div>
      </div>

      {/* ── User Info Banner (when a user is selected) ── */}
      {userInfo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '14px 20px', marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>{userInfo.role === 'trader' ? '🏪' : '👤'}</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#15803d', margin: 0 }}>{userInfo.shopName || userInfo.username}</p>
            <p style={{ fontSize: 12, color: '#166534', margin: 0 }}>{userInfo.role === 'trader' ? 'تاجر' : 'عميل'} — ID: {userInfo.id}</p>
          </div>
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi">
          <span className="admin-kpi-label">إجمالي المبيعات</span>
          <span className="admin-kpi-value" style={{ color: 'var(--g700)' }}>
            {fmtMoney(overall.totalRevenue)} <small style={{ fontSize: '12px' }}>ج.م</small>
          </span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-label">عدد الطلبات</span>
          <span className="admin-kpi-value">{overall.totalOrders || 0}</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-label">المنتجات المباعة</span>
          <span className="admin-kpi-value">{overall.totalQuantity || 0}</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-label">متوسط قيمة الطلب</span>
          <span className="admin-kpi-value">
            {fmtMoney(overall.totalOrders ? (overall.totalRevenue / overall.totalOrders) : 0)}
          </span>
        </div>
      </div>

      <div className="admin-stats-grid">

        {/* ── Daily Line Chart (global only) ── */}
        {
          <div className="admin-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <p className="admin-kicker">الأداء اليومي (آخر 30 يوم)</p>
            <h3 style={{ marginBottom: '20px', fontWeight: 900 }}>منحنى المبيعات والطلبات</h3>
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 800, marginBottom: '5px' }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Line name="المبيعات (ج.م)" type="monotone" dataKey="revenue" stroke="var(--g600)" strokeWidth={3} dot={{ r: 4, fill: 'var(--g600)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line name="الطلبات" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        }


        {/* ── Status Pie (always shown) ── */}
        <div className="admin-card">
          <p className="admin-kicker">توزيع الحالات</p>
          <h3 style={{ marginBottom: '20px', fontWeight: 900 }}>تفصيل حالات الطلبات</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '20px', display: 'grid', gap: '8px' }}>
            {statusData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
                  <span style={{ color: '#475569', fontWeight: 600 }}>{item.name}</span>
                </div>
                <strong style={{ color: '#0f172a' }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Daily table (global mode only) ── */}
      {
        <div className="admin-card" style={{ marginTop: '20px' }}>
          <p className="admin-kicker">جدول البيانات التاريخية</p>
          <div className="product-table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>عدد الطلبات</th>
                  <th>الكمية المباعة</th>
                  <th>إجمالي الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {daily.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>لا توجد بيانات لهذه الفترة.</td></tr>
                ) : (
                  [...daily].reverse().map(row => (
                    <tr key={row._id}>
                      <td>{row._id}</td>
                      <td>{row.orders}</td>
                      <td>{row.quantity}</td>
                      <td style={{ fontWeight: 800, color: 'var(--g700)' }}>{fmtMoney(row.revenue)} ج.م</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </section>
  )
}
