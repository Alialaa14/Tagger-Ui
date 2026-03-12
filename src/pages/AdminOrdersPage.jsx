import React, { useEffect, useState } from 'react'
import { deleteOrderById, fetchAdminOrders, forwardOrderToTrader, updateOrderById, updateOrderStatus } from '../controllers/admin/ordersController'
import { fetchTraderUsers } from '../controllers/admin/tradersController'
import socket from '../socket'
import './orders.css'

// ── Status config ─────────────────────────────────────────────
const STATUS_MAP = {
  pending:    { label: 'قيد الانتظار',   cls: 'status-pending',    icon: '⏳' },
  accepted:   { label: 'مقبول',          cls: 'status-accepted',   icon: '✅' },
  rejected:   { label: 'مرفوض',          cls: 'status-rejected',   icon: '❌' },
  partial:    { label: 'مقبول جزئياً',   cls: 'status-partial',    icon: '⚠️' },
  forwarded:  { label: 'محوّل لتاجر',    cls: 'status-forwarded',  icon: '📦' },
  processing: { label: 'جار التنفيذ',    cls: 'status-processing', icon: '🔄' },
  delivered:  { label: 'تم التسليم',     cls: 'status-delivered',  icon: '🎉' },
}
function statusMeta(s) { return STATUS_MAP[s] || { label: s, cls: 'status-pending', icon: '•' } }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

function deriveStatus(order) {
  if (order?.isDelivered) return 'delivered'
  if (order?.isAccepted) return 'accepted'
  if (order?.isRejected || order?.isCancelled || order?.isReturned) return 'rejected'
  return order?.status || 'pending'
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') return order
  const items = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.products)
      ? order.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          lineTotal: p.totalPrice,
        }))
      : []
  const shop = order.shopId || order.shop || {}
  return {
    ...order,
    status: deriveStatus(order),
    items,
    finalTotal: order.finalTotal ?? order.totalPrice,
    customerName: order.customerName || shop.username || shop.shopName,
    customerPhone: order.customerPhone || shop.phoneNumber,
    address: order.address || shop.address,
  }
}

// ── Order Details Modal ───────────────────────────────────────
function OrderDetailsModal({ order, onClose }) {
  const sm = statusMeta(order.status)
  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl">
        <div className="orders-modal-head">
          <div>
            <h3>📋 تفاصيل الطلب #{order._id || order.id}</h3>
            <p>جميع بيانات الطلب والعميل</p>
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="order-detail-grid">
          <div className="order-detail-item">
            <span>رقم الطلب</span><strong>#{order._id || order.id}</strong>
          </div>
          <div className="order-detail-item">
            <span>الحالة</span>
            <strong style={{ color: order.status === 'accepted' ? 'var(--g600)' : order.status === 'rejected' ? '#dc2626' : '#0f172a' }}>
              {sm.icon} {sm.label}
            </strong>
          </div>
          <div className="order-detail-item">
            <span>اسم العميل</span><strong>{order.customerName || '—'}</strong>
          </div>
          <div className="order-detail-item">
            <span>رقم الهاتف</span><strong>{order.customerPhone || '—'}</strong>
          </div>
          <div className="order-detail-item">
            <span>العنوان</span><strong>{order.address || '—'}</strong>
          </div>
          <div className="order-detail-item">
            <span>المدينة</span><strong>{order.city || '—'}</strong>
          </div>
          <div className="order-detail-item">
            <span>الإجمالي</span>
            <strong style={{ color: 'var(--g600, #16a34a)' }}>
              {order.finalTotal?.toFixed(2) ?? '—'} ج.م
            </strong>
          </div>
          <div className="order-detail-item">
            <span>طريقة الدفع</span>
            <strong>{order.paymentMethod === 'cash' ? 'عند الاستلام' : (order.paymentMethod || '—')}</strong>
          </div>
          <div className="order-detail-item">
            <span>التاجر المحوّل إليه</span><strong>{order.assignedTrader || '—'}</strong>
          </div>
          <div className="order-detail-item">
            <span>تاريخ الطلب</span><strong>{fmtDate(order.createdAt)}</strong>
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
            <p className="order-products-list-title">المنتجات ({order.items.length})</p>
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

        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  )
}

// ── Forward to Trader Modal ───────────────────────────────────
function ForwardModal({ order, traders, onClose, onConfirm }) {
  const [traderId, setTraderId] = useState('')
  const [note, setNote] = useState('')

  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl">
        <div className="orders-modal-head">
          <div>
            <h3>📦 إحالة لتاجر</h3>
            <p>اختر التاجر المسؤول عن تنفيذ الطلب #{order._id || order.id}</p>
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>

        <label className="orders-modal-label">
          <span>اختر التاجر</span>
          <select
            className="orders-modal-select"
            value={traderId}
            onChange={(e) => setTraderId(e.target.value)}
          >
            <option value="">— اختر تاجراً —</option>
            {traders.map((t) => (
              <option key={t._id || t.id} value={t._id || t.id}>
                {t.username || t.shopName || t._id}
              </option>
            ))}
          </select>
        </label>

        <label className="orders-modal-label">
          <span>ملاحظة للتاجر (اختياري)</span>
          <textarea
            className="orders-modal-textarea"
            placeholder="أي توجيهات إضافية…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button
            className="ord-btn ord-btn-forward"
            disabled={!traderId}
            onClick={() => { onConfirm({ traderId, note }); onClose() }}
          >
            إحالة الطلب
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Order Modal ──────────────────────────────────────────
function EditOrderModal({ order, onClose, onConfirm }) {
  const [form, setForm] = useState({
    status: order.status || 'pending',
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    address: order.address || '',
    city: order.city || '',
    orderNote: order.orderNote || '',
  })

  function change(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl">
        <div className="orders-modal-head">
          <div>
            <h3>✏️ تعديل الطلب #{order._id || order.id}</h3>
            <p>عدّل بيانات الطلب أو حالته</p>
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="orders-modal-label">
            <span>الحالة</span>
            <select className="orders-modal-select" value={form.status} onChange={change('status')}>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </label>
          <label className="orders-modal-label">
            <span>اسم العميل</span>
            <input className="orders-modal-input" value={form.customerName} onChange={change('customerName')} />
          </label>
          <label className="orders-modal-label">
            <span>رقم الهاتف</span>
            <input className="orders-modal-input" value={form.customerPhone} onChange={change('customerPhone')} dir="ltr" />
          </label>
          <label className="orders-modal-label">
            <span>المدينة</span>
            <input className="orders-modal-input" value={form.city} onChange={change('city')} />
          </label>
          <label className="orders-modal-label" style={{ gridColumn: '1 / -1' }}>
            <span>العنوان</span>
            <input className="orders-modal-input" value={form.address} onChange={change('address')} />
          </label>
          <label className="orders-modal-label" style={{ gridColumn: '1 / -1' }}>
            <span>ملاحظة الطلب</span>
            <textarea className="orders-modal-textarea" value={form.orderNote} onChange={change('orderNote')} />
          </label>
        </div>

        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button className="ord-btn ord-btn-accept" onClick={() => { onConfirm(form); onClose() }}>
            حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteModal({ order, onClose, onConfirm }) {
  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl" style={{ maxWidth: 400 }}>
        <div className="orders-modal-head">
          <div>
            <h3>🗑️ حذف الطلب</h3>
            <p>هل أنت متأكد من حذف الطلب <strong>#{order._id || order.id}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.</p>
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button className="ord-btn ord-btn-delete" onClick={() => { onConfirm(); onClose() }}>
            تأكيد الحذف
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
          <div><h3>❌ رفض الطلب</h3><p>أدخل سبب الرفض.</p></div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>
        <label className="orders-modal-label">
          <span>سبب الرفض</span>
          <textarea className="orders-modal-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثال: المنتج غير متاح…" />
        </label>
        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button className="ord-btn ord-btn-reject" onClick={() => onConfirm(reason)}>تأكيد الرفض</button>
        </div>
      </div>
    </div>
  )
}

// ── Admin order card ──────────────────────────────────────────
function AdminOrderCard({ order, traders, onAction, onDelete }) {
  const [modal, setModal] = useState(null) // 'details' | 'forward' | 'edit' | 'delete' | 'reject'
  const sm = statusMeta(order.status)

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
            <span className="order-info-label">العميل</span>
            <span className="order-info-value">{order.customerName || '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">الهاتف</span>
            <span className="order-info-value">{order.customerPhone || '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">الأصناف</span>
            <span className="order-info-value">{order.items?.length ?? '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">الإجمالي</span>
            <span className="order-info-value is-green">{order.finalTotal?.toFixed(2) ?? '—'} ج.م</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">المدينة</span>
            <span className="order-info-value">{order.city || '—'}</span>
          </div>
          {order.assignedTrader && (
            <div className="order-info-item">
              <span className="order-info-label">التاجر</span>
              <span className="order-info-value">{order.assignedTrader}</span>
            </div>
          )}
        </div>

        {order.orderNote && (
          <div className="order-note">
            <span className="order-note-icon">📝</span>
            <span>{order.orderNote}</span>
          </div>
        )}

        {/* ── Admin Actions ── */}
        <div className="order-card-actions">
          <button className="ord-btn ord-btn-accept"  onClick={() => onAction(order._id || order.id, 'accept')}>
            ✅ قبول
          </button>
          <button className="ord-btn ord-btn-reject"  onClick={() => setModal('reject')}>
            ❌ رفض
          </button>
          <button className="ord-btn ord-btn-forward" onClick={() => setModal('forward')}>
            📦 إحالة لتاجر
          </button>
          <button className="ord-btn ord-btn-edit"    onClick={() => setModal('edit')}>
            ✏️ تعديل
          </button>
          <button className="ord-btn ord-btn-details" onClick={() => setModal('details')}>
            🔍 التفاصيل
          </button>
          <button className="ord-btn ord-btn-delete"  onClick={() => setModal('delete')}>
            🗑️ حذف
          </button>
        </div>
      </article>

      {/* Modals */}
      {modal === 'details' && (
        <OrderDetailsModal order={order} onClose={() => setModal(null)} />
      )}
      {modal === 'forward' && (
        <ForwardModal
          order={order}
          traders={traders}
          onClose={() => setModal(null)}
          onConfirm={(data) => onAction(order._id || order.id, 'forward', data)}
        />
      )}
      {modal === 'edit' && (
        <EditOrderModal
          order={order}
          onClose={() => setModal(null)}
          onConfirm={(data) => onAction(order._id || order.id, 'edit', data)}
        />
      )}
      {modal === 'delete' && (
        <DeleteModal
          order={order}
          onClose={() => setModal(null)}
          onConfirm={() => onDelete(order._id || order.id)}
        />
      )}
      {modal === 'reject' && (
        <RejectModal
          onClose={() => setModal(null)}
          onConfirm={(reason) => {
            onAction(order._id || order.id, 'reject', { reason })
            setModal(null)
          }}
        />
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState([])
  const [traders, setTraders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([fetchAdminOrders(), fetchTraderUsers()])
      .then(([ordersRes, tradersRes]) => {
        if (!active) return
        const normalized = Array.isArray(ordersRes) ? ordersRes.map(normalizeOrder) : []
        setOrders(normalized)
        setTraders(Array.isArray(tradersRes) ? tradersRes : [])
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch orders.')
        setOrders([])
        setTraders([])
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    function handleNewOrder(payload) {
      console.log(payload)
      const normalized = normalizeOrder(payload)
      setOrders((prev) => [normalized, ...(prev || [])])
    }

    socket.on('newOrder', handleNewOrder)
    return () => {
      socket.off('newOrder', handleNewOrder)
    }
  }, [])

  async function handleAction(orderId, action, extra = {}) {
    try {
      if (action === 'accept') {
        const updated = await updateOrderStatus(orderId, 'accepted', extra)
        setOrders((prev) => prev.map((o) => (o._id || o.id) === orderId ? { ...o, ...(updated || { status: 'accepted' }) } : o))
      } else if (action === 'reject') {
        const updated = await updateOrderStatus(orderId, 'rejected', extra)
        setOrders((prev) => prev.map((o) => (o._id || o.id) === orderId ? { ...o, ...(updated || { status: 'rejected' }) } : o))
      } else if (action === 'forward') {
        const trader = traders.find((t) => (t._id || t.id) === extra.traderId)
        const updated = await forwardOrderToTrader(orderId, extra)
        setOrders((prev) => prev.map((o) =>
          (o._id || o.id) === orderId
            ? { ...o, ...(updated || { status: 'forwarded', assignedTrader: trader?.username || extra.traderId }) }
            : o
        ))
      } else if (action === 'edit') {
        const updated = await updateOrderById(orderId, extra)
        setOrders((prev) => prev.map((o) => (o._id || o.id) === orderId ? { ...o, ...(updated || extra) } : o))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update order.')
    }
  }

  async function handleDelete(orderId) {
    try {
      await deleteOrderById(orderId)
      setOrders((prev) => prev.filter((o) => (o._id || o.id) !== orderId))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete order.')
    }
  }

  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === 'pending').length,
    accepted:  orders.filter((o) => o.status === 'accepted').length,
    rejected:  orders.filter((o) => o.status === 'rejected').length,
    forwarded: orders.filter((o) => o.status === 'forwarded').length,
  }

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      String(o._id || o.id).includes(search) ||
      (o.customerName || '').includes(search) ||
      (o.customerPhone || '').includes(search)
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  return (
    <section className="orders-page-wrap container" dir="rtl">
        {/* Header */}
        <div className="orders-page-head">
          <div>
            <p className="orders-kicker">Admin Dashboard</p>
            <h1>إدارة الطلبات</h1>
            <p>راجع وأدر جميع طلبات المتجر من مكان واحد</p>
          </div>
        </div>
        {error && (
          <div className="orders-empty" style={{ minHeight: 'auto', marginBottom: 16 }}>
            <h2>{error}</h2>
          </div>
        )}

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
          <div className="orders-stat-card" style={{ '--stat-color': '#1d4ed8' }}>
            <span className="orders-stat-value" style={{ color: '#1d4ed8' }}>{stats.forwarded}</span>
            <span className="orders-stat-label">محوّلة</span>
          </div>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <input
            className="orders-search"
            placeholder="ابحث باسم العميل، الهاتف، أو رقم الطلب…"
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
            <option value="forwarded">محوّل</option>
            <option value="partial">جزئي</option>
            <option value="delivered">مسلّم</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="orders-skeleton-list">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="orders-skeleton-card">
                <div className="s-line s-lg shimmer" style={{ height: 18 }} />
                <div className="s-line s-sm shimmer" />
                <div className="s-line shimmer" style={{ width: '85%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="orders-empty">
            <span className="orders-empty-icon">📭</span>
            <h2>لا توجد طلبات</h2>
            <p>لا توجد طلبات تطابق هذا الفلتر.</p>
          </div>
        )}

        {/* List */}
        {!loading && filtered.length > 0 && (
          <div className="orders-list">
            {filtered.map((o) => (
              <AdminOrderCard
                key={o._id || o.id}
                order={o}
                traders={traders}
                onAction={handleAction}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
  )
}

