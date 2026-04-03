import React, { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationCard from "./NotificationCard";
import { toast } from "../../utils/toast";
import "./NotificationsPanel.css";

export default function NotificationsPanel({
  title = "الإشعارات",
  limit,
  showRefresh = true,
}) {
  const {
    notifications: items,
    isLoading: loading,
    error,
    unreadCount,
    fetchAll,
    markAsRead: markRead,
    markAllAsRead,
    remove,
    update,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const visible = typeof limit === "number" ? items.slice(0, limit) : items;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markRead(id);
      toast("تم تعيين الإشعار كمقروء", "success");
    } catch (err) {
      toast(err?.message || "فشل التحديث", "error");
    }
  }

  async function handleDelete(id) {
    try {
      await remove(id);
      toast("تم حذف الإشعار", "success");
    } catch (err) {
      toast(err?.message || "فشل الحذف", "error");
    }
  }

  function handleUpdate(id, notification) {
    toast("ميزة التحديث قيد التطوير", "info");
  }

  return (
    <section className="notif-panel" dir="rtl">
      <div className="notif-panel-head">
        <div className="notif-panel-title">
          <h3>{title}</h3>
          {unreadCount > 0 && (
            <span className="notif-count notif-count--unread">
              {unreadCount} جديد
            </span>
          )}
          <span className="notif-count">{items.length}</span>
        </div>

        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-panel-mark-all"
              onClick={async () => {
                await markAllAsRead();
                toast("تم تعيين الكل كمقروء", "success");
              }}
              disabled={loading}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--green-600)',
                background: 'var(--green-50)',
                padding: '4px 12px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              تعليم الكل كمقروء
            </button>
          )}

          {showRefresh && (
            <button
              className="notif-panel-refresh"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              title="تحديث"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={refreshing ? "notif-panel-refresh__spin" : ""}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="notif-skeleton-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="notif-skeleton" />
          ))}
        </div>
      )}

      {!loading && error && <div className="notif-empty">{error}</div>}

      {!loading && !error && visible.length === 0 && (
        <div className="notif-empty">لا توجد إشعارات حالياً.</div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="notif-card-list">
          {visible.map((n, idx) => (
            <NotificationCard
              key={n._id || n.id || idx}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
