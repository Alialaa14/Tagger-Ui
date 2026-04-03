/**
 * NotificationDetail  —  /notifications/:id
 * ───────────────────────────────────────────
 * Displays full detail of one notification.
 * Auto-marks as read on mount.
 */

import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNotificationDetail } from '../hooks/useNotifications'
import './NotificationDetail.css'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const TYPE_META = {
  order: { icon: '📦', label: 'طلب', color: '#3b82f6' },
  payment: { icon: '💳', label: 'دفع', color: '#8b5cf6' },
  promo: { icon: '🎁', label: 'عرض', color: '#f59e0b' },
  system: { icon: '⚙️', label: 'نظام', color: '#6b7280' },
  alert: { icon: '🔔', label: 'تنبيه', color: '#ef4444' },
}

const API_BASE = 'http://localhost:3000/api/v1/notification'

// ─── main component ───────────────────────────────────────────────────────────

export default function NotificationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { notification, isLoading, error } = useNotificationDetail(id)

  // Auto-mark as read
  useEffect(() => {
    if (!notification || notification.read) return
    axios.patch(`${API_BASE}/${id}/read`, {}, { withCredentials: true })
      .catch(() => {/* silent */ })
  }, [notification, id])

  const meta = TYPE_META[notification?.type] || TYPE_META.alert

  return (
    <div className="nd-page" dir="rtl">
      <Navbar />

      <main className="nd-main container section">
        {/* ── Back ── */}
        <button
          type="button"
          className="nd-back"
          onClick={() => navigate(-1)}
          aria-label="رجوع"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            width="16" height="16" aria-hidden="true">
            <path d="M6 4l4 4-4 4" />
          </svg>
          رجوع
        </button>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="nd-card">
            <div className="nd-skeleton nd-skeleton--icon shimmer" />
            <div className="nd-skeleton nd-skeleton--title shimmer" />
            <div className="nd-skeleton nd-skeleton--body shimmer" />
            <div className="nd-skeleton nd-skeleton--body nd-skeleton--sm shimmer" />
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <div className="nd-error" role="alert">
            <span className="nd-error__icon">⚠️</span>
            <div>
              <p className="nd-error__title">تعذّر تحميل الإشعار</p>
              <p className="nd-error__msg">{error}</p>
            </div>
            <button type="button" className="nd-btn" onClick={() => navigate('/notifications')}>
              العودة للإشعارات
            </button>
          </div>
        )}

        {/* ── Content ── */}
        {!isLoading && notification && (
          <article className="nd-card" aria-label="تفاصيل الإشعار">
            {/* Icon + type */}
            <div className="nd-card__top">
              <span
                className="nd-card__icon"
                style={{ '--icon-color': meta.color }}
                aria-hidden="true"
              >
                {meta.icon}
              </span>
              <span
                className="nd-card__badge"
                style={{ '--badge-color': meta.color }}
              >
                {meta.label}
              </span>
              {!notification.read && (
                <span className="nd-card__unread-chip">غير مقروء</span>
              )}
            </div>

            {/* Title */}
            <h1 className="nd-card__title">
              {notification.title || notification.message || 'إشعار'}
            </h1>

            {/* Meta row */}
            <div className="nd-card__meta">
              <span className="nd-card__date">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" width="14" height="14" aria-hidden="true">
                  <rect x="2" y="3" width="12" height="12" rx="2" />
                  <path d="M2 7h12M5 1v4M11 1v4" />
                </svg>
                {formatDate(notification.createdAt)}
              </span>
            </div>

            {/* Divider */}
            <div className="nd-divider" />

            {/* Body message */}
            {notification.message && notification.title && (
              <p className="nd-card__body">{notification.message}</p>
            )}

            {/* Extra data (e.g. orderId, amount) — rendered if present */}
            {notification.data && Object.keys(notification.data).length > 0 && (
              <div className="nd-card__data">
                <h2 className="nd-card__data-title">تفاصيل إضافية</h2>
                <dl className="nd-card__dl">
                  {Object.entries(notification.data).map(([k, v]) => (
                    <div className="nd-card__dl-row" key={k}>
                      <dt>{k}</dt>
                      <dd>{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* CTA if notification provides a link */}
            {notification.link && (
              <a
                href={notification.link}
                className="nd-card__cta"
                target="_blank"
                rel="noreferrer"
              >
                فتح التفاصيل
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" width="14" height="14" aria-hidden="true">
                  <path d="M4 12L12 4M6 4h6v6" />
                </svg>
              </a>
            )}
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
