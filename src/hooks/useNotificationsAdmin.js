import { useCallback, useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markNotificationRead,
  deleteNotification,
  updateNotification,
} from "../controllers/notificationsController";

export default function useNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMyNotifications();
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "فشل تحميل الإشعارات."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markRead = useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setItems((prev) =>
        prev.map((n) => {
          const id = n._id || n.id;
          return id === notificationId ? { ...n, isRead: true } : n;
        })
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const remove = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setItems((prev) =>
        prev.filter((n) => {
          const id = n._id || n.id;
          return id !== notificationId;
        })
      );
    } catch (err) {
      throw err;
    }
  }, []);

  const update = useCallback(async (notificationId, data) => {
    try {
      const updated = await updateNotification(notificationId, data);
      setItems((prev) =>
        prev.map((n) => {
          const id = n._id || n.id;
          return id === notificationId ? { ...n, ...updated } : n;
        })
      );
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const unreadCount = items.filter((n) => !n.isRead).length;

  return {
    items,
    loading,
    error,
    unreadCount,
    fetchAll,
    markRead,
    remove,
    update,
  };
}
