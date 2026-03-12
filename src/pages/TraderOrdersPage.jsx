import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import NotificationsPanel from '../components/notifications/NotificationsPanel'
import './orders.css'

// ── Status config ─────────────────────────────────────────────
const STATUS_MAP = {
  pending:    { label: 'قيد الانتظار',   cls: 'status-pending',    icon: '⏳' },
  accepted:   { label: 'مقبول',          cls: 'status-accepted',   icon: '✅' },
  rejected:   { label: 'مرفوض',          cls: 'status-rejected',   icon: '❌' },
  partial:    { label: 'مقبول جزئياً',   cls: 'status-partial',    icon: '⚠️' },
}
function statusMeta(s) { return STATUS_MAP[s] || { label: s, cls: 'status-pending', icon: '•' } }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Partial Reject Modal ──────────────────────────────────────
function PartialRejectModal({ order, onClose, onConfirm }) {
  const [items, setItems] = useState(
    (order.items || []).map((it) => ({ ...it, accepted: true, acceptedQty: it.quantity }))
  )
  const [reason, setReason] = useState('')

  function toggle(i) {
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, accepted: !it.accepted } : it))
  }

  function changeQty(i, val) {
    setItems((prev) => prev.map((it, idx) =>
      idx === i ? { ...it, acceptedQty: Math.max(1, Math.min(it.quantity, Number(val))) } : it
    ))
  }

  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl">
        <div className="orders-modal-head">
          <div>
            <h3>⚠️ قبول جزئي للطلب</h3>
            <p>حدّد المنتجات والكميات التي يمكن توفيرها.</p>
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Items checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: it.accepted ? 'var(--g50, #f0fdf4)' : '#fff1f2',
              border: `1.5px solid ${it.accepted ? 'rgba(22,163,74,.15)' : 'rgba(220,38,38,.15)'}`,
              borderRadius: 12,
            }}>
              <input
                type="checkbox"
                checked={it.accepted}
                onChange={() => toggle(i)}
                style={{ width: 16, height: 16, accentColor: '#16a34a', flexShrink: 0 }}
              />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                {it.product?.name || it.productId || `منتج ${i + 1}`}
              </span>
              {it.accepted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>الكمية:</span>
                  <input
                    type="number"
                    min={1}
                    max={it.quantity}
                    value={it.acceptedQty}
                    onChange={(e) => changeQty(i, e.target.value)}
                    style={{
                      width: 56, minHeight: 32, border: '1.5px solid rgba(22,163,74,.20)',
                      borderRadius: 8, padding: '0 8px', fontFamily: 'Cairo, sans-serif',
                      fontSize: 13, fontWeight: 800, outline: 'none',
                      color: 'var(--g700, #15803d)',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>/ {it.quantity}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reason */}
        <label className="orders-modal-label">
          <span>سبب الرفض الجزئي (اختياري)</span>
          <textarea
            className="orders-modal-textarea"
            placeholder="مثال: المنتج غير متوفر حالياً بالكمية المطلوبة…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>

        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button
            className="ord-btn ord-btn-partial"
            onClick={() => onConfirm({ items, reason })}
          >
            تأكيد القبول الجزئي
          </button>
        </div>
      </div>
    </div>
  )
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

// ── Trader order card ─────────────────────────────────────────
function TraderOrderCard({ order, onAction }) {
  const [showReject, setShowReject]   = useState(false)
  const [showPartial, setShowPartial] = useState(false)
  const sm = statusMeta(order.status)
  const isActable = order.status === 'pending' || order.status === 'forwarded'

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
            <span className="order-info-label">اسم العميل</span>
            <span className="order-info-value">{order.customerName || '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">رقم الهاتف</span>
            <span className="order-info-value">{order.customerPhone || '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">عدد الأصناف</span>
            <span className="order-info-value">{order.items?.length ?? '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">الإجمالي</span>
            <span className="order-info-value is-green">
              {order.finalTotal?.toFixed(2) ?? '—'} ج.م
            </span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">العنوان</span>
            <span className="order-info-value">{order.address || '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">الدفع</span>
            <span className="order-info-value">
              {order.paymentMethod === 'cash' ? 'عند الاستلام' : (order.paymentMethod || '—')}
            </span>
          </div>
        </div>

        {order.orderNote && (
          <div className="order-note">
            <span className="order-note-icon">📝</span>
            <span>{order.orderNote}</span>
          </div>
        )}

        {order.items?.length > 0 && (
          <div className="order-products-list">
            <p className="order-products-list-title">المنتجات</p>
            {order.items.map((it, i) => (
              <div key={i} className="order-product-row">
                <span className="order-product-name">
                  {it.product?.name || it.productId || `منتج ${i + 1}`}
                </span>
                <span className="order-product-qty">× {it.quantity}</span>
                <span className="order-product-price">{it.lineTotal?.toFixed(2) ?? '—'} ج.م</span>
              </div>
            ))}
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
                className="ord-btn ord-btn-partial"
                onClick={() => setShowPartial(true)}
              >
                ⚠️ قبول جزئي
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

      {showPartial && (
        <PartialRejectModal
          order={order}
          onClose={() => setShowPartial(false)}
          onConfirm={(data) => {
            onAction(order._id || order.id, 'partial', data)
            setShowPartial(false)
          }}
        />
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function TraderOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    // 🔌 Replace with: axios.get('/api/v1/order/trader', { withCredentials: true })
    setTimeout(() => {
      setOrders(SAMPLE_TRADER_ORDERS)
      setLoading(false)
    }, 600)
  }, [])

  function handleAction(orderId, action, extra = {}) {
    console.log('Trader action:', action, 'on order:', orderId, extra)
    // 🔌 Wire your API here e.g.:
    // await axios.patch(`/api/v1/order/${orderId}/status`, { status: action, ...extra }, { withCredentials: true })
    setOrders((prev) => prev.map((o) =>
      (o._id || o.id) === orderId ? { ...o, status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'partial' } : o
    ))
  }

  const stats = {
    total:    orders.length,
    pending:  orders.filter((o) => o.status === 'pending').length,
    accepted: orders.filter((o) => o.status === 'accepted').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
  }

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      String(o._id || o.id).includes(search) ||
      (o.customerName || '').includes(search)
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
        <div className="orders-filters">
          <input
            className="orders-search"
            placeholder="ابحث باسم العميل أو رقم الطلب…"
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
          </select>
        </div>

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
