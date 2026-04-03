/**
 * NotificationsPage  —  /notifications
 * ──────────────────────────────────────
 * Full-page notification center with:
 *   • Filter tabs (all / unread / by type)
 *   • Mark all as read
 *   • Click → navigate to detail page
 *   • Real-time updates via useNotifications
 */

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNotifications } from '../hooks/useNotifications'
import './NotificationsPage.css'

// ─── helpers ──────────────────────────────────────────────────────────────────

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
  order:   { icon: '📦', label: 'طلبات',   color: '#3b82f6' },
  payment: { icon: '💳', label: 'مدفوعات', color: '#8b5cf6' },
  promo:   { icon: '🎁', label: 'عروض',    color: '#f59e0b' },
  system:  { icon: '⚙️', label: 'نظام',    color: '#6b7280' },
  alert:   { icon: '🔔', label: 'إشعار',   color: '#22c55e' },
}

const TABS = [
  { id: 'all',    label: 'الكل'       },
  { id: 'unread', label: 'غير مقروء'  },
]

// ─── chevron icon (fixed size) ────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg
      className="np-card__chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 12l4-4-4-4" />
    </svg>
  )
}

// ─── refresh icon ─────────────────────────────────────────────────────────────

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 14.99a9 9 0 1 0-.49-8.99" />
    </svg>
  )
}

// ─── single notification card ─────────────────────────────────────────────────

function NotificationCard({ notif, markAsRead }) {
  const navigate = useNavigate()
  const id   = notif._id ?? notif.id
  const meta = TYPE_META[notif.type] || TYPE_META.alert

  const handleClick = () => {
    if (!notif.read) markAsRead(id)
    navigate(`/notifications/${id}`)
  }

  return (
    <div
      className={`np-card${!notif.read ? ' np-card--unread' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Unread dot / Mark read button — leading edge (RTL: right side) */}
      <span className="np-card__indicator">
        {!notif.read && (
          <span 
            className="np-card__mark-read"
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
      </span>

      {/* Type icon bubble */}
      <span
        className="np-card__icon"
        style={{ '--icon-color': meta.color }}
        aria-hidden="true"
      >
        {meta.icon}
      </span>

      {/* Content */}
      <span className="np-card__content">
        {/* Title row */}
        <span className="np-card__row">
          <span className="np-card__title">{notif.title || 'إشعار جديد'}</span>
          <span className="np-card__time">{timeAgo(notif.createdAt)}</span>
        </span>

        {/* Message preview */}
        {notif.message && (
          <span className="np-card__body">{notif.message}</span>
        )}

        {/* Type badge */}
        <span
          className="np-card__type-badge"
          style={{ '--badge-color': meta.color }}
        >
          {meta.icon} {meta.label}
        </span>
      </span>

      {/* Chevron — trailing edge */}
      <ChevronIcon />
    </div>
  )
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="np-skeleton">
      <div className="np-skeleton__icon shimmer" />
      <div className="np-skeleton__lines">
        <div className="np-skeleton__line np-skeleton__line--lg shimmer" />
        <div className="np-skeleton__line np-skeleton__line--sm shimmer" />
      </div>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchAll,
  } = useNotifications()

  const filtered = useMemo(() => {
    if (activeTab === 'all')    return notifications
    if (activeTab === 'unread') return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.type === activeTab)
  }, [notifications, activeTab])

  return (
    <div className="np-page" dir="rtl">
      <Navbar />

      <main className="np-main container section">
        {/* ── Page header ── */}
        <header className="np-header">
          <div>
            <h1 className="np-header__title">الإشعارات</h1>
            {unreadCount > 0 && (
              <p className="np-header__sub">لديك {unreadCount} إشعار غير مقروء</p>
            )}
          </div>

          <div className="np-header__actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="np-btn np-btn--outline"
                onClick={markAllAsRead}
              >
                تعليم الكل كمقروء
              </button>
            )}
            <button
              type="button"
              className="np-btn np-btn--ghost"
              onClick={fetchAll}
            >
              <RefreshIcon />
              تحديث
            </button>
          </div>
        </header>

        {/* ── Filter tabs ── */}
        <div className="np-tabs" role="tablist" aria-label="تصفية الإشعارات">
          {TABS.map((tab) => {
            const count =
              tab.id === 'all'    ? notifications.length :
              tab.id === 'unread' ? unreadCount :
              notifications.filter((n) => n.type === tab.id).length

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`np-tab${activeTab === tab.id ? ' np-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {count > 0 && (
                  <span className="np-tab__count">{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="np-error" role="alert">
            ⚠️ {error}
            <button
              type="button"
              className="np-btn np-btn--ghost"
              onClick={fetchAll}
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* ── List ── */}
        <div className="np-list" role="tabpanel">
          {isLoading && (
            [1, 2, 3, 4, 5].map((n) => <NotificationSkeleton key={n} />)
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="np-empty">
              <span className="np-empty__icon">🔕</span>
              <span className="np-empty__text">
                {activeTab === 'unread'
                  ? 'أنت محدّث! لا إشعارات غير مقروءة.'
                  : 'لا توجد إشعارات في هذه الفئة.'}
              </span>
            </div>
          )}

          {!isLoading && filtered.map((n) => (
            <NotificationCard
              key={n._id ?? n.id}
              notif={n}
              markAsRead={markAsRead}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
