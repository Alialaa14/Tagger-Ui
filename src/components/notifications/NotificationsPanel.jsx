import React, { useEffect, useState } from 'react'
import { fetchMyNotifications } from '../../controllers/notificationsController'
import './NotificationsPanel.css'

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function NotificationsPanel({ title = 'الإشعارات', limit = 5 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetchMyNotifications()
      .then((res) => {
        if (!active) return
        const list = Array.isArray(res) ? res : []
        setItems(list)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.response?.data?.message || err?.message || 'فشل تحميل الإشعارات.')
        setItems([])
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  const visible = typeof limit === 'number' ? items.slice(0, limit) : items

  return (
    <section className="notif-panel" dir="rtl">
      <div className="notif-panel-head">
        <h3>{title}</h3>
        <span className="notif-count">{items.length}</span>
      </div>

      {loading && (
        <div className="notif-skeleton-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="notif-skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="notif-empty">{error}</div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="notif-empty">لا توجد إشعارات حالياً.</div>
      )}

      {!loading && !error && visible.length > 0 && (
        <ul className="notif-list">
          {visible.map((n, idx) => (
            <li key={n._id || n.id || idx} className={`notif-item ${n.isRead ? 'is-read' : ''}`}>
              <div className="notif-message">{n.message || n.text || '—'}</div>
              <div className="notif-meta">
                <span>{formatDate(n.createdAt || n.date)}</span>
                {n.sender && <span>• {n.sender}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
