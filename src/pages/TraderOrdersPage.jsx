import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import NotificationsPanel from '../components/notifications/NotificationsPanel'
import socket, { onSendOrder, offSendOrder, onOrderCreated, offOrderCreated } from '../socket'
import axios from 'axios'
import toast from '../utils/toast'
import BackNavigator from '../components/common/BackNavigator'
import notificationSound from '../assets/tritone.mp3'
import useCountdown from '../hooks/useCountdown'
import './Orders.css'

// ── Status config ─────────────────────────────────────────────
const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', cls: 'status-pending', icon: '⏳' },
  accepted: { label: 'مقبول', cls: 'status-accepted', icon: '✅' },
  rejected: { label: 'مرفوض', cls: 'status-rejected', icon: '❌' },
  shipped: { label: 'تم الشحن', cls: 'status-forwarded', icon: '📦' },
  delivered: { label: 'تم التسليم', cls: 'status-delivered', icon: '🚚' },
  cancelled: { label: 'ملغي', cls: 'status-rejected', icon: '🚫' },
}
function statusMeta(s) { return STATUS_MAP[s] || { label: s, cls: 'status-pending', icon: '•' } }
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

// ── Reject Reason Modal ───────────────────────────────────────
function RejectModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl">
        <div className="orders-modal-head">
          <div>
            <h3>❌ رفض الطلب</h3>
            <p>يمكنك إضافة سبب للرفض ليصل للعميل.</p>
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>
        <label className="orders-modal-label">
          <span>سبب الرفض</span>
          <textarea
            className="orders-modal-textarea"
            placeholder="مثال: المنتج غير متوفر في المخزون…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button className="ord-btn ord-btn-reject" onClick={() => onConfirm(reason)}>
            تأكيد الرفض
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Order countdown timer ─────────────────────────────────────
function OrderCountdown({ createdAt }) {
  const remaining = useCountdown(createdAt, 5 * 60 * 1000)
  if (remaining <= 0) return null

  const pct = (remaining / 5) * 100
  const color = remaining <= 2 ? '#ef4444' : remaining <= 3 ? '#f59e0b' : '#3b82f6'
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, fontWeight: 700, color }}>
        <span>⏱ وقت متبقٍّ للمعالجة</span>
        <span dir="ltr">{mm}:{ss}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s linear, background 0.3s' }} />
      </div>
    </div>
  )
}

// ── Trader order card ─────────────────────────────────────────
function TraderOrderCard({ order, onAction }) {
  const [showReject, setShowReject] = useState(false)
  const [showPartial, setShowPartial] = useState(false)
  const sm = statusMeta(order.status)

  const isActable = order.status === 'pending'
  console.log(order.status)
  return (
    <>
      <article className="order-card" dir="rtl">
        <div className="order-card-top">
          <div className="order-card-id-group">
            <p className="order-card-id">رقم الطلب: <span>#{order._id || order.id}</span></p>
            <p className="order-card-date">{fmtDate(order.createdAt)}</p>
          </div>
          <span className={`order-status-badge ${sm.cls}`}>{sm.icon} {sm.label}</span>
        </div>

        <div className="order-card-info">
          <div className="order-info-item">
            <span className="order-info-label">عدد الأصناف</span>
            <span className="order-info-value">{order.items?.length ?? '—'}</span>
          </div>
          {order.totalTraderPrice != null && (
            <div className="order-info-item">
              <span className="order-info-label">إجمالي منتجاتك</span>
              <span className="order-info-value" style={{ color: '#f59e0b', fontWeight: 700 }}>{Number(order.totalTraderPrice).toFixed(2)} ج.م</span>
            </div>
          )}
        </div>

        <OrderCountdown createdAt={order.receivedAt} />

        {order.orderNote && (
          <div className="order-note">
            <span className="order-note-icon">📝</span>
            <span>{order.orderNote}</span>
          </div>
        )}

        {order.items?.length > 0 && (
          <div className="order-products-list">
            <p className="order-products-list-title">المنتجات</p>
            {order?.items?.map((it, i) => {
              const prodObj = typeof it.productId === 'object' && it.productId ? it.productId : (typeof it.product === 'object' && it.product ? it.product : null);
              const productName = prodObj?.name || (typeof it.productId === 'string' ? it.productId : `منتج ${i + 1}`);
              const productImage = prodObj?.image?.url || prodObj?.image || null;
              const traderProd = it.traderProduct
              const traderProdName = typeof traderProd === 'object' ? traderProd?.name : null
              const traderProdPrice = typeof traderProd === 'object' ? traderProd?.price : null

              return (
                <div key={i} className="order-product-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                  {productImage ? (
                    <img src={productImage} alt={productName} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📦</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="order-product-name" style={{ display: 'block' }}>{productName}</span>
                    {traderProdName && (
                      <span style={{ display: 'block', fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>🏪 {traderProdName}{traderProdPrice != null ? ` — ${Number(traderProdPrice).toFixed(2)} ج.م` : ''}</span>
                    )}
                  </div>
                  <span className="order-product-qty" style={{ fontWeight: 800 }}>× {it.quantity}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="order-card-actions">
          {isActable ? (
            <>
              <button
                className="ord-btn ord-btn-accept"
                onClick={() => onAction(order._id || order.id, 'accept')}
              >
                ✅ قبول الطلب
              </button>
              <button
                className="ord-btn ord-btn-reject"
                onClick={() => setShowReject(true)}
              >
                ❌ رفض الطلب
              </button>
            </>
          ) : (
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>
              تم اتخاذ إجراء — {sm.label}
            </span>
          )}
        </div>
      </article>

      {showReject && (
        <RejectModal
          onClose={() => setShowReject(false)}
          onConfirm={(reason) => {
            onAction(order._id || order.id, 'reject', { reason })
            setShowReject(false)
          }}
        />
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function TraderOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const filterParam = params.get('filter')
    if (filterParam) {
      setFilter(filterParam)
    }
  }, [location.search])

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!user || !user._id) return
    let active = true
    setLoading(true)
    setError('')
    console.log(user._id)
    axios.get('/api/v1/order', {
      params: { userId: user._id, limit, page, sortBy, sortOrder },
      withCredentials: true
    })
      .then((res) => {
        if (!active) return
        let data = res.data?.data || res.data?.orders || res.data?.results || res.data
        if (!Array.isArray(data)) {
          data = Array.isArray(res.data?.data?.orders) ? res.data.data.orders : Array.isArray(res.data?.data) ? res.data.data : []
        }
        const totalItems = res.data?.total || res.data?.count || data.length
        if (totalItems > 0 && limit > 0) setTotalPages(Math.ceil(totalItems / limit))
        else if (res.data?.totalPages) setTotalPages(res.data.totalPages)

        const normalized = data.map(rawOrder => ({
          ...rawOrder,
          items: rawOrder.items || rawOrder.products || [],
          finalTotal: rawOrder.finalTotal ?? rawOrder.totalPrice ?? 0,
          customerName: rawOrder.customerName || rawOrder.username || '—',
          customerPhone: rawOrder.customerPhone || rawOrder.phoneNumber || '—',
          orderNote: rawOrder.orderNote || rawOrder.note || '',
          createdAt: rawOrder.createdAt || new Date().toISOString(),
        }))
        setOrders(normalized)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch orders.')
        setLoading(false)
      })

    return () => { active = false }
  }, [user, page, limit, sortBy, sortOrder])

  useEffect(() => {
    function playAudio() {
      try {
        const audio = new Audio(notificationSound);
        audio.play().catch(e => console.error('Audio play failed:', e));
      } catch (err) {
        console.error('Audio error:', err);
      }
    }

    function handleNewOrder(payload, isNew = false) {
      if (isNew) playAudio();

      console.log(payload)
      const rawOrder = payload?.order || payload
      const payloadUser = payload?.user || rawOrder?.user || rawOrder?.shop || null;
      // Provide fallback properties if nested fields are missing so UI doesnt crash on new orders
      const normalizedOrder = {
        ...rawOrder,
        items: rawOrder.items || rawOrder.products || [],
        finalTotal: rawOrder.finalTotal ?? rawOrder.totalPrice ?? 0,
        customerName: payloadUser?.username || payloadUser?.shopName || rawOrder.customerName || rawOrder.username || '—',
        customerPhone: payloadUser?.phoneNumber || rawOrder.customerPhone || rawOrder.phoneNumber || '—',
        orderNote: rawOrder.orderNote || rawOrder.note || '',
        createdAt: rawOrder.createdAt || new Date().toISOString(),
        // stamp the moment this order arrives so the countdown starts from now
        receivedAt: isNew ? new Date().toISOString() : undefined,
      }

      setOrders((prev) => {
        const existingIdx = prev.findIndex((o) => (o._id || o.id) === (normalizedOrder._id || normalizedOrder.id))
        if (existingIdx >= 0) {
          const next = [...prev]
          // preserve receivedAt from the existing entry if this is just a status update
          next[existingIdx] = { ...next[existingIdx], ...normalizedOrder, receivedAt: next[existingIdx].receivedAt || normalizedOrder.receivedAt }
          return next
        }
        return [normalizedOrder, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      })
    }

    function handleOrderUnassigned({ orderId }) {
      if (!orderId) return
      setOrders((prev) => prev.filter((o) => (o._id || o.id) !== orderId))
    }

    function handleSocketError(err) {
      const msg = typeof err === 'object' ? err.message || JSON.stringify(err) : String(err)
      toast(msg, 'error')
      setError(msg)
    }

    socket.on('sendOrder', (data) => handleNewOrder(data, true))
    socket.on('orderCreated', (data) => handleNewOrder(data, true))
    socket.on('updateOrderStatus', (data) => handleNewOrder(data, false))
    socket.on('orderUnassigned', handleOrderUnassigned)
    socket.on('error', handleSocketError)
    if (onSendOrder) onSendOrder((data) => handleNewOrder(data, true))
    if (onOrderCreated) onOrderCreated((data) => handleNewOrder(data, true))

    return () => {
      socket.off('sendOrder')
      socket.off('orderCreated')
      socket.off('updateOrderStatus')
      socket.off('orderUnassigned', handleOrderUnassigned)
      socket.off('error', handleSocketError)
      if (offSendOrder) offSendOrder()
      if (offOrderCreated) offOrderCreated()
    }
  }, [])

  function handleAction(orderId, action, extra = {}) {
    console.log('Trader action:', action, 'on order:', orderId, extra)
    // 🔌 Wire your API here e.g.:
    // await axios.patch(`/api/v1/order/${orderId}/status`, { status: action, ...extra }, { withCredentials: true })
    setOrders((prev) => prev.map((o) => {
      if ((o._id || o.id) === orderId) {
        const nextStatus = action === 'accept' ? 'accepted' : 'rejected'
        const nextOrder = { ...o, status: nextStatus }
        socket.emit('updateOrderStatus', { orderId, status: nextStatus })
        return nextOrder
      }
      return o
    }))
  }

  const stats = {
    total: orders.length,
    pending: orders?.filter((o) => o.status === 'pending').length,
    accepted: orders?.filter((o) => o.status === 'accepted').length,
    rejected: orders?.filter((o) => o.status === 'rejected').length,
    shipped: orders?.filter((o) => o.status === 'shipped').length,
  }

  const filtered = orders?.filter((o) => {
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
            <p className="orders-kicker">Trader Dashboard</p>
            <h1>الطلبات الواردة</h1>
            <p>اقبل أو ارفض أو قبل جزئياً طلبات عملائك</p>
          </div>
        </div>

        <NotificationsPanel title="إشعارات التاجر" />

        {/* Stats */}
        <div className="orders-stats-strip">
          <div className="orders-stat-card">
            <span className="orders-stat-value">{stats.total}</span>
            <span className="orders-stat-label">إجمالي الطلبات</span>
          </div>
          <div className="orders-stat-card is-amber">
            <span className="orders-stat-value">{stats.pending}</span>
            <span className="orders-stat-label">قيد الانتظار</span>
          </div>
          <div className="orders-stat-card is-green">
            <span className="orders-stat-value">{stats.accepted}</span>
            <span className="orders-stat-label">مقبولة</span>
          </div>
          <div className="orders-stat-card is-red">
            <span className="orders-stat-value">{stats.rejected}</span>
            <span className="orders-stat-label">مرفوضة</span>
          </div>
        </div>

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
            <option value="shipped">تم الشحن</option>
            <option value="delivered">مُسلَّم</option>
            <option value="cancelled">ملغي</option>
          </select>

          {/* New API Filters */}
          <select
            className="orders-filter-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="createdAt">تاريخ الطلب</option>
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

        {error && (
          <div className="orders-empty" style={{ minHeight: 'auto', marginBottom: 16 }}>
            <h2>{error}</h2>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="orders-skeleton-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="orders-skeleton-card">
                <div className="s-line s-lg shimmer" style={{ height: 18 }} />
                <div className="s-line s-sm shimmer" />
                <div className="s-line shimmer" style={{ width: '80%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="orders-empty">
            <span className="orders-empty-icon">📋</span>
            <h2>لا توجد طلبات</h2>
            <p>لا توجد طلبات تطابق هذا الفلتر حالياً.</p>
          </div>
        )}

        {/* List */}
        {!loading && filtered.length > 0 && (
          <div className="orders-list">
            {filtered.map((o) => (
              <TraderOrderCard
                key={o._id || o.id}
                order={o}
                onAction={handleAction}
              />
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

// ── Sample data ───────────────────────────────────────────────
const SAMPLE_TRADER_ORDERS = [
  {
    _id: 'ORD-2001',
    status: 'pending',
    createdAt: '2025-03-01T10:00:00Z',
    customerName: 'أحمد علي',
    customerPhone: '01012345678',
    address: 'شارع التحرير، القاهرة',
    finalTotal: 1250,
    paymentMethod: 'cash',
    orderNote: 'يرجى التوصيل قبل الساعة 6 مساءً',
    items: [
      { productId: 'p1', product: { name: 'لابتوب HP 15' }, quantity: 1, lineTotal: 1100 },
      { productId: 'p2', product: { name: 'ماوس لاسلكي' }, quantity: 3, lineTotal: 150 },
    ],
  },
  {
    _id: 'ORD-2002',
    status: 'pending',
    createdAt: '2025-03-02T14:00:00Z',
    customerName: 'سارة محمد',
    customerPhone: '01198765432',
    address: 'المعادي، القاهرة',
    finalTotal: 430,
    paymentMethod: 'transfer',
    items: [
      { productId: 'p3', product: { name: 'سماعة Sony WH-1000' }, quantity: 1, lineTotal: 430 },
    ],
  },
  {
    _id: 'ORD-2003',
    status: 'accepted',
    createdAt: '2025-02-28T09:00:00Z',
    customerName: 'محمود حسن',
    customerPhone: '01555666777',
    address: 'مدينة نصر، القاهرة',
    finalTotal: 680,
    paymentMethod: 'cash',
    items: [
      { productId: 'p4', product: { name: 'كيبورد ميكانيكي' }, quantity: 2, lineTotal: 340 },
      { productId: 'p5', product: { name: 'باد ماوس XL' }, quantity: 2, lineTotal: 340 },
    ],
  },
]
