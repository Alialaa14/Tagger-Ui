import axios from "axios";
import { API_BASE, pickArray, pickObject, requestWithFallback, unwrapPayload, withCreds } from "./admin/shared";

const NOTIF_BASE = `${API_BASE}/notification`;

function pickNotifications(payload) {
  return pickArray(payload, ["notifications", "results"]);
}

function pickNotification(payload) {
  return pickObject(payload, ["notification"]);
}

export async function fetchMyNotifications() {
  const response = await requestWithFallback(
    [
      () => axios.get(`${NOTIF_BASE}/my`, withCreds()),
      () => axios.get(NOTIF_BASE, withCreds()),
      () => axios.get(`${API_BASE}/notifications`, withCreds()),
    ],
    "No notifications endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickNotifications(payload);
}

export async function markNotificationRead(notificationId) {
  if (!notificationId) throw new Error("notificationId is required");
  const response = await requestWithFallback(
    [
      () => axios.patch(`http://localhost:3000/api/v1/notifications/${notificationId}/read`, {}, withCreds()),
      () => axios.patch(`${NOTIF_BASE}/${notificationId}/read`, {}, withCreds()),
      () => axios.patch(`${NOTIF_BASE}/${notificationId}`, { isRead: true }, withCreds()),
    ],
    "No notification update endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickNotification(payload) || payload;
}



export async function updateNotification(notificationId, data) {
  if (!notificationId) throw new Error("notificationId is required");
  if (!data || typeof data !== "object") throw new Error("update data is required");
  const response = await requestWithFallback(
    [
      () => axios.patch(`${NOTIF_BASE}/${notificationId}`, data, withCreds()),
    ],
    "No notification update endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickNotification(payload) || payload;
}
