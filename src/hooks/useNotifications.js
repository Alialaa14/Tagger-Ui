/**
 * useNotifications
 * ─────────────────
 * Central hook for the notification system.
 * Handles:
 *   • Fetching all notifications (GET /api/v1/notification)
 *   • Fetching a single notification (GET /api/v1/notification/:id)
 *   • Real-time reception via socket.on('newNotification')
 *   • Marking notifications as read (optimistic update)
 *   • Deleting notifications
 *   • Updating notifications
 *   • Unread count badge
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import socket from '../socket'

const API_BASE = '/api/v1/notification'

const withCreds = { withCredentials: true }

// ─── main hook ───────────────────────────────────────────────────────────────

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // keep a ref so socket callback always has fresh state
  const notificationsRef = useRef(notifications)
  notificationsRef.current = notifications

  // ── fetch all ─────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await axios.get(API_BASE, withCreds)
      const payload = data?.data ?? data
      const list = Array.isArray(payload)
        ? payload
        : (payload.notifications ?? payload.results ?? [])
      setNotifications(list)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── fetch single ─────────────────────────────────────────────────────────
  const fetchById = useCallback(async (id) => {
    try {
      const { data } = await axios.get(`${API_BASE}/${id}`, withCreds)
      const payload = data?.data ?? data
      return Array.isArray(payload) ? payload[0] : (payload.notification ?? payload)
    } catch (err) {
      throw new Error(err?.response?.data?.message || err.message || 'Failed to load notification')
    }
  }, [])

  // ── mark one as read (optimistic) ────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    if (!id) {
      console.error("markAsRead called with undefined ID");
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n))
    )
    try {
      await axios.patch(`/api/v1/notifications/${id}/read`, {}, withCreds)
    } catch (err1) {
      try {
        await axios.patch(`${API_BASE}/${id}/read`, {}, withCreds)
      } catch (err2) {
        console.error("Failed to mark as read. Primary Error:", err1);
        console.error("Fallback Error:", err2);
      }
    }
  }, [])

  // ── mark all as read ─────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })))
    try {
      await axios.patch(`/api/v1/notifications/read-all`, {}, withCreds)
    } catch (err1) {
      try {
        await axios.patch(`${API_BASE}/read-all`, {}, withCreds)
      } catch (err2) {
        console.error("Failed to mark all as read. Primary Error:", err1);
        console.error("Fallback Error:", err2);
      }
    }
  }, [])


  // ── update one (optimistic) ──────────────────────────────────────────────
  const update = useCallback(async (id, data) => {
    try {
      const { data: res } = await axios.put(`${API_BASE}/${id}`, data, withCreds)
      const payload = res?.data ?? res
      const updated = payload.notification ?? payload
      setNotifications((prev) =>
        prev.map((n) => ((n._id ?? n.id) === id ? { ...n, ...updated } : n))
      )
      return updated
    } catch (err) {
      throw new Error(err?.response?.data?.message || err.message || 'Failed to update notification')
    }
  }, [])

  // ── socket: real-time new notification ───────────────────────────────────
  useEffect(() => {
    fetchAll()

    const handleNew = (notification) => {
      const exists = notificationsRef.current.some(
        (n) => (n._id ?? n.id) === (notification._id ?? notification.id)
      )
      if (!exists) {
        setNotifications((prev) => [{ ...notification, read: false, isRead: false }, ...prev])
      }
    }

    socket.on('newNotification', handleNew)
    return () => {
      socket.off('newNotification', handleNew)
    }
  }, [fetchAll])

  // ── derived ───────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchAll,
    fetchById,
    markAsRead,
    markAllAsRead,
    update,
  }
}

// ─── single-notification hook (used in detail page) ─────────────────────────

export function useNotificationDetail(id) {
  const [notification, setNotification] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await axios.get(`${API_BASE}/${id}`, withCreds)
        if (!cancelled) {
          const payload = data?.data ?? data
          const n = Array.isArray(payload) ? payload[0] : (payload.notification ?? payload)
          setNotification(n)
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || err.message || 'Failed to load notification')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  return { notification, isLoading, error }
}
