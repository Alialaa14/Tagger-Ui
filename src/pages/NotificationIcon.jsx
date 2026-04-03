/**
 * NotificationIcon
 * ─────────────────
 * Navbar bell icon with:
 *   • Animated unread badge
 *   • Click-to-toggle dropdown panel
 *   • Click-outside to dismiss
 *   • Real-time updates via useNotifications
 *   • Works for both user & trader roles
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from "../hooks/useNotifications"
import "./NotificationIcon.css"

// ─── small helpers ────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'الآن'
  if (m < 60) return `منذ ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} ساعة`
  const d = Math.floor(h / 24)
  return `منذ ${d} يوم`
}

const TYPE_META = {
  order: { icon: '📦', label: 'طلب' },
  payment: { icon: '💳', label: 'دفع' },
  promo: { icon: '🎁', label: 'عرض' },
  system: { icon: '⚙️', label: 'نظام' },
  alert: { icon: '🔔', label: 'تنبيه' },
}

function notifMeta(type) {
  return TYPE_META[type] || TYPE_META.alert
}

// ─── single row in dropdown ───────────────────────────────────────────────────

function NotifRow({ notif, onClose, markAsRead }) {
  const navigate = useNavigate()
  const id = notif._id ?? notif.id
  const meta = notifMeta(notif.type)

  const handleClick = () => {
    if (!notif.read) markAsRead(id)
    onClose()
    navigate(`/notifications/${id}`)
  }

  return (
    <div
      className={`ni-row ${!notif.read ? 'ni-row--unread' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={notif.title}
    >
      <span className="ni-row__icon" aria-hidden="true">{meta.icon}</span>
      <span className="ni-row__body">
        <span className="ni-row__title">{notif.title || 'إشعار جديد'}</span>
        {notif.message && (
          <span className="ni-row__msg">{notif.message}</span>
        )}
        <span className="ni-row__time">{timeAgo(notif.createdAt)}</span>
      </span>
      {!notif.read && (
        <span 
          className="ni-mark-read-btn" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            markAsRead(id);
          }}
          title="تعيين كمقروء"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function NotificationIcon() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  // close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const toggle = () => setOpen((v) => !v)
  const close = useCallback(() => setOpen(false), [])

  const preview = notifications.slice(0, 5)

  return (
    <div className="ni-wrap" ref={wrapRef} dir="rtl">
      {/* ── Bell button ── */}
      <button
        type="button"
        className={`ni-bell ${open ? 'ni-bell--active' : ''}`}
        onClick={toggle}
        aria-label={`الإشعارات${unreadCount ? ` - ${unreadCount} غير مقروء` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="ni-bell__svg" viewBox="0 0 24 24" fill={unreadCount > 0 ? "currentColor" : "none"} stroke="currentColor"
          strokeWidth={unreadCount > 0 ? "1.5" : "2"} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {unreadCount > 0 ? (
            <>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fillOpacity="0.15" />
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </>
          ) : (
            <>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </>
          )}
        </svg>

        {unreadCount > 0 && (
          <span className="ni-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="ni-panel" role="dialog" aria-label="الإشعارات">
          {/* Header */}
          <div className="ni-panel__head">
            <span className="ni-panel__title">الإشعارات</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="ni-panel__mark-all"
                onClick={markAllAsRead}
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          {/* Body */}
          <div className="ni-panel__body">
            {isLoading && (
              <div className="ni-panel__loading">
                {[1, 2, 3].map((n) => <div key={n} className="ni-skeleton" />)}
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="ni-panel__empty">
                <span className="ni-panel__empty-icon">🔕</span>
                <span>لا توجد إشعارات</span>
              </div>
            )}

            {!isLoading && preview.map((n) => (
              <NotifRow
                key={n._id ?? n.id}
                notif={n}
                onClose={close}
                markAsRead={markAsRead}
              />
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <button
              type="button"
              className="ni-panel__footer"
              onClick={() => { close(); navigate('/notifications') }}
            >
              عرض كل الإشعارات
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                width="14" height="14" aria-hidden="true">
                <path d="M10 12L6 8l4-4" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
