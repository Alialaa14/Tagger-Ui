import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from '../../controllers/admin/notificationsController'
import socket from '../../socket'
import './admin-theme.css'

/* ─── helpers ───────────────────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
}

function Badge({ label }) {
  const isAll = label === 'all' || label === 'الكل'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: '.03em',
      background: isAll ? '#e0f2fe' : '#fef3c7',
      color: isAll ? '#0369a1' : '#92400e',
    }}>
      {isAll ? 'الكل' : 'مستخدم محدد'}
    </span>
  )
}

/* ─── Modal wrapper ─────────────────────────────────────────────────────────── */
function Modal({ open, onClose, children, title, wide }) {
  const overlayRef = useRef()
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn .15s ease',
      }}
    >
      <div style={{
        background: 'var(--modal-bg, #fff)',
        borderRadius: 18, width: '100%',
        maxWidth: wide ? 600 : 520,
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        overflow: 'hidden', animation: 'slideUp .2s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border, #e5e7eb)',
        }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--muted, #6b7280)', lineHeight: 1,
          }}>✕</button>
        </div>
        <div style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}

/* ─── Detail row ────────────────────────────────────────────────────────────── */
function DetailRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3,
      padding: '10px 0', borderBottom: '1px solid var(--border, #e5e7eb)',
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: 'var(--muted, #6b7280)',
        textTransform: 'uppercase', letterSpacing: '.06em',
      }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text, #111827)', wordBreak: 'break-word' }}>
        {value || '—'}
      </span>
    </div>
  )
}

/* ─── User profile card ─────────────────────────────────────────────────────── */
function UserProfileCard({ user, loading }) {
  /* skeleton while fresh data is loading */
  if (loading) {
    return (
      <div style={{
        borderRadius: 14, padding: '18px', marginBottom: 20,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        display: 'flex', gap: 14, alignItems: 'center',
      }}>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: '#e2e8f0', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 14, width: '50%', borderRadius: 6, background: '#e2e8f0' }} />
          <div style={{ height: 12, width: '35%', borderRadius: 6, background: '#e2e8f0' }} />
          <div style={{ height: 24, width: '45%', borderRadius: 99, background: '#e2e8f0' }} />
        </div>
      </div>
    )
  }

  if (!user) return null
  const { name, shopName, phoneNumber, logo } = user
  if (!name && !shopName && !phoneNumber && !logo) return null

  const initials = (shopName || name || '?')[0]

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden', marginBottom: 20,
      border: '1px solid #bae6fd',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    }}>
      {/* accent strip */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }} />

      <div style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* avatar / logo */}
        {logo ? (
          <img
            src={logo.url}
            alt={shopName || name || 'logo'}
            style={{
              width: 64, height: 64, borderRadius: 14, objectFit: 'cover',
              flexShrink: 0, border: '3px solid #fff',
              boxShadow: '0 4px 14px rgba(14,165,233,.25)',
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 14px rgba(99,102,241,.3)',
          }}>
            {initials}
          </div>
        )}

        {/* text info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {shopName && (
            <div style={{
              fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 3,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>🏪</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shopName}
              </span>
            </div>
          )}
          {name && (
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#075985', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span>👤</span> {name}
            </div>
          )}
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 99,
                background: '#fff', border: '1px solid #bae6fd',
                fontSize: 13, fontWeight: 700, color: '#0369a1',
                textDecoration: 'none', direction: 'ltr', letterSpacing: '.02em',
                boxShadow: '0 1px 4px rgba(0,0,0,.06)', transition: 'background .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
            >
              📱 {phoneNumber}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Skeleton row ──────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 13, width: '60%', borderRadius: 6, background: '#e5e7eb' }} />
        <div style={{ height: 11, width: '35%', borderRadius: 6, background: '#e5e7eb' }} />
      </div>
      <div style={{ height: 28, width: 80, borderRadius: 8, background: '#e5e7eb', alignSelf: 'center' }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════════════════ */
export default function AdminNotificationPage() {
  /* send-form */
  const [target, setTarget] = useState('all')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sendSuccess, setSendSuccess] = useState('')

  /* list */
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [listError, setListError] = useState('')
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  /* modals */
  const [viewModal, setViewModal] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [editMsg, setEditMsg] = useState('')

  /* load list */
  const loadList = useCallback(async (pg, lim) => {
    setLoadingHistory(true)
    setListError('')
    try {
      const res = await fetchNotifications({ limit: lim, page: pg })
      const arr = Array.isArray(res) ? res : []
      setHistory(arr)
      setHasMore(arr.length >= lim)
    } catch {
      setListError('تعذّر تحميل الإشعارات.')
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => { loadList(page, limit) }, [page, limit, loadList])

  /* socket */
  useEffect(() => {
    const handle = (n) => setHistory((prev) => [n, ...prev])
    socket.on('sendNotification', handle)
    return () => socket.off('sendNotification', handle)
  }, [])

  /* send */
  async function handleSend(e) {
    e.preventDefault()
    setSendError(''); setSendSuccess('')
    if (!message.trim()) { setSendError('نص الإشعار مطلوب'); return }
    if (target === 'user' && !phoneNumber.trim()) { setSendError('رقم الهاتف مطلوب'); return }
    try {
      setSending(true)
      socket.emit('sendNotification', target === 'all'
        ? { forAll: true, message: message.trim() }
        : { forAll: false, phoneNumber: phoneNumber.trim(), message: message.trim() }
      )
      setHistory((prev) => [{
        _id: `local-${Date.now()}`,
        message: message.trim(),
        target: target === 'all' ? 'الكل' : 'مستخدم محدد',
        phoneNumber: target === 'user' ? phoneNumber.trim() : undefined,
        createdAt: new Date().toISOString(),
      }, ...prev])
      setMessage(''); setPhoneNumber('')
      setSendSuccess('تم إرسال الإشعار بنجاح ✓')
    } catch (err) {
      setSendError(err?.message || 'فشل إرسال الإشعار')
    } finally {
      setSending(false)
    }
  }

  /* view — shows cached instantly, fetches fresh data (including user) in background */
  async function handleView(notif) {
    setActionError('')
    setViewModal(notif)
    setViewLoading(true)
    if (notif._id && !notif._id.startsWith('local-')) {
      try {
        const fresh = await getNotificationById(notif._id)
        if (fresh) setViewModal(fresh)
      } catch { /* keep cached */ }
    }
    setViewLoading(false)
  }

  /* edit */
  function handleEditOpen(notif) {
    setActionError('')
    setEditMsg(notif.message || notif.content || notif.text || '')
    setEditModal(notif)
  }

  async function handleEditSave() {
    if (!editMsg.trim()) { setActionError('نص الإشعار مطلوب'); return }
    try {
      setActionBusy(true); setActionError('')
      const updated = await updateNotification(editModal._id, { message: editMsg.trim() })
      setHistory((prev) => prev.map((n) =>
        n._id === editModal._id ? { ...n, ...updated, message: editMsg.trim() } : n
      ))
      setEditModal(null)
    } catch (err) {
      setActionError(err?.message || 'فشل التحديث')
    } finally {
      setActionBusy(false)
    }
  }

  /* delete */
  async function handleDeleteConfirm() {
    try {
      setActionBusy(true); setActionError('')
      await deleteNotification(deleteModal._id)
      setHistory((prev) => prev.filter((n) => n._id !== deleteModal._id))
      setDeleteModal(null)
    } catch (err) {
      setActionError(err?.message || 'فشل الحذف')
    } finally {
      setActionBusy(false)
    }
  }

  /* ════════════════════════ RENDER ════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        .notif-row { transition: background .15s; }
        .notif-row:hover { background: var(--row-hover, #f9fafb); }
        .notif-action-btn {
          display:inline-flex; align-items:center; gap:4px;
          padding:5px 11px; border-radius:8px; border:1px solid transparent;
          font-size:12px; font-weight:600; cursor:pointer; transition:all .15s;
          white-space:nowrap; background:none;
        }
        .notif-action-btn:disabled { opacity:.5; cursor:not-allowed; }
        .btn-view   { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }
        .btn-view:hover   { background:#dbeafe; }
        .btn-edit   { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
        .btn-edit:hover   { background:#dcfce7; }
        .btn-delete { background:#fef2f2; color:#b91c1c; border-color:#fecaca; }
        .btn-delete:hover { background:#fee2e2; }
        .filter-input {
          border:1px solid var(--border,#e5e7eb); border-radius:8px; padding:7px 12px;
          font-size:13px; background:var(--input-bg,#fff); color:var(--text,#111827);
          outline:none; transition:border .15s;
        }
        .filter-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
        .page-btn {
          padding:6px 14px; border-radius:8px; border:1px solid var(--border,#e5e7eb);
          background:var(--input-bg,#fff); font-size:13px; font-weight:600;
          cursor:pointer; transition:all .15s; color:var(--text,#374151);
        }
        .page-btn:hover:not(:disabled) { background:#6366f1; color:#fff; border-color:#6366f1; }
        .page-btn:disabled { opacity:.4; cursor:not-allowed; }
        .page-btn--active  { background:#6366f1; color:#fff; border-color:#6366f1; }
      `}</style>

      <section className="admin-stack" dir="rtl">

        {/* ── Send Form ──────────────────────────────────────────────────────── */}
        <div className="admin-card">
          <p className="admin-kicker">الإشعارات</p>
          <h2>إرسال إشعار جديد</h2>
          <p className="admin-muted">أرسل إشعاراً فورياً لجميع المستخدمين أو لمستخدم بعينه.</p>
          <form className="admin-stack" onSubmit={handleSend}>
            <label className="admin-label">
              <span>نوع الإرسال</span>
              <select className="admin-input" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="all">إلى جميع المستخدمين</option>
                <option value="user">إلى مستخدم محدد</option>
              </select>
            </label>
            {target === 'user' && (
              <label className="admin-label">
                <span>رقم الهاتف</span>
                <input className="admin-input" value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="مثال: 01012345678" type="tel" />
              </label>
            )}
            <label className="admin-label">
              <span>نص الإشعار</span>
              <textarea className="admin-input" style={{ minHeight: 110 }}
                value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب نص الإشعار هنا..." />
            </label>
            {sendError && <p className="admin-muted" style={{ color: '#dc2626' }}>{sendError}</p>}
            {sendSuccess && <p className="admin-muted" style={{ color: '#16a34a' }}>{sendSuccess}</p>}
            <div>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={sending}>
                {sending ? 'جارٍ الإرسال...' : '📣 إرسال الإشعار'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Notification History ────────────────────────────────────────────── */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
            <p className="admin-kicker" style={{ marginBottom: 2 }}>الأرشيف</p>
            <h2 style={{ marginBottom: 4 }}>سجل الإشعارات</h2>
            <p className="admin-muted">تصفح وأدر الإشعارات المرسلة — يمكنك العرض والتعديل والحذف.</p>
          </div>

          {/* filters */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
            padding: '14px 24px', borderBottom: '1px solid var(--border, #e5e7eb)',
            background: 'var(--row-hover, #f9fafb)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted, #6b7280)' }}>التصفية:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--muted, #6b7280)', fontWeight: 600 }}>عدد النتائج</label>
              <select className="filter-input" value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}>
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button className="notif-action-btn btn-view" style={{ marginRight: 'auto' }}
              onClick={() => loadList(page, limit)}>
              🔄 تحديث
            </button>
          </div>

          {/* list */}
          {loadingHistory && <div>{[1, 2, 3, 4].map(n => <SkeletonRow key={n} />)}</div>}
          {!loadingHistory && listError && (
            <div style={{ padding: '24px', color: '#dc2626', fontSize: 14 }}>{listError}</div>
          )}
          {!loadingHistory && !listError && history.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
              لا توجد إشعارات بعد.
            </div>
          )}
          {!loadingHistory && history.length > 0 && (
            <div>
              {history.map((n, idx) => {
                const isLocal = String(n._id || '').startsWith('local-')
                const msgText = n.message || n.content || n.text || '—'
                const tgtLabel = n.target || (n.forAll ? 'الكل' : 'مستخدم محدد')
                const user = n.user || n.recipient
                const shopName = user?.shopName
                return (
                  <div key={n._id || n.id || idx} className="notif-row" style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 24px', borderBottom: '1px solid var(--border, #e5e7eb)',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: n.forAll || n.target === 'الكل' ? '#ede9fe' : '#e0f2fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {n.forAll || n.target === 'الكل' ? '📢' : '👤'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: 'var(--text, #111827)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{msgText}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 5, alignItems: 'center' }}>
                        <Badge label={tgtLabel} />
                        {shopName && (
                          <span style={{ fontSize: 12, color: '#0369a1', fontWeight: 600 }}>🏪 {shopName}</span>
                        )}
                        {n.phoneNumber && !shopName && (
                          <span style={{ fontSize: 12, color: 'var(--muted,#6b7280)' }}>📱 {n.phoneNumber}</span>
                        )}
                        {n.createdAt && (
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>🕐 {fmtDate(n.createdAt)}</span>
                        )}
                        {isLocal && <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>● محلي</span>}
                      </div>
                    </div>
                    {!isLocal && (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button className="notif-action-btn btn-view" onClick={() => handleView(n)}>👁 عرض</button>
                        <button className="notif-action-btn btn-edit" onClick={() => handleEditOpen(n)}>✏️ تعديل</button>
                        <button className="notif-action-btn btn-delete" onClick={() => { setActionError(''); setDeleteModal(n) }}>🗑 حذف</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* pagination */}
          {!loadingHistory && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              padding: '16px 24px', borderTop: '1px solid var(--border, #e5e7eb)',
            }}>
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                ‹ السابق
              </button>
              {[...Array(3)].map((_, i) => {
                const pg = Math.max(1, page - 1) + i
                return (
                  <button key={pg} className={`page-btn ${pg === page ? 'page-btn--active' : ''}`}
                    onClick={() => setPage(pg)}>{pg}</button>
                )
              })}
              <button className="page-btn" disabled={!hasMore} onClick={() => setPage(p => p + 1)}>
                التالي ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══ VIEW MODAL ═════════════════════════════════════════════════════════ */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="تفاصيل الإشعار" wide>
        {viewModal && (
          <div dir="rtl">

            {/* User profile card — shows skeleton while fetching, then real data */}
            <UserProfileCard
              user={viewModal.user || viewModal.recipient}
              loading={viewLoading}
            />

            {/* Notification details */}
            <div style={{
              background: 'var(--row-hover, #f9fafb)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: 12, padding: '2px 14px', marginBottom: 20,
            }}>
              <DetailRow
                label="نص الإشعار"
                value={viewModal.message || viewModal.content || viewModal.text}
              />
              <DetailRow
                label="الجمهور المستهدف"
                value={viewModal.target || (viewModal.forAll ? 'الكل' : 'مستخدم محدد')}
              />
              {/* show top-level phoneNumber only if not already shown in user card */}
              {viewModal.phoneNumber && !(viewModal.user?.phoneNumber || viewModal.recipient?.phoneNumber) && (
                <DetailRow label="رقم الهاتف" value={viewModal.phoneNumber} />
              )}
              <DetailRow label="تاريخ الإرسال" value={fmtDate(viewModal.createdAt)} />
              <DetailRow label="المعرّف (ID)" value={viewModal._id || viewModal.id} />
              {viewModal.status && <DetailRow label="الحالة" value={viewModal.status} />}
            </div>

            <button className="admin-btn admin-btn-primary" onClick={() => setViewModal(null)}>
              إغلاق
            </button>
          </div>
        )}
      </Modal>

      {/* ══ EDIT MODAL ══════════════════════════════════════════════════════════ */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="تعديل الإشعار">
        {editModal && (
          <div dir="rtl">
            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">
                <span>نص الإشعار</span>
                <textarea className="admin-input"
                  style={{ minHeight: 100, marginTop: 6, width: '100%', boxSizing: 'border-box' }}
                  value={editMsg} onChange={(e) => setEditMsg(e.target.value)} />
              </label>
            </div>
            {actionError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="admin-btn admin-btn-primary" disabled={actionBusy} onClick={handleEditSave}>
                {actionBusy ? 'جارٍ الحفظ...' : '💾 حفظ التغييرات'}
              </button>
              <button className="admin-btn"
                style={{ background: 'var(--input-bg,#f3f4f6)', color: 'var(--text,#374151)' }}
                onClick={() => setEditModal(null)}>إلغاء</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ DELETE CONFIRM MODAL ════════════════════════════════════════════════ */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="تأكيد الحذف">
        {deleteModal && (
          <div dir="rtl">
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '14px 16px', marginBottom: 20,
            }}>
              <p style={{ fontWeight: 700, color: '#b91c1c', marginBottom: 4, fontSize: 14 }}>
                ⚠️ هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
                سيتم حذف الإشعار التالي نهائياً:
              </p>
              <p style={{
                fontWeight: 600, fontSize: 13, marginTop: 8, color: '#111827',
                background: '#fff', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #fecaca',
              }}>
                &ldquo;{deleteModal.message || deleteModal.content || deleteModal.text || '—'}&rdquo;
              </p>
            </div>
            {actionError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="notif-action-btn btn-delete"
                style={{ padding: '9px 20px', fontSize: 13 }}
                disabled={actionBusy} onClick={handleDeleteConfirm}>
                {actionBusy ? 'جارٍ الحذف...' : '🗑 نعم، احذف'}
              </button>
              <button className="admin-btn"
                style={{ background: 'var(--input-bg,#f3f4f6)', color: 'var(--text,#374151)' }}
                onClick={() => setDeleteModal(null)}>إلغاء</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
