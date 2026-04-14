import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackNavigator from '../components/common/BackNavigator'
import toast from "../utils/toast"
import * as invApi from '../controllers/inventoryController'
import QrCodeCanvas from '../components/QrCodeCanvas'       // ← new
import QrViewerModal from '../components/QrViewerModal'     // ← new
import './inventory.css'

// ── Stock Movement Modal ──────────────────────────────────────
function StockMovementModal({ item, type, onClose, onSave }) {
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const title = type === 'in' ? 'إضافة مخزون (Stock In)' :
    type === 'out' ? 'سحب مخزون (Stock Out)' : 'تعديل يدوي (Adjust)'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      toast("يرجى إدخال كمية صحيحة", "error")
      return
    }
    setLoading(true)
    try {
      if (type === 'in') await invApi.stockIn(item._id, Number(quantity), note)
      else if (type === 'out') await invApi.stockOut(item._id, Number(quantity), note)
      else await invApi.adjustStock(item._id, Number(quantity), note)
      toast("تم تحديث المخزون بنجاح", "success")
      onSave()
      onClose()
    } catch (err) {
      toast(err.response?.data?.message || "فشل العملية", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tmp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="inventory-modal" dir="rtl">
        <h3 style={{ marginBottom: '10px' }}>{title}</h3>
        <p className="admin-muted" style={{ marginBottom: '20px' }}>
          {item.productId?.name || item.customProduct?.name}
        </p>
        <form onSubmit={handleSubmit} className="admin-stack">
          <div className="admin-label">
            <span>الكمية</span>
            <input type="number" className="admin-input" value={quantity}
              onChange={e => setQuantity(e.target.value)} placeholder="0" required />
          </div>
          <div className="admin-label">
            <span>ملاحظات (إختياري)</span>
            <textarea className="admin-input" rows="2" value={note}
              onChange={e => setNote(e.target.value)} placeholder="مثال: توريد جديد، تالف..." />
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button type="submit" className="admin-btn admin-btn-primary"
              disabled={loading} style={{ padding: '0 32px' }}>
              {loading ? "جاري الحفظ..." : "تأكيد العملية"}
            </button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Log Viewer Modal ──────────────────────────────────────────
function LogViewerModal({ item, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    invApi.fetchInventoryLogs(item._id)
      .then(data => setLogs(data.logs || []))
      .catch(() => toast("فشل تحميل السجل", "error"))
      .finally(() => setLoading(false))
  }, [item._id])

  return (
    <div className="tmp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="inventory-modal" style={{ maxWidth: '600px' }} dir="rtl">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>سجل الحركات</h3>
          <button className="tmp-modal-close" onClick={onClose} style={{ position: 'static' }}>✕</button>
        </div>
        <div className="admin-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? <p>جاري التحميل...</p> : logs.length > 0 ? (
            <table className="product-table">
              <thead>
                <tr>
                  <th>التاريخ</th><th>النوع</th><th>الحركة</th><th>الرصيد النهائي</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <span className={`inv-source ${log.type}`}>
                        {log.type === 'stock_in' ? 'توريد' : log.type === 'stock_out' ? 'صرف' : 'تعديل'}
                      </span>
                    </td>
                    <td style={{ color: log.quantityChanged > 0 ? 'var(--g700)' : 'var(--red-600)', fontWeight: 'bold' }}>
                      {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                    </td>
                    <td>{log.quantityAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="admin-muted">لا توجد حركات مسجلة لهذا المنتج.</p>}
        </div>
      </div>
    </div>
  )
}

// ── Custom Product Modal ──────────────────────────────────────
function CustomProductModal({ onClose, onSave, categories }) {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    quantity: '0', lowStockThreshold: '10', image: null,
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const onFile = (e) => {
    const f = e.target.files[0]
    if (f) { setForm({ ...form, image: f }); setPreview(URL.createObjectURL(f)) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.image) return toast("يرجى اختيار صورة للمنتج", "error")
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (k !== 'image') fd.append(k, v) })
      fd.append('image', form.image)
      await invApi.createCustomInventory(fd)
      toast("تم إنشاء المنتج المخصص بنجاح", "success")
      onSave(); onClose()
    } catch { toast("فشل إنشاء المنتج", "error") }
    finally { setLoading(false) }
  }

  return (
    <div className="tmp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="inventory-modal" style={{ maxWidth: '700px' }} dir="rtl">
        <h3>إضافة منتج مخصص جديد</h3>
        <p className="admin-muted">قم بتعريف صنف جديد غير موجود في كتالوج المنصة.</p>
        <form onSubmit={handleSubmit} className="admin-stack" style={{ marginTop: '20px' }}>
          <div className="admin-grid-2">
            <div className="admin-label">
              <span>اسم المنتج</span>
              <input className="admin-input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="admin-label">
              <span>الفئة</span>
              <select className="admin-input" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">اختر فئة...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-label">
            <span>الوصف</span>
            <input className="admin-input" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="admin-grid-2">
            <div className="admin-label">
              <span>سعر البيع (ج.م)</span>
              <input type="number" className="admin-input" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="admin-label">
              <span>تنبيه عند وصول المخزون لـ</span>
              <input type="number" className="admin-input" value={form.lowStockThreshold}
                onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </div>
          </div>
          <div className="admin-label">
            <span>صورة المنتج</span>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={onFile} hidden id="inv-img" />
              <label htmlFor="inv-img" className="admin-btn admin-btn-ghost" style={{ cursor: 'pointer' }}>اختر ملف</label>
              {preview && <img src={preview} alt="" style={{ width: '60px', height: '60px', borderRadius: '10px' }} />}
            </div>
          </div>
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button type="submit" className="admin-btn admin-btn-primary"
              disabled={loading} style={{ padding: '0 40px' }}>
              {loading ? "جاري الحفظ..." : "حفظ المنتج في المخزن"}
            </button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ source: '', lowStock: false })

  // Modal state
  const [movementTarget, setMovementTarget] = useState(null)
  const [logTarget, setLogTarget] = useState(null)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [qrTarget, setQrTarget] = useState(null)   // ← new: which item to show QR for

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const data = await invApi.fetchMyInventory({
        source: filters.source || "",
        lowStock: filters.lowStock || null,
      })
      setInventory(data.inventory || [])
      console.log(data.inventory)
    } catch { toast("فشل تحميل المخزون", "error") }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchInventory()
    axios.get('/api/v1/category', { withCredentials: true })
      .then(res => setCategories(res.data?.data || []))
      .catch(() => { })
  }, [filters])

  const stats = useMemo(() => ({
    totalItems: inventory.length,
    lowStockCount: inventory.filter(i => i.isLowStock).length,
    totalQty: inventory.reduce((sum, i) => sum + (i.quantity || 0), 0),
  }), [inventory])

  return (
    <div className="tmp-page" dir="rtl">
      <Navbar />

      <main className="inventory-stack container section">
        <BackNavigator fallback="/profile" />

        <header className="inventory-header">
          <div>
            <p className="tc-kicker">My Warehouse</p>
            <h1 className="tc-title">نظام إدارة المخزون</h1>
            <p className="tc-subtitle">تتبع منتجاتك، راقب مستويات المخزون، وراجع سجل الحركات بدقة.</p>
          </div>
          <div className="inventory-actions">
            <button className="admin-btn admin-btn-primary" onClick={() => setShowCustomModal(true)}>
              + إضافة منتج مخصص
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="inventory-stats">
          <div className="stat-card">
            <h4>إجمالي الأصناف</h4>
            <div className="value">{stats.totalItems}</div>
            <div className="sub">منصات ومخصص</div>
          </div>
          <div className="stat-card alert">
            <h4>تنبيهات نقص المخزون</h4>
            <div className="value">{stats.lowStockCount}</div>
            <div className="sub">أصناف تحتاج لتوريد</div>
          </div>
          <div className="stat-card">
            <h4>إجمالي القطع</h4>
            <div className="value">{stats.totalQty}</div>
            <div className="sub">رصيد المخزن الحالي</div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="admin-label" style={{ flex: 1, maxWidth: '200px' }}>
              <select className="admin-input" value={filters.source}
                onChange={e => setFilters({ ...filters, source: e.target.value })}>
                <option value="">كل المصادر</option>
                <option value="platform">منتجات المنصة</option>
                <option value="custom">منتجات مخصصة</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              <input type="checkbox" checked={filters.lowStock}
                onChange={e => setFilters({ ...filters, lowStock: e.target.checked })} />
              عرض النواقص فقط
            </label>
            <button className="admin-btn admin-btn-ghost" onClick={fetchInventory} style={{ marginRight: 'auto' }}>
              🔄 تحديث
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="inventory-grid">
            {[1, 2, 3].map(n => (
              <div key={n} className="admin-notif-item" style={{ height: '300px' }} />
            ))}
          </div>
        ) : inventory.length > 0 ? (
          <div className="inventory-grid">
            {inventory.map(item => {
              const p = item.source === 'platform' ? item.productId : item.customProduct
              const img = item.source === 'platform'
                ? ((typeof p.image === 'string' ? p.image : p.image?.url) || 'https://placehold.co/400x400?text=Inventory')
                : (p.image?.url || 'https://placehold.co/400x400?text=Custom')

              const progress = Math.min(100, (item.quantity / (item.lowStockThreshold || 10)) * 100)
              const color = item.isLowStock ? '#ef4444' : '#16a34a'

              return (
                <div key={item._id} className="inventory-card">
                  <div className="inventory-card-head">
                    <img src={img} alt="" className="inventory-img" />
                    <div className="inventory-info">
                      <span className={`inv-source ${item.source}`}>
                        {item.source === 'platform' ? 'المنصة' : 'منتج خاص'}
                      </span>
                      <h3>{p.name}</h3>
                      <p className="admin-muted" style={{ fontSize: '12px' }}>
                        {p.category?.name || 'بدون فئة'}
                      </p>
                    </div>
                  </div>

                  {/* ── QR Code thumbnail ───────────────────── */}
                  {item.qrCode && (
                    <div className="inventory-qr-row">
                      <div
                        className="inventory-qr-thumb"
                        onClick={() => setQrTarget(item)}
                        title="عرض QR Code بالحجم الكامل"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setQrTarget(item)}
                        aria-label={`عرض QR Code لـ ${p.name}`}
                      >
                        <QrCodeCanvas value={item.qrCode} size={64} className="inventory-qr-canvas" showPrint={true} productName={item.source === "platform" ? item.productId.name : item.customProduct.name} />
                        <div className="inventory-qr-overlay">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            width="18" height="18">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                        </div>
                      </div>
                      <div className="inventory-qr-label">
                        <span>رمز QR</span>
                        <button
                          className="inventory-qr-expand-btn"
                          onClick={() => setQrTarget(item)}
                        >
                          عرض بالحجم الكامل
                        </button>
                      </div>
                    </div>
                  )}
                  {/* ────────────────────────────────────────── */}

                  <div className="inventory-stock-health">
                    <div className="stock-meter-label">
                      <span>حالة المخزون</span>
                      <span>{item.quantity} قطعة</span>
                    </div>
                    <div className="stock-meter-bar">
                      <div className="stock-meter-fill" style={{ width: `${progress}%`, background: color }} />
                    </div>
                    <div className={`stock-status-badge ${item.isLowStock ? 'status-low' : 'status-safe'}`}>
                      <div className="dot" style={{ background: color }} />
                      {item.isLowStock ? 'مخزون منخفض' : 'مخزون آمن'}
                    </div>
                  </div>

                  <div className="inventory-card-actions">
                    <button className="quick-adjust" onClick={() => setMovementTarget({ item, type: 'in' })}>➕ توريد</button>
                    <button className="quick-adjust" onClick={() => setMovementTarget({ item, type: 'out' })}>➖ صرف</button>
                    <div className="log-btn" onClick={() => setLogTarget(item)}>👁️ عرض سجل الحركات</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="inventory-empty">
            <h2>المخزن فارغ</h2>
            <p>لم تقم بإضافة أي منتجات لمخزنك بعد.</p>
            <Link to="/catalog" className="admin-btn admin-btn-primary"
              style={{ padding: '12px 32px', borderRadius: '14px', fontSize: '15px' }}>
              استعراض الكتالوج
            </Link>
          </div>
        )}
      </main>

      {/* Modals */}
      {movementTarget && (
        <StockMovementModal
          item={movementTarget.item}
          type={movementTarget.type}
          onClose={() => setMovementTarget(null)}
          onSave={fetchInventory}
        />
      )}

      {logTarget && (
        <LogViewerModal item={logTarget} onClose={() => setLogTarget(null)} />
      )}

      {showCustomModal && (
        <CustomProductModal
          categories={categories}
          onClose={() => setShowCustomModal(false)}
          onSave={fetchInventory}
        />
      )}

      {/* ── QR Viewer ──────────────────────────────────────── */}
      {qrTarget && (
        <QrViewerModal item={qrTarget} onClose={() => setQrTarget(null)} />
      )}

      <Footer />
    </div>
  )
}
