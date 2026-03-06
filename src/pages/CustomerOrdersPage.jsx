import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import './orders.css'

// ── Status config ─────────────────────────────────────────────
const STATUS_MAP = {
  pending:    { label: 'قيد الانتظار',    cls: 'status-pending',    icon: '⏳' },
  accepted:   { label: 'مقبول',           cls: 'status-accepted',   icon: '✅' },
  rejected:   { label: 'مرفوض',           cls: 'status-rejected',   icon: '❌' },
  partial:    { label: 'مقبول جزئياً',    cls: 'status-partial',    icon: '⚠️' },
  forwarded:  { label: 'محوّل لتاجر',     cls: 'status-forwarded',  icon: '📦' },
  processing: { label: 'جار التنفيذ',     cls: 'status-processing', icon: '🔄' },
  delivered:  { label: 'تم التسليم',      cls: 'status-delivered',  icon: '🎉' },
}

function statusMeta(s) {
  return STATUS_MAP[s] || { label: s, cls: 'status-pending', icon: '•' }
}

// ── Format date ───────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Single customer order card ────────────────────────────────
function CustomerOrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const sm = statusMeta(order.status)

  return (
    <article className="order-card" dir="rtl">
      {/* Top row */}
      <div className="order-card-top">
        <div className="order-card-id-group">
          <p className="order-card-id">رقم الطلب: <span>#{order._id || order.id}</span></p>
          <p className="order-card-date">{fmtDate(order.createdAt)}</p>
        </div>
        <span className={`order-status-badge ${sm.cls}`}>
          {sm.icon} {sm.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="order-card-info">
        <div className="order-info-item">
          <span className="order-info-label">عدد الأصناف</span>
          <span className="order-info-value">{order.items?.length ?? '—'}</span>
        </div>
        <div className="order-info-item">
          <span className="order-info-label">إجمالي الكمية</span>
          <span className="order-info-value">
            {order.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? '—'}
          </span>
        </div>
        <div className="order-info-item">
          <span className="order-info-label">الإجمالي</span>
          <span className="order-info-value is-green">
            {order.finalTotal?.toFixed(2) ?? order.total?.toFixed(2) ?? '—'} ج.م
          </span>
        </div>
        {order.city && (
          <div className="order-info-item">
            <span className="order-info-label">المدينة</span>
            <span className="order-info-value">{order.city}</span>
          </div>
        )}
        {order.couponCode && (
          <div className="order-info-item">
            <span className="order-info-label">كوبون</span>
            <span className="order-info-value" style={{ fontSize: 11 }}>{order.couponCode}</span>
          </div>
        )}
        {order.paymentMethod && (
          <div className="order-info-item">
            <span className="order-info-label">طريقة الدفع</span>
            <span className="order-info-value">
              {order.paymentMethod === 'cash' ? 'عند الاستلام' : order.paymentMethod}
            </span>
          </div>
        )}
      </div>

      {/* Order note */}
      {order.orderNote && (
        <div className="order-note">
          <span className="order-note-icon">📝</span>
          <span>{order.orderNote}</span>
        </div>
      )}

      {/* Products expandable */}
      {order.items?.length > 0 && (
        <>
          {expanded && (
            <div className="order-products-list">
              <p className="order-products-list-title">المنتجات</p>
              {order.items.map((it, i) => (
                <div key={i} className="order-product-row">
                  <span className="order-product-name">
                    {it.product?.name || it.productId || `منتج ${i + 1}`}
                  </span>
                  <span className="order-product-qty">× {it.quantity}</span>
                  <span className="order-product-price">
                    {it.lineTotal?.toFixed(2) ?? '—'} ج.م
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="order-card-actions">
            <button
              className="ord-btn ord-btn-details"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? '▲ إخفاء المنتجات' : '▼ عرض المنتجات'}
            </button>
          </div>
        </>
      )}
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function CustomerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    // 🔌 Replace with your real API call:
    // const res = await axios.get('/api/v1/order/my', { withCredentials: true })
    // setOrders(res.data.data || [])
    const timer = setTimeout(() => {
      setOrders(SAMPLE_CUSTOMER_ORDERS)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const filtered = orders.filter((o) => {
    const matchSearch = !search || String(o._id || o.id).includes(search)
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="home-page">
      <Navbar />

      <main className="orders-page-wrap container" dir="rtl">
        {/* Header */}
        <div className="orders-page-head">
          <div>
            <p className="orders-kicker">My Orders</p>
            <h1>طلباتي</h1>
            <p>تتبّع حالة جميع طلباتك السابقة</p>
          </div>
          <Link to="/" className="ord-btn ord-btn-details">
            ← تسوّق أكثر
          </Link>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <input
            className="orders-search"
            placeholder="ابحث برقم الطلب…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="orders-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="partial">جزئي</option>
            <option value="delivered">تم التسليم</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="orders-skeleton-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="orders-skeleton-card">
                <div className="s-line s-lg shimmer" style={{ height: 18 }} />
                <div className="s-line s-sm shimmer" />
                <div className="s-line shimmer" style={{ width: '90%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="orders-empty">
            <span className="orders-empty-icon">📭</span>
            <h2>لا توجد طلبات</h2>
            <p>لم تقم بأي طلبات بعد. ابدأ التسوّق الآن!</p>
            <Link to="/" className="ord-btn ord-btn-accept" style={{ marginTop: 8, padding: '0 24px', minHeight: 44 }}>
              تصفح المنتجات
            </Link>
          </div>
        )}

        {/* List */}
        {!loading && filtered.length > 0 && (
          <div className="orders-list">
            {filtered.map((o) => (
              <CustomerOrderCard key={o._id || o.id} order={o} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

// ── Sample data (remove when wiring real API) ─────────────────
const SAMPLE_CUSTOMER_ORDERS = [
  {
    _id: 'ORD-1001',
    status: 'delivered',
    createdAt: '2024-12-10T10:00:00Z',
    finalTotal: 850,
    city: 'القاهرة',
    paymentMethod: 'cash',
    couponCode: 'SAVE10',
    orderNote: 'الباب الخلفي للمبنى من فضلك',
    items: [
      { productId: 'p1', product: { name: 'هاتف ذكي A50' }, quantity: 1, lineTotal: 700 },
      { productId: 'p2', product: { name: 'سماعة بلوتوث' }, quantity: 2, lineTotal: 150 },
    ],
  },
  {
    _id: 'ORD-1002',
    status: 'pending',
    createdAt: '2025-01-20T14:30:00Z',
    finalTotal: 320,
    city: 'الإسكندرية',
    paymentMethod: 'transfer',
    items: [
      { productId: 'p3', product: { name: 'شاشة LCD 24"' }, quantity: 1, lineTotal: 320 },
    ],
  },
  {
    _id: 'ORD-1003',
    status: 'partial',
    createdAt: '2025-02-05T09:00:00Z',
    finalTotal: 560,
    city: 'الجيزة',
    paymentMethod: 'cash',
    items: [
      { productId: 'p4', product: { name: 'لابتوب مستعمل' }, quantity: 1, lineTotal: 500 },
      { productId: 'p5', product: { name: 'ماوس لاسلكي' }, quantity: 2, lineTotal: 60 },
    ],
  },
]
