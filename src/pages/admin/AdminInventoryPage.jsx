import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import './admin-theme.css'

// ─── API Helpers ───────────────────────────────────────────────────────────────

const API_BASE = '/api/v1'
const withCreds = { withCredentials: true }

async function fetchAllUsers() {
  const res = await axios.get(`${API_BASE}/auth/get-users?role=user`, withCreds)
  const payload = res?.data?.data ?? res?.data
  return Array.isArray(payload) ? payload : (payload?.users || payload?.data || [])
}

async function fetchUserInventory(userId, params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await axios.get(`${API_BASE}/inventory/user/${userId}?${query}`, withCreds)
  const payload = res?.data?.data ?? res?.data
  return payload?.inventory || payload || []
}

async function fetchInventoryLogs(inventoryId, params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await axios.get(`${API_BASE}/inventory/${inventoryId}/logs?${query}`, withCreds)
  const payload = res?.data?.data ?? res?.data
  return payload?.logs || payload || []
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function fmtRelative(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'الآن'
  if (m < 60) return `منذ ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} ساعة`
  return `منذ ${Math.floor(h / 24)} يوم`
}

function resolveQrSrc(qrCode) {
  if (!qrCode) return null
  const raw = typeof qrCode === 'object' ? (qrCode.url ?? qrCode.data ?? '') : qrCode
  if (!raw) return null
  return raw.startsWith('data:') ? raw : `data:image/png;base64,${raw.trim()}`
}

const LOG_CONFIG = {
  stock_in: { label: 'توريد', color: '#16a34a', bg: '#dcfce7', icon: '↑', textColor: '#15803d' },
  stock_out: { label: 'صرف', color: '#ef4444', bg: '#fee2e2', icon: '↓', textColor: '#dc2626' },
  adjust: { label: 'تعديل يدوي', color: '#f59e0b', bg: '#fef3c7', icon: '⟳', textColor: '#d97706' },
}

function getLogCfg(type) {
  return LOG_CONFIG[type] || { label: type, color: '#64748b', bg: '#f1f5f9', icon: '•', textColor: '#475569' }
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function Shimmer({ style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg,#f0fdf4 25%,#dcfce7 50%,#f0fdf4 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmerAnim 1.4s infinite',
      borderRadius: 10,
      ...style
    }} />
  )
}

function StatBadge({ label, value, color = '#16a34a', bg = '#dcfce7', icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '14px 16px', borderRadius: 14,
      background: bg, border: `1.5px solid ${color}22`,
      minWidth: 110,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 900, color }}>{value}</span>
    </div>
  )
}

function InventoryHealthBar({ quantity, threshold }) {
  const pct = threshold > 0 ? Math.min(100, Math.round((quantity / threshold) * 100)) : 100
  const isLow = pct < 50
  const color = pct < 25 ? '#ef4444' : pct < 50 ? '#f59e0b' : '#16a34a'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4, color: '#64748b' }}>
        <span>{quantity} قطعة</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
      {isLow && (
        <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', marginTop: 3, display: 'block' }}>
          ⚠ مخزون منخفض
        </span>
      )}
    </div>
  )
}

// ─── QR Viewer Modal ───────────────────────────────────────────────────────────

function QrViewerModal({ item, onClose }) {
  const p = item?.source === 'platform' ? item?.productId : item?.customProduct
  const name = p?.name || 'المنتج'
  const src = resolveQrSrc(item?.qrCode)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = src
    a.download = `qr-${name.replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(4px)', zIndex: 50, animation: 'adminFadeIn 180ms ease'
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(360px,calc(100vw-32px))',
        background: '#fff', zIndex: 51, borderRadius: 22,
        border: '1.5px solid rgba(22,163,74,.14)',
        boxShadow: '0 28px 64px rgba(0,0,0,.16)',
        animation: 'adminSlideUp 220ms cubic-bezier(.34,1.56,.64,1)',
        padding: '28px 24px', textAlign: 'center',
        position: 'fixed',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, left: 14,
          width: 32, height: 32, border: '1.5px solid rgba(22,163,74,.18)',
          borderRadius: 9, background: '#fff', cursor: 'pointer',
          fontSize: 17, color: '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>✕</button>

        {/* Header */}
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          رمز QR
        </p>
        <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 900, color: '#0f172a' }}>{name}</h3>

        {/* QR image */}
        <div style={{
          display: 'inline-flex', padding: 16, background: '#fff',
          borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.10)',
          border: '1.5px solid rgba(22,163,74,.12)', marginBottom: 20
        }}>
          {src ? (
            <img
              src={src}
              alt="QR Code"
              width={220}
              height={220}
              style={{ imageRendering: 'pixelated', display: 'block' }}
            />
          ) : (
            <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
              لا يوجد رمز QR
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {src && (
            <button onClick={handleDownload} style={{
              padding: '9px 24px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#22c55e,#15803d)',
              color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer'
            }}>⬇ تحميل</button>
          )}
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 10,
            border: '1.5px solid rgba(22,163,74,.2)',
            background: '#f0fdf4', color: '#16a34a',
            fontSize: 13, fontWeight: 800, cursor: 'pointer'
          }}>إغلاق</button>
        </div>
      </div>
    </>
  )
}

// ─── Log Drawer ────────────────────────────────────────────────────────────────

function LogDrawer({ item, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!item?._id) return
    setLoading(true)
    setError('')
    fetchInventoryLogs(item._id)
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setError('تعذّر تحميل السجلات'))
      .finally(() => setLoading(false))
  }, [item?._id])

  const productName = item?.productId?.name || item?.customProduct?.name || 'منتج'
  const productImg = item?.productId?.image?.url || item?.customProduct?.image?.url || null

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const totals = useMemo(() => ({
    in: logs.filter(l => l.type === 'stock_in').reduce((s, l) => s + (l.quantityChanged || 0), 0),
    out: logs.filter(l => l.type === 'stock_out').reduce((s, l) => s + Math.abs(l.quantityChanged || 0), 0),
    adjusts: logs.filter(l => l.type === 'adjust').length,
  }), [logs])

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(4px)', zIndex: 50,
        animation: 'adminFadeIn 180ms ease'
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: 'min(520px,100%)',
        background: '#fff', zIndex: 51, display: 'flex', flexDirection: 'column',
        boxShadow: '6px 0 40px rgba(0,0,0,.12)',
        animation: 'slideInLeft 260ms cubic-bezier(.4,0,.2,1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 22px', borderBottom: '1.5px solid rgba(22,163,74,.12)',
          background: 'linear-gradient(135deg,#f0fdf4,#dcfce760)',
          display: 'flex', alignItems: 'flex-start', gap: 14
        }}>
          {productImg && (
            <img src={productImg} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.1)', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              سجل الحركات
            </p>
            <h3 style={{ margin: '3px 0 0', fontSize: 17, fontWeight: 900, color: '#0f172a' }}>{productName}</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
              {item?.source === 'platform' ? '🏬 منصة' : '✏️ مخصص'} · {logs.length} حركة مسجلة
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, border: '1.5px solid rgba(22,163,74,.2)', borderRadius: 10,
            background: '#fff', cursor: 'pointer', color: '#64748b', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>✕</button>
        </div>

        {/* Stats */}
        {!loading && logs.length > 0 && (
          <div style={{ padding: '14px 22px', display: 'flex', gap: 10, borderBottom: '1px solid rgba(22,163,74,.08)' }}>
            <StatBadge label="إجمالي وارد" value={totals.in} color="#16a34a" bg="#dcfce7" icon="↑" />
            <StatBadge label="إجمالي صادر" value={totals.out} color="#ef4444" bg="#fee2e2" icon="↓" />
            <StatBadge label="تعديلات" value={totals.adjusts} color="#f59e0b" bg="#fef3c7" icon="⟳" />
          </div>
        )}

        {/* Filter tabs */}
        {!loading && logs.length > 0 && (
          <div style={{ padding: '10px 22px', display: 'flex', gap: 6, borderBottom: '1px solid rgba(22,163,74,.08)' }}>
            {[['all', 'الكل'], ['stock_in', 'توريد'], ['stock_out', 'صرف'], ['adjust', 'تعديل']].map(([val, lbl]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: '5px 12px', borderRadius: 999, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: filter === val ? '#16a34a' : '#f0fdf4',
                color: filter === val ? '#fff' : '#16a34a',
                transition: 'all 150ms'
              }}>{lbl}</button>
            ))}
          </div>
        )}

        {/* Log list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px' }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4, 5].map(n => <Shimmer key={n} style={{ height: 72 }} />)}
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: 20, textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>⚠ {error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <p style={{ margin: 0, fontWeight: 700 }}>لا توجد سجلات مطابقة</p>
            </div>
          )}

          {!loading && !error && filtered.map((log, idx) => {
            const cfg = getLogCfg(log.type)
            const changed = Number(log.quantityChanged || 0)
            return (
              <div key={log._id || idx} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
                borderBottom: idx < filtered.length - 1 ? '1px solid rgba(22,163,74,.08)' : 'none',
                animation: `adminFadeIn ${200 + idx * 30}ms ease both`
              }}>
                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 11, background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900, color: cfg.color, flexShrink: 0
                }}>
                  {cfg.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                      background: cfg.bg, color: cfg.textColor
                    }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{fmtRelative(log.createdAt)}</span>
                  </div>
                  {log.note && (
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📝 {log.note}
                    </p>
                  )}
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{fmtDate(log.createdAt)}</p>
                </div>

                {/* Numbers */}
                <div style={{ textAlign: 'left', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: changed > 0 ? '#16a34a' : '#ef4444' }}>
                    {changed > 0 ? '+' : ''}{changed}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                    → {log.quantityAfter ?? '—'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ─── Inventory Detail Modal ────────────────────────────────────────────────────

function InventoryDetailModal({ item, onClose }) {
  const productName = item?.productId?.name || item?.customProduct?.name || 'منتج'
  const productImg = item?.productId?.image?.url || item?.customProduct?.image?.url || null
  const category = item?.productId?.category?.name || item?.customProduct?.category?.name || '—'
  const basePrice = item?.productId?.price || item?.customProduct?.price || 0
  const myPrice = item?.price || basePrice
  const margin = basePrice > 0 ? (((myPrice - basePrice) / basePrice) * 100).toFixed(1) : '—'

  const rows = [
    { label: 'الكمية الحالية', value: `${item?.quantity ?? 0} قطعة` },
    { label: 'حد التنبيه', value: `${item?.lowStockThreshold ?? 0} قطعة` },
    { label: 'سعر المنصة', value: `${basePrice} ج.م` },
    { label: 'سعر المتجر', value: `${myPrice} ج.م` },
    { label: 'هامش الربح', value: margin !== '—' ? `${margin}%` : '—' },
    { label: 'المصدر', value: item?.source === 'platform' ? 'منتجات المنصة' : 'منتج مخصص' },
    { label: 'الفئة', value: category },
    { label: 'تاريخ الإضافة', value: fmtDate(item?.createdAt) },
    { label: 'آخر تحديث', value: fmtDate(item?.updatedAt) },
  ]

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(4px)', zIndex: 50, animation: 'adminFadeIn 180ms ease'
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(480px,calc(100vw-32px))',
        maxHeight: 'calc(100vh-48px)', overflowY: 'auto',
        background: '#fff', zIndex: 51, borderRadius: 22,
        border: '1.5px solid rgba(22,163,74,.14)',
        boxShadow: '0 28px 64px rgba(0,0,0,.16)',
        animation: 'adminSlideUp 220ms cubic-bezier(.34,1.56,.64,1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 22px 16px',
          background: 'linear-gradient(135deg,#f0fdf4,#dcfce750)',
          borderBottom: '1.5px solid rgba(22,163,74,.12)',
          display: 'flex', gap: 14, alignItems: 'flex-start'
        }}>
          {productImg ? (
            <img src={productImg} alt="" style={{ width: 60, height: 60, borderRadius: 14, objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.1)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: 14, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📦</div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{productName}</h3>
            <span style={{
              display: 'inline-block', marginTop: 5, padding: '3px 10px', borderRadius: 999,
              background: item?.source === 'platform' ? '#dbeafe' : '#fae8ff',
              color: item?.source === 'platform' ? '#1d4ed8' : '#9333ea',
              fontSize: 11, fontWeight: 800
            }}>
              {item?.source === 'platform' ? '🏬 منتج المنصة' : '✏️ منتج مخصص'}
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, border: '1.5px solid rgba(22,163,74,.18)', borderRadius: 9,
            background: '#fff', cursor: 'pointer', fontSize: 17, color: '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>✕</button>
        </div>

        {/* Health bar */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(22,163,74,.08)' }}>
          <InventoryHealthBar quantity={item?.quantity ?? 0} threshold={item?.lowStockThreshold || 10} />
        </div>

        {/* Details */}
        <div style={{ padding: '14px 22px' }}>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(22,163,74,.07)' : 'none'
            }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 800 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Inventory Row Card ────────────────────────────────────────────────────────

function InventoryCard({ item, onViewLogs, onViewDetail, onViewQr }) {
  const productName = item?.productId?.name || item?.customProduct?.name || 'منتج'
  const productImg = item?.productId?.image?.url || item?.customProduct?.image?.url || null
  const category = item?.productId?.category?.name || '—'
  const quantity = item?.quantity ?? 0
  const threshold = item?.lowStockThreshold || 10
  const isLow = quantity < threshold
  const pct = threshold > 0 ? Math.min(100, Math.round((quantity / threshold) * 100)) : 100
  const barColor = pct < 25 ? '#ef4444' : pct < 50 ? '#f59e0b' : '#16a34a'
  const qrSrc = resolveQrSrc(item?.qrCode)

  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      border: `1.5px solid ${isLow ? 'rgba(239,68,68,.2)' : 'rgba(22,163,74,.12)'}`,
      padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center',
      boxShadow: '0 2px 8px rgba(15,23,42,.04)',
      transition: 'box-shadow 200ms, border-color 200ms, transform 200ms',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,.04)' }}
    >
      {/* Product Image */}
      {productImg ? (
        <img src={productImg} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', border: '1.5px solid rgba(22,163,74,.12)', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📦</div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productName}</span>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999,
            background: item?.source === 'platform' ? '#dbeafe' : '#fae8ff',
            color: item?.source === 'platform' ? '#1d4ed8' : '#9333ea',
            flexShrink: 0
          }}>
            {item?.source === 'platform' ? 'منصة' : 'مخصص'}
          </span>
          {isLow && <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', background: '#fee2e2', padding: '2px 7px', borderRadius: 999 }}>⚠ نقص</span>}
        </div>

        {category !== '—' && (
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6, display: 'block' }}>{category}</span>
        )}

        {/* Health bar */}
        <div style={{ marginTop: 2 }}>
          <div style={{ height: 5, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Qty */}
      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 50 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: isLow ? '#ef4444' : '#16a34a' }}>{quantity}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>قطعة</div>
      </div>

      {/* QR thumbnail */}
      {qrSrc && (
        <div
          onClick={() => onViewQr(item)}
          title="عرض QR Code بالحجم الكامل"
          style={{
            flexShrink: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            padding: '6px 8px', borderRadius: 10,
            border: '1.5px solid rgba(22,163,74,.15)',
            background: '#f0fdf4', transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = 'rgba(22,163,74,.35)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = 'rgba(22,163,74,.15)' }}
        >
          <img
            src={qrSrc}
            alt="QR"
            width={44}
            height={44}
            style={{ imageRendering: 'pixelated', display: 'block', borderRadius: 4 }}
          />
          <span style={{ fontSize: 9, fontWeight: 800, color: '#16a34a' }}>QR</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button onClick={() => onViewDetail(item)} style={{
          padding: '5px 12px', borderRadius: 8, border: '1.5px solid rgba(22,163,74,.2)',
          background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 700, cursor: 'pointer'
        }}>تفاصيل</button>
        <button onClick={() => onViewLogs(item)} style={{
          padding: '5px 12px', borderRadius: 8, border: '1.5px solid rgba(99,102,241,.2)',
          background: '#eff6ff', color: '#3b82f6', fontSize: 11, fontWeight: 700, cursor: 'pointer'
        }}>السجل</button>
      </div>
    </div>
  )
}

// ─── User Card ─────────────────────────────────────────────────────────────────

function UserCard({ user, selected, onClick }) {
  const name = user?.username || user?.shopName || 'مستخدم'
  const initials = (user?.shopName || user?.username || '?')[0]
  const role = String(user?.role || '').toLowerCase()

  const roleConfig = {
    admin: { label: 'مدير', bg: '#fef3c7', color: '#92400e' },
    trader: { label: 'تاجر', bg: '#dbeafe', color: '#1d4ed8' },
    user: { label: 'عميل', bg: '#dcfce7', color: '#15803d' },
    customer: { label: 'عميل', bg: '#dcfce7', color: '#15803d' },
  }
  const rc = roleConfig[role] || { label: role, bg: '#f1f5f9', color: '#475569' }

  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'right', padding: '11px 13px',
      border: `1.5px solid ${selected ? '#16a34a' : 'transparent'}`,
      borderRadius: 12, background: selected ? '#f0fdf4' : 'transparent',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11,
      transition: 'all 150ms', fontFamily: 'inherit',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: selected ? 'linear-gradient(135deg,#22c55e,#15803d)' : '#e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? '#fff' : '#64748b', fontWeight: 900, fontSize: 14
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        {user?.shopName && user?.username !== user?.shopName && (
          <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.shopName}</div>
        )}
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: rc.bg, color: rc.color, flexShrink: 0 }}>{rc.label}</span>
    </button>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminInventoryPage() {
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userSearch, setUserSearch] = useState('')

  const [selectedUser, setSelectedUser] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loadingInv, setLoadingInv] = useState(false)
  const [invError, setInvError] = useState('')

  const [sourceFilter, setSourceFilter] = useState('all')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [invSearch, setInvSearch] = useState('')

  const [logTarget, setLogTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [qrTarget, setQrTarget] = useState(null)   // ← QR viewer state

  // Load users
  useEffect(() => {
    fetchAllUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false))
  }, [])

  // Load inventory when user selected
  const loadInventory = useCallback(async (userId) => {
    if (!userId) return
    setLoadingInv(true)
    setInvError('')
    setInventory([])
    try {
      const data = await fetchUserInventory(userId)
      setInventory(Array.isArray(data) ? data : [])
    } catch (err) {
      setInvError(err?.response?.data?.message || 'تعذّر تحميل المخزون')
    } finally {
      setLoadingInv(false)
    }
  }, [])

  const selectUser = (user) => {
    setSelectedUser(user)
    setLogTarget(null)
    setDetailTarget(null)
    setQrTarget(null)
    const id = user?._id || user?.id
    if (id) loadInventory(id)
  }

  // Filter users
  const filteredUsers = useMemo(() =>
    users.filter(u => {
      const q = userSearch.toLowerCase()
      return !q || (u.username || '').toLowerCase().includes(q) || (u.shopName || '').toLowerCase().includes(q) || (u.phoneNumber || '').includes(q)
    }),
    [users, userSearch]
  )

  // Filter inventory
  const filteredInv = useMemo(() => {
    return inventory.filter(item => {
      const name = item?.productId?.name || item?.customProduct?.name || ''
      const matchSearch = !invSearch || name.toLowerCase().includes(invSearch.toLowerCase())
      const matchSource = sourceFilter === 'all' || item?.source === sourceFilter
      const matchLow = !lowStockOnly || item?.quantity < (item?.lowStockThreshold || 10)
      return matchSearch && matchSource && matchLow
    })
  }, [inventory, sourceFilter, lowStockOnly, invSearch])

  // Summary stats
  const invStats = useMemo(() => ({
    total: inventory.length,
    platform: inventory.filter(i => i.source === 'platform').length,
    custom: inventory.filter(i => i.source === 'custom').length,
    lowStock: inventory.filter(i => i.quantity < (i.lowStockThreshold || 10)).length,
    totalQty: inventory.reduce((s, i) => s + (i.quantity || 0), 0),
  }), [inventory])

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes invRowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .inv-scroll::-webkit-scrollbar { width: 5px; }
        .inv-scroll::-webkit-scrollbar-track { background: transparent; }
        .inv-scroll::-webkit-scrollbar-thumb { background: #dcfce7; border-radius: 99px; }
      `}</style>

      <section className="admin-stack" dir="rtl">
        {/* ── Page header ── */}
        <div className="admin-card" style={{ padding: '18px 22px' }}>
          <p className="admin-kicker">إدارة النظام</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>مخزون المستخدمين</h2>
              <p className="admin-muted" style={{ marginTop: 4 }}>
                تصفح مخزون أي مستخدم، راجع الحركات والسجلات، وتتبع حالة المخزون.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 12, background: '#f0fdf4', border: '1.5px solid rgba(22,163,74,.14)' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#16a34a' }}>{users.length}</div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>مستخدم</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-panel layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

          {/* LEFT: User list */}
          <div style={{
            background: '#fff', borderRadius: 18, border: '1.5px solid rgba(22,163,74,.12)',
            boxShadow: '0 4px 20px rgba(15,23,42,.06)', position: 'sticky', top: 20,
            maxHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: '1.5px solid rgba(22,163,74,.08)' }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                المستخدمون ({filteredUsers.length})
              </p>
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="بحث باسم المستخدم..."
                style={{
                  width: '100%', height: 38, border: '1.5px solid rgba(22,163,74,.15)',
                  borderRadius: 10, padding: '0 10px', fontSize: 13, fontFamily: 'inherit',
                  background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(22,163,74,.15)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div className="inv-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {loadingUsers && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => <Shimmer key={n} style={{ height: 52 }} />)}
                </div>
              )}

              {!loadingUsers && filteredUsers.length === 0 && (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>
                  لا يوجد مستخدمون مطابقون
                </div>
              )}

              {!loadingUsers && filteredUsers.map(user => (
                <UserCard
                  key={user._id || user.id}
                  user={user}
                  selected={selectedUser?._id === user._id}
                  onClick={() => selectUser(user)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Inventory panel */}
          <div>
            {!selectedUser ? (
              <div style={{
                background: '#fff', borderRadius: 18, border: '1.5px dashed rgba(22,163,74,.2)',
                padding: '80px 20px', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(15,23,42,.04)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👆</div>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>اختر مستخدماً</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                  اختر مستخدماً من القائمة لعرض مخزونه والسجلات التفصيلية
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* User info banner */}
                <div style={{
                  background: 'linear-gradient(135deg,#0f172a,#1e293b)',
                  borderRadius: 18, padding: '18px 22px',
                  display: 'flex', alignItems: 'center', gap: 16
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                    background: 'linear-gradient(135deg,#22c55e,#15803d)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900, color: '#fff'
                  }}>
                    {(selectedUser?.shopName || selectedUser?.username || '?')[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#fff' }}>
                      {selectedUser?.shopName || selectedUser?.username}
                    </h3>
                    {selectedUser?.phoneNumber && (
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
                        📱 {selectedUser.phoneNumber}
                      </p>
                    )}
                    {selectedUser?.city && (
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                        📍 {selectedUser.city}{selectedUser.governorate ? ` · ${selectedUser.governorate}` : ''}
                      </p>
                    )}
                  </div>
                  <button onClick={() => loadInventory(selectedUser?._id || selectedUser?.id)} style={{
                    width: 36, height: 36, border: '1px solid rgba(255,255,255,.2)', borderRadius: 10,
                    background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                  }} title="تحديث">↻</button>
                </div>

                {/* Stats */}
                {!loadingInv && inventory.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <StatBadge label="إجمالي أصناف" value={invStats.total} color="#16a34a" bg="#dcfce7" icon="📦" />
                    <StatBadge label="منصة" value={invStats.platform} color="#1d4ed8" bg="#dbeafe" icon="🏬" />
                    <StatBadge label="مخصص" value={invStats.custom} color="#9333ea" bg="#fae8ff" icon="✏️" />
                    <StatBadge label="نقص مخزون" value={invStats.lowStock} color="#ef4444" bg="#fee2e2" icon="⚠" />
                    <StatBadge label="إجمالي قطع" value={invStats.totalQty} color="#f59e0b" bg="#fef3c7" icon="🔢" />
                  </div>
                )}

                {/* Inventory filters */}
                <div style={{
                  background: '#fff', borderRadius: 14, border: '1.5px solid rgba(22,163,74,.12)',
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    value={invSearch}
                    onChange={e => setInvSearch(e.target.value)}
                    placeholder="بحث في المخزون..."
                    style={{
                      flex: 1, minWidth: 160, height: 38, border: '1.5px solid rgba(22,163,74,.15)',
                      borderRadius: 10, padding: '0 12px', fontSize: 13, fontFamily: 'inherit',
                      background: '#f8fafc', outline: 'none'
                    }}
                  />
                  <select
                    value={sourceFilter}
                    onChange={e => setSourceFilter(e.target.value)}
                    style={{
                      height: 38, border: '1.5px solid rgba(22,163,74,.15)', borderRadius: 10,
                      padding: '0 12px', fontSize: 13, fontFamily: 'inherit',
                      background: '#f8fafc', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="all">كل المصادر</option>
                    <option value="platform">منتجات المنصة</option>
                    <option value="custom">منتجات مخصصة</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: lowStockOnly ? '#ef4444' : '#64748b' }}>
                    <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} style={{ width: 15, height: 15 }} />
                    نقص فقط
                  </label>
                </div>

                {/* Inventory list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {loadingInv && (
                    [1, 2, 3, 4].map(n => <Shimmer key={n} style={{ height: 80 }} />)
                  )}

                  {!loadingInv && invError && (
                    <div style={{
                      background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 14,
                      padding: '20px', textAlign: 'center', color: '#b91c1c', fontWeight: 700
                    }}>
                      ⚠ {invError}
                      <br />
                      <button onClick={() => loadInventory(selectedUser._id)} style={{
                        marginTop: 10, padding: '6px 16px', background: '#fff',
                        border: '1.5px solid #fca5a5', borderRadius: 8, color: '#dc2626',
                        cursor: 'pointer', fontSize: 12, fontWeight: 700
                      }}>إعادة المحاولة</button>
                    </div>
                  )}

                  {!loadingInv && !invError && inventory.length === 0 && (
                    <div style={{
                      background: '#fff', borderRadius: 18, border: '1.5px dashed rgba(22,163,74,.18)',
                      padding: '60px 20px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                      <h4 style={{ margin: '0 0 6px', color: '#0f172a' }}>لا يوجد مخزون</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                        هذا المستخدم لم يضف أي منتجات لمخزونه بعد.
                      </p>
                    </div>
                  )}

                  {!loadingInv && !invError && filteredInv.length === 0 && inventory.length > 0 && (
                    <div style={{
                      background: '#fff', borderRadius: 14, border: '1.5px dashed rgba(22,163,74,.15)',
                      padding: '30px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13
                    }}>
                      🔍 لا توجد نتائج مطابقة للفلاتر المحددة
                    </div>
                  )}

                  {!loadingInv && !invError && filteredInv.map((item, idx) => (
                    <div key={item._id || idx} style={{ animation: `invRowIn ${200 + idx * 40}ms ease both` }}>
                      <InventoryCard
                        item={item}
                        onViewLogs={setLogTarget}
                        onViewDetail={setDetailTarget}
                        onViewQr={setQrTarget}
                      />
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modals / Drawers */}
      {logTarget && (
        <LogDrawer item={logTarget} onClose={() => setLogTarget(null)} />
      )}
      {detailTarget && (
        <InventoryDetailModal item={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
      {qrTarget && (
        <QrViewerModal item={qrTarget} onClose={() => setQrTarget(null)} />
      )}
    </>
  )
}
