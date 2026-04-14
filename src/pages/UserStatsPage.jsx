import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { fetchUserOrderStats } from '../controllers/admin/statsController'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackNavigator from '../components/common/BackNavigator'
import toast from '../utils/toast'
import './orders.css'

/* ── Helpers ─────────────────────────────────────────────────── */
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

/* ── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color = '#0f172a', icon }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</span>}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function UserStatsPage() {
  const { user } = useAuth()
  const isTrader = (user?.role || user?.accountType || '').toLowerCase() === 'trader'

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dates, setDates] = useState({ start: '', end: '' })

  const load = async () => {
    if (!user) return
    try {
      setLoading(true)
      const userId = user._id || user.id
      const data = await fetchUserOrderStats(userId, dates.start, dates.end)
      setStats(data)
    } catch (err) {
      toast(err?.message || 'فشل تحميل الإحصائيات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user])

  const overall = stats?.statistics || stats?.overall || {}
  const daily = stats?.daily || []
  const userInfo = stats?.user || null

  const statusData = useMemo(() =>
    Object.keys(STATUS_LABELS)
      .map(key => ({
        name: STATUS_LABELS[key],
        value: overall[`${key}Orders`] || 0,
        color: STATUS_COLORS[key]
      }))
      .filter(d => d.value > 0),
    [overall]
  )

  const avgOrder = overall.totalOrders
    ? (overall.totalRevenue / overall.totalOrders)
    : 0

  return (
    <div className="home-page">
      <Navbar />
      <main className="orders-page-wrap container" dir="rtl" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <BackNavigator fallback="/" />

        {/* Header */}
        <div className="orders-page-head" style={{ marginBottom: 24 }}>
          <div>
            <p className="orders-kicker">{isTrader ? 'لوحة التاجر' : 'لوحة العميل'}</p>
            <h1>إحصائياتي</h1>
            <p>{userInfo ? `${userInfo.shopName || userInfo.username} — ` : ''}متابعة أداء طلباتك وإيراداتك خلال الفترة المختارة.</p>
          </div>
        </div>

        {/* Date filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
          <input
            type="date"
            className="orders-search"
            style={{ width: 'auto' }}
            value={dates.start}
            onChange={e => setDates(d => ({ ...d, start: e.target.value }))}
          />
          <input
            type="date"
            className="orders-search"
            style={{ width: 'auto' }}
            value={dates.end}
            onChange={e => setDates(d => ({ ...d, end: e.target.value }))}
          />
          <button className="ord-btn ord-btn-accept" onClick={load}>
            🔄 تحديث
          </button>
          {(dates.start || dates.end) && (
            <button
              className="ord-btn ord-btn-details"
              onClick={() => { setDates({ start: '', end: '' }); setTimeout(load, 0) }}
            >
              ✕ مسح الفلتر
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="orders-skeleton-card shimmer" style={{ height: 110, borderRadius: 16 }} />
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <KpiCard
                icon="📦"
                label="إجمالي الطلبات"
                value={overall.totalOrders || 0}
              />
              <KpiCard
                icon="💰"
                label={isTrader ? 'إجمالي الإيرادات' : 'إجمالي الإنفاق'}
                value={`${fmtMoney(overall.totalRevenue)} ج.م`}
                color="#16a34a"
              />
              <KpiCard
                icon="🛍️"
                label="الكمية المباعة"
                value={overall.totalQuantity || 0}
              />
              <KpiCard
                icon="📊"
                label="متوسط قيمة الطلب"
                value={`${fmtMoney(avgOrder)} ج.م`}
                color="#3b82f6"
              />
              {overall.deliveredOrders != null && (
                <KpiCard
                  icon="✅"
                  label="طلبات مُسلَّمة"
                  value={overall.deliveredOrders}
                  color="#16a34a"
                />
              )}
              {overall.pendingOrders != null && (
                <KpiCard
                  icon="⏳"
                  label="طلبات معلقة"
                  value={overall.pendingOrders}
                  color="#f59e0b"
                />
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, marginBottom: 28, alignItems: 'start' }}>

              {/* Daily Line Chart */}
              {daily.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>الأداء اليومي</p>
                  <h3 style={{ fontWeight: 900, marginBottom: 20 }}>منحنى المبيعات والطلبات</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={daily}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={8} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-8} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 16 }} />
                        <Line name="المبيعات (ج.م)" type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        <Line name="الطلبات" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Pie Chart */}
              {statusData.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minWidth: 260 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>توزيع الحالات</p>
                  <h3 style={{ fontWeight: 900, marginBottom: 16 }}>تفصيل الطلبات</h3>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                    {statusData.map(item => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, display: 'inline-block' }} />
                          <span style={{ color: '#475569', fontWeight: 600 }}>{item.name}</span>
                        </div>
                        <strong style={{ color: '#0f172a' }}>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Table */}
            {daily.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>جدول البيانات</p>
                <h3 style={{ fontWeight: 900, marginBottom: 20 }}>الأداء اليومي التفصيلي</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        {['التاريخ', 'الطلبات', 'الكمية', 'الإيرادات'].map(h => (
                          <th key={h} style={{ textAlign: 'right', padding: '10px 12px', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...daily].reverse().map(row => (
                        <tr key={row._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 600 }}>{row._id}</td>
                          <td style={{ padding: '10px 12px' }}>{row.orders}</td>
                          <td style={{ padding: '10px 12px' }}>{row.quantity}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#16a34a' }}>{fmtMoney(row.revenue)} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {daily.length === 0 && statusData.length === 0 && (
              <div className="orders-empty">
                <span className="orders-empty-icon">📊</span>
                <h2>لا توجد بيانات إحصائية</h2>
                <p>لم يتم العثور على أي طلبات في هذه الفترة.</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
