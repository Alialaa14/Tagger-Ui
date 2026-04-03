import axios from "axios";
import { API_BASE, pickArray, pickObject, requestWithFallback, unwrapPayload, withCreds } from "./shared";

const NOTIF_BASE = `${API_BASE}/notification`;

function pickNotifications(payload) {
  return pickArray(payload, ["notifications", "results"]);
}

function pickNotification(payload) {
  return pickObject(payload, ["notification"]);
}

// ─── Fetch all notifications (with optional limit & page) ─────────────────────
export async function fetchNotifications({ limit = 10, page = 1 } = {}) {
  const response = await requestWithFallback(
    [
      () => axios.get(NOTIF_BASE, { ...withCreds(), params: { limit, page } }),
      () => axios.get(`${API_BASE}/notifications`, { ...withCreds(), params: { limit, page } }),
    ],
    "No notifications endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickNotifications(payload);
}

// ─── Get single notification by ID ───────────────────────────────────────────
export async function getNotificationById(id) {
  if (!id) throw new Error("id is required");
  const response = await axios.get(`${NOTIF_BASE}/${id}`, withCreds());
  const payload = unwrapPayload(response);
  return pickNotification(payload) || payload;
}

// ─── Update a notification by ID ─────────────────────────────────────────────
export async function updateNotification(id, updates = {}) {
  if (!id) throw new Error("id is required");
  if (!updates || Object.keys(updates).length === 0) throw new Error("updates payload is required");
  const response = await axios.patch(`${NOTIF_BASE}/${id}`, updates, withCreds());
  const payload = unwrapPayload(response);
  return pickNotification(payload) || payload;
}

// ─── Delete a notification by ID ─────────────────────────────────────────────
export async function deleteNotification(id) {
  if (!id) throw new Error("id is required");
  const response = await axios.delete(`${NOTIF_BASE}/${id}`, withCreds());
  const payload = unwrapPayload(response);
  return payload;
}

// ─── Send to all (via socket, kept for compatibility) ────────────────────────
export async function sendNotificationToAll(message, extra = {}) {
  if (!message || !String(message).trim()) throw new Error("message is required");
  const payload = { message, ...extra };
  const response = await requestWithFallback(
    [
      () => axios.post(`${NOTIF_BASE}/broadcast`, payload, withCreds()),
      () => axios.post(`${NOTIF_BASE}/all`, payload, withCreds()),
      () => axios.post(NOTIF_BASE, { ...payload, target: "all" }, withCreds()),
    ],
    "No notification broadcast endpoint responded."
  );
  const data = unwrapPayload(response);
  return pickNotification(data) || data;
}

// ─── Send to specific user (via socket, kept for compatibility) ───────────────
export async function sendNotificationToUser(userId, message, extra = {}) {
  if (!userId) throw new Error("userId is required");
  if (!message || !String(message).trim()) throw new Error("message is required");
  const payload = { message, ...extra };
  const response = await requestWithFallback(
    [
      () => axios.post(`${NOTIF_BASE}/user/${userId}`, payload, withCreds()),
      () => axios.post(`${NOTIF_BASE}/send`, { userId, ...payload }, withCreds()),
      () => axios.post(NOTIF_BASE, { userId, ...payload }, withCreds()),
    ],
    "No notification send endpoint responded."
  );
  const data = unwrapPayload(response);
  return pickNotification(data) || data;
}
