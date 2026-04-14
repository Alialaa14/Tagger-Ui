import React, { useEffect, useState } from 'react'
import { deleteOrderById, fetchAdminOrders, updateOrderById, updateOrderStatus } from '../controllers/admin/ordersController'
import { fetchTraderUsers } from '../controllers/admin/tradersController'
import socket, { onSendOrder, offSendOrder, onOrderCreated, offOrderCreated } from '../socket'
import toast from '../utils/toast'
import BackNavigator from '../components/common/BackNavigator'
import notificationSound from '../assets/tritone.mp3'
import useCountdown from '../hooks/useCountdown'
import './orders.css'

// -- Status config ---------------------------------------------
const STATUS_MAP = {
  pending: { label: 'قيد المراجعة', cls: 'status-pending', icon: '🕐' },
  accepted: { label: 'مقبول', cls: 'status-accepted', icon: '✅' },
  rejected: { label: 'مرفوض', cls: 'status-rejected', icon: '❌' },
  shipped: { label: 'تم الشحن', cls: 'status-forwarded', icon: '📦' },
  delivered: { label: 'تم التسليم', cls: 'status-delivered', icon: '🚚' },
  cancelled: { label: 'ملغي', cls: 'status-rejected', icon: '🚫' },
}

const INVALID_TRANSITIONS = {
  accepted: ["rejected", "cancelled"], // Usually pending -> accepted is fine, backend snippet noted.
  rejected: ["accepted", "shipped", "delivered"],
  shipped: ["pending", "rejected", "cancelled"],
  delivered: ["pending", "rejected", "cancelled", "shipped"],
  cancelled: ["shipped", "delivered"],
};

function canTransition(from, to) {
  return !INVALID_TRANSITIONS[to]?.includes(from);
}
function statusMeta(s) { return STATUS_MAP[s] || { label: s, cls: 'status-pending', icon: '❓' } }
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

function deriveStatus(order) {
  return order?.status || 'pending'
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') return order
  const products = Array.isArray(order.products)
    ? order.products
    : Array.isArray(order.items)
      ? order.items.map((i) => ({
        productId: i.productId || i.product,
        quantity: i.quantity,
        totalPrice: i.lineTotal,
      }))
      : []
  const shop = order.shopId || order.shop || {}

  // Resolve populated trader from any common field name the backend may use
  const rawTrader = order.traderId || order.trader || order.assignedTo || order.traderDetails || null;
  const traderObj = rawTrader && typeof rawTrader === 'object' ? rawTrader : null;
  const traderInfo = traderObj ? {
    name: traderObj.username || traderObj.name || traderObj.fullName || traderObj.shopName || '',
    phone: traderObj.phoneNumber || traderObj.phone || traderObj.mobile || ''
  } : null;

  return {
    ...order,
    status: deriveStatus(order),
    products,
    totalPrice: order.totalPrice ?? order.finalTotal ?? 0,
    totalQuantity: order.totalQuantity ?? 0,
    note: order.note || order.orderNote || '',
    customerName: order.customerName || order.username || shop.username || shop.shopName,
    customerPhone: order.customerPhone || order.phoneNumber || shop.phoneNumber,
    address: order.address || order.shippingAddress || shop.address,
    city: order.city || shop.city,
    traderInfo,
    assignedTrader: traderInfo ? `${traderInfo.name}${traderInfo.phone ? ` - ${traderInfo.phone}` : ''}` : (order.assignedTrader || ''),
    createdAt: order.createdAt || new Date().toISOString(),
  }
}

// -- Order Details Modal ---------------------------------------
function OrderDetailsModal({ order, onClose }) {
  const sm = statusMeta(order.status)
  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl">
        <div className="orders-modal-head">
          <div>
            <h3>🧾 تفاصيل الطلب #{order._id || order.id}</h3>
            <p>عرض تفاصيل الطلب كاملة بالتفصيل</p>
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
              {order.totalPrice?.toFixed(2) ?? '—'} ج.م
            </strong>
          </div>
          <div className="order-detail-item">
            <span>طريقة الدفع</span>
            <strong>{order.paymentMethod === 'cash' ? 'نقداً عند الاستلام' : (order.paymentMethod || '—')}</strong>
          </div>
          <div className="order-detail-item">
            <span>المندوب المسؤول عنه</span><strong>{order.assignedTrader || '—'}</strong>
          </div>
          <div className="order-detail-item">
            <span>تاريخ الطلب</span><strong>{fmtDate(order.createdAt)}</strong>
          </div>
        </div>

        {order.note && (
          <div className="order-note">
            <span className="order-note-icon">📝</span>
            <span>{order.note}</span>
          </div>
        )}

        {order.products?.length > 0 && (
          <div className="order-products-list">
            <p className="order-products-list-title">المنتجات ({order.products.length})</p>
            {order.products.map((it, i) => (
              <div key={it._id || i} className="order-product-row">
                <span className="order-product-name">
                  {it.productId?.name || `منتج ${i + 1}`}
                </span>
                <span className="order-product-qty">× {it.quantity}</span>
                <span className="order-product-price">{it.totalPrice?.toFixed(2) ?? '—'} ج.م</span>
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

// -- Forward to Trader Modal -----------------------------------
function ForwardModal({ order, traders, onClose, onConfirm }) {
  const [traderId, setTraderId] = useState('')
  const [note, setNote] = useState('')
  const [autoAssign, setAutoAssign] = useState(false)

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
            onChange={(e) => {
              setTraderId(e.target.value)
              if (e.target.value) setAutoAssign(false)
            }}
            disabled={autoAssign}
          >
            <option value="">— اختر تاجراً —</option>
            {traders.map((t) => (
              <option key={t._id || t.id} value={t._id || t.id}>
                {t.username || t.name || t.shopName || t._id}{t.phoneNumber ? ` - ${t.phoneNumber}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="orders-modal-label" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={autoAssign}
            onChange={(e) => {
              setAutoAssign(e.target.checked)
              if (e.target.checked) setTraderId('')
            }}
          />
          <span>تعيين تلقائي (اختيار أفضل تاجر متاح)</span>
        </label>

        <label className="orders-modal-label">
          <span>ملاحظات للتاجر (اختياري)</span>
          <textarea
            className="orders-modal-textarea"
            placeholder="أي تعليمات خاصة…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button
            className="ord-btn ord-btn-forward"
            disabled={!traderId && !autoAssign}
            onClick={() => { onConfirm({ traderId, note, autoAssign }); onClose() }}
          >
            {autoAssign ? 'تعيين تلقائي' : 'إحالة لتاجر'}
          </button>
        </div>
      </div>
    </div>
  )
}

// -- Edit Order Modal ------------------------------------------
function EditOrderModal({ order, onClose, onConfirm }) {
  const [form, setForm] = useState({
    status: order.status || 'pending',
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    address: order.address || '',
    city: order.city || '',
    orderNote: order.note || '',
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
            <p>يمكنك تعديل بيانات هذا الطلب من هنا</p>
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
            <span>ملاحظات الطلب</span>
            <textarea className="orders-modal-textarea" value={form.orderNote} onChange={change('orderNote')} />
          </label>
        </div>

        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button className="ord-btn ord-btn-accept" onClick={() => { onConfirm(form); onClose() }}>
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  )
}

// -- Delete Confirm Modal --------------------------------------
function DeleteModal({ order, onClose, onConfirm }) {
  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl" style={{ maxWidth: 400 }}>
        <div className="orders-modal-head">
          <div>
            <h3>تأكيد حذف الطلب</h3>
            <p>هل أنت متأكد من حذف هذا الطلب <strong>#{order._id || order.id}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.</p>
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="orders-modal-actions">
          <button className="ord-btn ord-btn-details" onClick={onClose}>إلغاء</button>
          <button className="ord-btn ord-btn-delete" onClick={() => { onConfirm(); onClose() }}>
            حذف نهائي
          </button>
        </div>
      </div>
    </div>
  )
}

// -- Reject Reason Modal ---------------------------------------
function RejectModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  return (
    <div className="orders-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal" dir="rtl">
        <div className="orders-modal-head">
          <div><h3>❌ رفض الطلب</h3><p>يرجى ذكر سبب الرفض.</p></div>
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

// -- Order countdown timer -------------------------------------
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

// -- Admin order card ------------------------------------------
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
            <span className="order-info-label">المنتجات</span>
            <span className="order-info-value">{order.products?.length ?? '—'}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">إجمالي العميل</span>
            <span className="order-info-value is-green">{order.totalPrice?.toFixed(2) ?? '—'} ج.م</span>
          </div>
          {order.totalTraderPrice != null && (
            <div className="order-info-item">
              <span className="order-info-label">إجمالي التاجر</span>
              <span className="order-info-value" style={{ color: '#f59e0b', fontWeight: 700 }}>{Number(order.totalTraderPrice).toFixed(2)} ج.م</span>
            </div>
          )}
          <div className="order-info-item">
            <span className="order-info-label">المدينة</span>
            <span className="order-info-value">{order.city || '—'}</span>
          </div>
        </div>

        {order.products?.length > 0 && (
          <div className="order-products-list">
            <p className="order-products-list-title">المنتجات</p>
            {order.products.map((it, i) => {
              const prodObj = typeof it.productId === 'object' && it.productId ? it.productId : null
              const productName = prodObj?.name || `منتج ${i + 1}`
              const productImage = prodObj?.image?.url || prodObj?.image || null
              const traderProd = it.traderProduct
              const traderProdName = typeof traderProd === 'object' ? traderProd?.name : null
              const traderProdPrice = typeof traderProd === 'object' ? traderProd?.price : null
              return (
                <div key={it._id || i} className="order-product-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', flexWrap: 'wrap' }}>
                  {productImage ? (
                    <img src={productImage} alt={productName} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>📦</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="order-product-name">{productName}</span>
                    {traderProdName && (
                      <span style={{ display: 'block', fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>🏪 {traderProdName}{traderProdPrice != null ? ` — ${Number(traderProdPrice).toFixed(2)} ج.م` : ''}</span>
                    )}
                  </div>
                  <span className="order-product-qty">× {it.quantity}</span>
                  <span className="order-product-price">{it.totalPrice?.toFixed(2) ?? '—'} ج.م</span>
                </div>
              )
            })}
          </div>
        )}

        {order.traderInfo && order.traderInfo.name && (
          <div className="order-trader-box">
            <div className="order-trader-box-icon">🏪</div>
            <div className="order-trader-box-info">
              <span className="order-trader-box-label">التاجر المكلّف</span>
              <strong className="order-trader-box-name" dir="auto">{order.traderInfo.name}</strong>
              {order.traderInfo.phone && <span className="order-trader-box-phone" dir="ltr">{order.traderInfo.phone}</span>}
            </div>
          </div>
        )}

        {!order.status == "accepted" && <OrderCountdown createdAt={order.forwardedAt} />}

        {order.note && (
          <div className="order-note">
            <span className="order-note-icon">📝</span>
            <span>{order.note}</span>
          </div>
        )}

        {/* -- Admin Actions -- */}
        <div className="order-card-actions">
          {order.status === 'pending' && (
            <>
              <button
                className="ord-btn ord-btn-accept"
                onClick={() => onAction(order._id || order.id, 'accept')}
                disabled={!canTransition(order.status, 'accepted')}
              >
                ✅ قبول
              </button>
              <button
                className="ord-btn ord-btn-reject"
                onClick={() => setModal('reject')}
                disabled={!canTransition(order.status, 'rejected')}
              >
                ❌ رفض
              </button>
              <button className="ord-btn ord-btn-forward" onClick={() => setModal('forward')}>
                📦 إحالة لتاجر
              </button>
            </>
          )}

          {order.status === 'accepted' && (
            <button
              className="ord-btn ord-btn-forward"
              onClick={() => onAction(order._id || order.id, 'shipped')}
              disabled={!canTransition(order.status, 'shipped')}
            >
              📦 تعيين كـ "تم الشحن"
            </button>
          )}

          {order.status === 'shipped' && (
            <button
              className="ord-btn ord-btn-accept"
              style={{ background: '#10b981', color: '#fff' }}
              onClick={() => onAction(order._id || order.id, 'delivered')}
              disabled={!canTransition(order.status, 'delivered')}
            >
              🚚 تعيين كـ "تم التسليم"
            </button>
          )}

          <button className="ord-btn ord-btn-edit" onClick={() => setModal('edit')}>
            ✏️ تعديل
          </button>
          <button className="ord-btn ord-btn-details" onClick={() => setModal('details')}>
            🔍 التفاصيل
          </button>
          <button className="ord-btn ord-btn-delete" onClick={() => setModal('delete')}>
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

// -- Page ------------------------------------------------------
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [traders, setTraders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    // fetch admin orders logic with new paginated api from customer orders page equivalent
    Promise.all([
      // NOTE: Here we need to update the fetchAdminOrders method in your controllers to support passing parameters or use axios inline
      // Re-using fetchAdminOrders for this simple drop in replace we should update ordersController.js 
      // but for now I'll use the controller function and let it handle UI/Pagination on frontend if it doesn't take params
      fetchAdminOrders({ limit, page, sortBy, sortOrder }),
      fetchTraderUsers()
    ])
      .then(([ordersRes, tradersRes]) => {
        if (!active) return

        const traderList = Array.isArray(tradersRes) ? tradersRes : []

        // Build an id→trader lookup so we can inject trader objects
        // into orders that only carry a traderId string (same as socket payloads do)
        const traderMap = {}
        traderList.forEach((t) => {
          const id = t._id || t.id
          if (id) traderMap[String(id)] = t
        })

        let fetchedOrders = []
        if (ordersRes?.data || ordersRes?.orders || ordersRes?.results) {
          fetchedOrders = ordersRes.data || ordersRes.orders || ordersRes.results
          const totalItems = ordersRes.total || ordersRes.count || fetchedOrders.length
          if (totalItems > 0 && limit > 0) setTotalPages(Math.ceil(totalItems / limit))
          else if (ordersRes.totalPages) setTotalPages(ordersRes.totalPages)
        } else {
          fetchedOrders = Array.isArray(ordersRes) ? ordersRes : []
        }

        // Inject the full trader object when traderId is only a string ID
        const enriched = fetchedOrders.map((o) => {
          const rawId = typeof o.traderId === 'string'
            ? o.traderId
            : (o.traderId?._id || o.traderId?.id || null)
          if (rawId && traderMap[String(rawId)] && typeof o.traderId !== 'object') {
            return { ...o, traderId: traderMap[String(rawId)] }
          }
          return o
        })

        const normalized = enriched.map(normalizeOrder)
        setOrders(normalized)
        setTraders(traderList)
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
  }, [page, limit, sortBy, sortOrder])

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

      // Backend structured it as { order: updatedOrder } for updates/forwarding, and { order, user } for new ones
      const rawOrder = payload?.order || payload
      if (payload?.user) {
        rawOrder.shop = payload.user;
      }
      const normalized = normalizeOrder(rawOrder)
      setOrders((prev) => {
        const existingIdx = prev.findIndex((o) => (o._id || o.id) === (normalized._id || normalized.id))
        if (existingIdx >= 0) {
          const next = [...prev]
          next[existingIdx] = { ...next[existingIdx], ...normalized }
          return next
        }
        return [normalized, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      })
    }

    function handleOrderUnassigned({ orderId }) {
      if (!orderId) return
      console.log(orderId)
      setOrders((prev) => prev.filter((o) => (o._id || o.id) !== orderId))
    }

    function handleSocketError(err) {
      const msg = typeof err === 'object' ? err.message || JSON.stringify(err) : String(err)
      toast(msg, 'error')
      setError(msg)
    }

    socket.on('newOrder', (data) => handleNewOrder(data, true))
    socket.on('orderCreated', (data) => handleNewOrder(data, true))
    socket.on('updateOrderStatus', (data) => handleNewOrder(data, false))
    socket.on('orderUnassigned', handleOrderUnassigned)
    socket.on('error', handleSocketError)
    onSendOrder((data) => handleNewOrder(data, true))
    onOrderCreated((data) => handleNewOrder(data, true))
    return () => {
      socket.off('newOrder')
      socket.off('orderCreated')
      socket.off('updateOrderStatus')
      socket.off('orderUnassigned', handleOrderUnassigned)
      socket.off('error', handleSocketError)
      offSendOrder()
      offOrderCreated()
    }
  }, [])

  async function handleAction(orderId, action, extra = {}) {
    try {
      if (action === 'accept') {
        const updated = await updateOrderStatus(orderId, 'accepted', extra)
        setOrders((prev) => prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            const nextOrder = { ...o, ...(updated || { status: 'accepted' }) }
            socket.emit('updateOrderStatus', { orderId, status: 'accepted' })
            return nextOrder
          }
          return o
        }))
      } else if (action === 'reject') {
        const updated = await updateOrderStatus(orderId, 'rejected', extra)
        setOrders((prev) => prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            const nextOrder = { ...o, ...(updated || { status: 'rejected' }) }
            socket.emit('updateOrderStatus', { orderId, status: 'rejected' })
            return nextOrder
          }
          return o
        }))
      } else if (action === 'shipped') {
        const updated = await updateOrderStatus(orderId, 'shipped', extra)
        setOrders((prev) => prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            const nextOrder = { ...o, ...(updated || { status: 'shipped' }) }
            socket.emit('updateOrderStatus', { orderId, status: 'shipped' })
            return nextOrder
          }
          return o
        }))
      } else if (action === 'delivered') {
        const updated = await updateOrderStatus(orderId, 'delivered', extra)
        setOrders((prev) => prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            const nextOrder = { ...o, ...(updated || { status: 'delivered' }) }
            socket.emit('updateOrderStatus', { orderId, status: 'delivered' })
            return nextOrder
          }
          return o
        }))
      } else if (action === 'forward') {
        let payload = extra
        if (extra?.autoAssign) {
          payload = { ...extra, traderId: null }
        }

        // Forward order via socket if specific trader selected or auto assigned to backend
        socket.emit('forwardOrder', orderId, payload.traderId)
        // Stamp forwardedAt so the countdown timer starts from this moment
        setOrders((prev) => prev.map((o) =>
          (o._id || o.id) === orderId ? { ...o, forwardedAt: new Date().toISOString() } : o
        ))
      } else if (action === 'edit') {
        const updated = await updateOrderById(orderId, extra)
        setOrders((prev) => prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            const nextOrder = { ...o, ...(updated || extra) }
            socket.emit('updateOrderStatus', { orderId, status: nextOrder.status })
            return nextOrder
          }
          return o
        }))
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
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    accepted: orders.filter((o) => o.status === 'accepted').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
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
      <BackNavigator fallback="/admin" />
      {/* Header */}
      <div className="orders-page-head">
        <div>
          <p className="orders-kicker">Admin Dashboard</p>
          <h1>إدارة الطلبات</h1>
          <p>عرض وإدارة جميع طلبات العملاء من مكان واحد</p>
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
          <span className="orders-stat-label">قيد المراجعة</span>
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
          <span className="orders-stat-value" style={{ color: '#1d4ed8' }}>{stats.shipped}</span>
          <span className="orders-stat-label">مشحونة</span>
        </div>
      </div>

      <div className="orders-filters" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <input
          className="orders-search"
          placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="orders-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">كل الطلبات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="accepted">مقبول</option>
          <option value="rejected">مرفوض</option>
          <option value="shipped">تم الشحن</option>
          <option value="cancelled">ملغي</option>
          <option value="delivered">مُسلَّم</option>
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
          <p>لا توجد طلبات تطابق معايير البحث.</p>
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
    </section>
  )
}
