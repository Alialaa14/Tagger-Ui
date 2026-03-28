import React, { useEffect, useRef, useState } from 'react'
import { fetchNotifications, sendNotificationToAll, sendNotificationToUser } from '../../controllers/admin/notificationsController'
import './admin-theme.css'

export default function NotificationsPage({ socket }) {
  const [target, setTarget] = useState('all')
  const [userId, setUserId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // ─── Socket listener: incoming notifications pushed from server ───────────
  useEffect(() => {
    if (!socket) return

    const handleIncoming = (notification) => {
      setHistory((prev) => [notification, ...prev])
    }

    socket.on('sendNotification', handleIncoming)
    return () => socket.off('sendNotification', handleIncoming)
  }, [socket])

  // ─── Fetch notification history on mount ──────────────────────────────────
  useEffect(() => {
    let active = true
    setLoadingHistory(true)
    fetchNotifications()
      .then((res) => {
        if (!active) return
        setHistory(Array.isArray(res) ? res : [])
        setLoadingHistory(false)
      })
      .catch(() => {
        if (!active) return
        setHistory([])
        setLoadingHistory(false)
      })
    return () => { active = false }
  }, [])

  // ─── Send handler ─────────────────────────────────────────────────────────
  async function handleSend(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!message.trim()) {
      setError('نص الإشعار مطلوب')
      return
    }
    if (target === 'user' && !userId.trim()) {
      setError('معرّف المستخدم مطلوب للإرسال لمستخدم محدد')
      return
    }

    try {
      setSending(true)

      // ── Build socket payload ──────────────────────────────────────────────
      const socketPayload =
        target === 'all'
          ? { forAll: true, content: message.trim() }
          : {
              forAll: false,
              phoneNumber: phoneNumber.trim() || undefined,
              userId: userId.trim(),
              content: message.trim(),
            }

      // ── Emit via socket ───────────────────────────────────────────────────
      if (socket) {
        socket.emit('sendNotification', socketPayload)
      }

      // ── Persist via REST ──────────────────────────────────────────────────
      const created =
        target === 'all'
          ? await sendNotificationToAll(message.trim())
          : await sendNotificationToUser(userId.trim(), message.trim())

      // ── Optimistic update: add to notification container ──────────────────
      const newEntry = created || {
        _id: `local-${Date.now()}`,
        message: message.trim(),
        target: target === 'all' ? 'الكل' : 'مستخدم محدد',
        userId: target === 'user' ? userId.trim() : undefined,
        phoneNumber: target === 'user' && phoneNumber.trim() ? phoneNumber.trim() : undefined,
        createdAt: new Date().toISOString(),
      }

      setHistory((prev) => [newEntry, ...prev])
      setMessage('')
      setUserId('')
      setPhoneNumber('')
      setSuccess('تم إرسال الإشعار بنجاح')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'فشل إرسال الإشعار')
    } finally {
      setSending(false)
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <section className="admin-stack">

      {/* ── Send Form ────────────────────────────────────────────────────── */}
      <div className="admin-card">
        <p className="admin-kicker">الإشعارات</p>
        <h2>إرسال إشعار</h2>
        <p className="admin-muted">أرسل إشعاراً لكل المستخدمين أو لمستخدم محدد.</p>

        <form className="admin-stack" onSubmit={handleSend}>

          {/* Target selector */}
          <label className="admin-label">
            <span>نوع الإرسال</span>
            <select
              className="admin-input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="all">إلى جميع المستخدمين</option>
              <option value="user">إلى مستخدم محدد</option>
            </select>
          </label>

          {/* User-specific fields */}
          {target === 'user' && (
            <>
              <label className="admin-label">
                <span>معرّف المستخدم</span>
                <input
                  className="admin-input"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="مثال: 65f2..."
                />
              </label>

              <label className="admin-label">
                <span>رقم الهاتف (اختياري)</span>
                <input
                  className="admin-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="مثال: +201012345678"
                  type="tel"
                />
              </label>
            </>
          )}

          {/* Message body */}
          <label className="admin-label">
            <span>نص الإشعار</span>
            <textarea
              className="admin-input"
              style={{ minHeight: 120 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب نص الإشعار هنا..."
            />
          </label>

          {error   && <p className="admin-muted" style={{ color: '#dc2626' }}>{error}</p>}
          {success && <p className="admin-muted" style={{ color: '#16a34a' }}>{success}</p>}

          <div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={sending}
            >
              {sending ? 'جارٍ الإرسال...' : 'إرسال الإشعار'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Notification Container / Archive ────────────────────────────── */}
      <div className="admin-card">
        <p className="admin-kicker">الأرشيف</p>
        <h2>آخر الإشعارات</h2>
        <p className="admin-muted">قائمة سريعة بآخر الإشعارات المرسلة.</p>

        {loadingHistory && (
          <div className="admin-notif-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="admin-notif-item" />
            ))}
          </div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div className="admin-notif-empty">لا توجد إشعارات بعد.</div>
        )}

        {!loadingHistory && history.length > 0 && (
          <div className="admin-notif-list">
            {history.slice(0, 8).map((n, idx) => (
              <div key={n._id || n.id || idx} className="admin-notif-item">
                <div className="admin-notif-message">{n.message || n.content || n.text || '—'}</div>
                <div className="admin-notif-meta">
                  <span>{n.target || (n.userId ? 'مستخدم محدد' : 'الكل')}</span>
                  {n.userId      && <span>• {n.userId}</span>}
                  {n.phoneNumber && <span>• {n.phoneNumber}</span>}
                  {n.createdAt   && (
                    <span>
                      •{' '}
                      {new Date(n.createdAt).toLocaleString('ar-EG', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
