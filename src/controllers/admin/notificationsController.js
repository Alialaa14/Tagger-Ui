import axios from "axios";
import { API_BASE, pickArray, pickObject, requestWithFallback, unwrapPayload, withCreds } from "./shared";

const NOTIF_BASE = `${API_BASE}/notification`;

function pickNotifications(payload) {
  return pickArray(payload, ["notifications", "results"]);
}

function pickNotification(payload) {
  return pickObject(payload, ["notification"]);
}

export async function fetchNotifications() {
  const response = await requestWithFallback(
    [
      () => axios.get(NOTIF_BASE, withCreds()),
      () => axios.get(`${API_BASE}/notifications`, withCreds()),
    ],
    "No notifications endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickNotifications(payload);
}

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
