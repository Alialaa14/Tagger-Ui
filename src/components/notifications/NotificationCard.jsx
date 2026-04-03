import React, { useState } from "react";
import "./NotificationCard.css";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BellIcon({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function EditIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  onUpdate,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);

  const id = notification._id || notification.id;
  const isRead = notification.isRead;

  async function handleMarkRead() {
    if (isRead || !onMarkRead) return;
    setMarkingRead(true);
    try {
      await onMarkRead(id);
    } catch {
      /* error handled by parent */
    } finally {
      setMarkingRead(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <article
      className={`notif-card ${isRead ? "notif-card--read" : "notif-card--unread"}`}
      dir="rtl"
    >
      {/* Unread indicator dot */}
      {!isRead && <span className="notif-card__dot" aria-label="غير مقروء" />}

      {/* Icon */}
      <div className="notif-card__icon-wrap">
        <BellIcon className="notif-card__icon" />
      </div>

      {/* Content */}
      <div className="notif-card__body">
        <p className="notif-card__message">
          {notification.message || notification.text || "—"}
        </p>
        <div className="notif-card__meta">
          <span className="notif-card__date">
            {formatDate(notification.createdAt || notification.date)}
          </span>
          {notification.createdAt && (
            <span className="notif-card__time">
              {formatTime(notification.createdAt)}
            </span>
          )}
          {notification.sender && (
            <span className="notif-card__sender">مرسل: {notification.sender}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="notif-card__actions">
        {!isRead && onMarkRead && (
          <button
            className="notif-card__action notif-card__action--read"
            onClick={handleMarkRead}
            disabled={markingRead}
            title="تعيين كمقروء"
          >
            {markingRead ? (
              <span className="notif-card__spinner" />
            ) : (
              <CheckIcon />
            )}
          </button>
        )}

        {onUpdate && (
          <button
            className="notif-card__action notif-card__action--edit"
            onClick={() => onUpdate(id, notification)}
            title="تحديث"
          >
            <EditIcon />
          </button>
        )}

        {onDelete &&
          (confirmDelete ? (
            <div className="notif-card__confirm">
              <button
                className="notif-card__action notif-card__action--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <span className="notif-card__spinner" />
                ) : (
                  "تأكيد"
                )}
              </button>
              <button
                className="notif-card__action notif-card__action--cancel"
                onClick={() => setConfirmDelete(false)}
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              className="notif-card__action notif-card__action--delete"
              onClick={() => setConfirmDelete(true)}
              title="حذف"
            >
              <TrashIcon />
            </button>
          ))}
      </div>
    </article>
  );
}
