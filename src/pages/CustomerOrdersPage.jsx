import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import NotificationsPanel from '../components/notifications/NotificationsPanel'
import socket from '../socket'
import BackNavigator from '../components/common/BackNavigator'
import './orders.css'

// ── Status config ─────────────────────────────────────────────
const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', cls: 'status-pending', icon: '⏳' },
  accepted: { label: 'مقبول', cls: 'status-accepted', icon: '✅' },
  rejected: { label: 'مرفوض', cls: 'status-rejected', icon: '❌' },
  shipped: { label: 'تم الشحن', cls: 'status-forwarded', icon: '📦' },
  delivered: { label: 'تم التسليم', cls: 'status-delivered', icon: '🎉' },
  cancelled: { label: 'ملغي', cls: 'status-rejected', icon: '🚫' },
}

function statusMeta(s) {
  return STATUS_MAP[s] || { label: s, cls: 'status-pending', icon: '•' }
}

// ── Format date ───────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  const dateObj = new Date(d);
  if (isNaN(dateObj)) return '—';
  return dateObj.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// ── Single customer order card ────────────────────────────────
function CustomerOrderCard({ order, onCancel }) {
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
          <span className="order-info-value">{order.products?.length ?? '—'}</span>
        </div>
        <div className="order-info-item">
          <span className="order-info-label">إجمالي الكمية</span>
          <span className="order-info-value">
            {order.totalQuantity ?? order.products?.reduce((s, i) => s + (i.quantity || 0), 0) ?? '—'}
          </span>
        </div>
        <div className="order-info-item">
          <span className="order-info-label">الإجمالي</span>
          <span className="order-info-value is-green">
            {order.totalPrice?.toFixed(2) ?? '—'} ج.م
          </span>
        </div>
        {order.address && (
          <div className="order-info-item">
            <span className="order-info-label">العنوان</span>
            <span className="order-info-value">{order.address}</span>
          </div>
        )}
        {order.coupon && (
          <div className="order-info-item">
            <span className="order-info-label">كوبون</span>
            <span className="order-info-value" style={{ fontSize: 11 }}>
              {typeof order.coupon === 'object' ? order.coupon.name : order.coupon}
            </span>
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
      {order.note && (
        <div className="order-note">
          <span className="order-note-icon">📝</span>
          <span>{order.note}</span>
        </div>
      )}

      {/* Products expandable */}
      {order.products?.length > 0 && (
        <>
          {expanded && (
            <div className="order-products-list">
              <p className="order-products-list-title">المنتجات</p>
              {order.products.map((it, i) => (
                <div key={it._id || i} className="order-product-row">
                  <span className="order-product-name">
                    {it.productId?.name || `منتج ${i + 1}`}
                  </span>
                  <span className="order-product-qty">× {it.quantity}</span>
                  <span className="order-product-price">
                    {it.totalPrice?.toFixed(2) ?? '—'} ج.م
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
            {order.status === 'pending' && (
              <button
                className="ord-btn ord-btn-reject"
                onClick={() => onCancel(order._id || order.id)}
              >
                🚫 إلغاء الطلب
              </button>
            )}
          </div>
        </>
      )}

      {/* If no products, still show cancel button if pending */}
      {(!order.products || order.products.length === 0) && order.status === 'pending' && (
        <div className="order-card-actions">
          <button
            className="ord-btn ord-btn-reject"
            onClick={() => onCancel(order._id || order.id)}
          >
            🚫 إلغاء الطلب
          </button>
        </div>
      )}
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function CustomerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const userId = user._id || user.id
        const res = await axios.get('/api/v1/order', {
          params: { userId, limit, page, sortBy, sortOrder },
          withCredentials: true
        })

        let fetchedOrders = res.data?.data || res.data?.orders || res.data?.results
        if (!Array.isArray(fetchedOrders)) {
          fetchedOrders = Array.isArray(res.data?.data?.orders) ? res.data.data.orders : Array.isArray(res.data?.data) ? res.data.data : []
        }
        setOrders(fetchedOrders)

        const totalItems = res.data?.total || res.data?.count || 0
        if (totalItems > 0 && limit > 0) {
          setTotalPages(Math.ceil(totalItems / limit))
        } else if (res.data?.totalPages) {
          setTotalPages(res.data.totalPages)
        } else {
          setTotalPages(1) // fallback
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, page, limit, sortBy, sortOrder])

  useEffect(() => {
    function handleUpdate(payload) {
      const orderId = payload?.orderId || payload?.order?._id || payload?.order?.id || payload?._id || payload?.id
      const newStatus = payload?.status || payload?.order?.status || payload?.status

      if (!orderId || !newStatus) return

      setOrders((prev) => prev.map((o) => {
        if ((o._id || o.id) === orderId) {
          return { ...o, status: newStatus }
        }
        return o
      }))
    }

    socket.on('updateOrderStatus', handleUpdate)
    return () => {
      socket.off('updateOrderStatus', handleUpdate)
    }
  }, [])

  async function handleCancelOrder(orderId) {
    // 🔌 Optional: Wire your API here e.g.:
    // await axios.patch(`/api/v1/order/${orderId}/status`, { status: "cancelled" }, { withCredentials: true })

    setOrders((prev) => prev.map((o) => {
      if ((o._id || o.id) === orderId) {
        const nextOrder = { ...o, status: 'cancelled' }
        socket.emit('updateOrderStatus', { orderId, status: 'cancelled' })
        return nextOrder
      }
      return o
    }))
  }

  const filtered = orders.filter((o) => {
    const matchSearch = !search || String(o._id || o.id).includes(search)
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="home-page">
      <Navbar />

      <main className="orders-page-wrap container" dir="rtl">
        <BackNavigator fallback="/profile" />
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

        <NotificationsPanel title="إشعاراتي" />

        {/* Filters */}
        <div className="orders-filters" style={{ flexWrap: 'wrap', gap: '12px' }}>
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
            <option value="cancelled">ملغي</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التسليم</option>
          </select>

          {/* New API Filters */}
          <select
            className="orders-filter-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="createdAt">تاريخ الطلب</option>
            <option value="totalPrice">الإجمالي</option>
          </select>
          <select
            className="orders-filter-select"
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
          >
            <option value="desc">الحداثة (تنازلي)</option>
            <option value="asc">القِدم (تصاعدي)</option>
          </select>
          <select
            className="orders-filter-select"
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            <option value={5}>5 طلبات / صفحة</option>
            <option value={10}>10 طلبات / صفحة</option>
            <option value={20}>20 طلبات / صفحة</option>
            <option value={50}>50 طلبات / صفحة</option>
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

        {/* Empty Content */}
        {!loading && orders.length === 0 && (
          <div className="orders-empty">
            <span className="orders-empty-icon">📭</span>
            <h2>لا توجد طلبات</h2>
            <p>لم تقم بأي طلبات بعد. ابدأ التسوّق الآن!</p>
            <Link to="/" className="ord-btn ord-btn-accept" style={{ marginTop: 8, padding: '0 24px', minHeight: 44 }}>
              تصفح المنتجات
            </Link>
          </div>
        )}

        {/* Local UI Filter returned no results */}
        {!loading && orders.length > 0 && filtered.length === 0 && (
          <div className="orders-empty" style={{ padding: '2rem 1rem' }}>
            <span className="orders-empty-icon">🔍</span>
            <h2>لا توجد طلبات مطابقة للبحث/التصفية</h2>
            <button className="ord-btn ord-btn-details" onClick={() => { setSearch(''); setFilter('all'); }}>
              مسح الفلاتر المحلية
            </button>
          </div>
        )}

        {/* List */}
        {!loading && filtered.length > 0 && (
          <div className="orders-list">
            {filtered.map((o) => (
              <CustomerOrderCard key={o._id || o.id} order={o} onCancel={handleCancelOrder} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px', alignItems: 'center' }}>
            <button
              className="ord-btn ord-btn-details"
              style={{ padding: '8px 16px' }}
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              السابق
            </button>
            <span style={{ fontSize: '14px', fontWeight: '500', margin: '0 8px' }}>
              صفحة {page} من {totalPages}
            </span>
            <button
              className="ord-btn ord-btn-details"
              style={{ padding: '8px 16px' }}
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              التالي
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
