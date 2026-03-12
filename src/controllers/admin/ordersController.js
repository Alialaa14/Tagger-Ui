import axios from "axios";
import { API_BASE, pickArray, pickObject, requestWithFallback, unwrapPayload, withCreds } from "./shared";

const ORDER_BASE = `${API_BASE}/order`;

function pickOrders(payload) {
  return pickArray(payload, ["orders", "results"]);
}

function pickOrder(payload) {
  return pickObject(payload, ["order"]);
}

export async function fetchAdminOrders() {
  const response = await requestWithFallback(
    [
      () => axios.get(ORDER_BASE, withCreds()),
      () => axios.get(`${API_BASE}/orders`, withCreds()),
    ],
    "No orders endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickOrders(payload);
}

export async function fetchOrderById(orderId) {
  if (!orderId) throw new Error("orderId is required");
  const response = await requestWithFallback(
    [
      () => axios.get(`${ORDER_BASE}/${orderId}`, withCreds()),
      () => axios.get(`${API_BASE}/orders/${orderId}`, withCreds()),
    ],
    "No order endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickOrder(payload) || payload;
}

export async function updateOrderStatus(orderId, status, extra = {}) {
  if (!orderId) throw new Error("orderId is required");
  const body = { status, ...extra };
  const response = await requestWithFallback(
    [
      () => axios.patch(`${ORDER_BASE}/${orderId}/status`, body, withCreds()),
      () => axios.patch(`${ORDER_BASE}/${orderId}`, body, withCreds()),
      () => axios.patch(`${API_BASE}/orders/${orderId}`, body, withCreds()),
    ],
    "No order update endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickOrder(payload) || payload;
}

export async function updateOrderById(orderId, updates) {
  if (!orderId) throw new Error("orderId is required");
  const response = await requestWithFallback(
    [
      () => axios.patch(`${ORDER_BASE}/${orderId}`, updates, withCreds()),
      () => axios.patch(`${API_BASE}/orders/${orderId}`, updates, withCreds()),
      () => axios.put(`${ORDER_BASE}/${orderId}`, updates, withCreds()),
    ],
    "No order update endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickOrder(payload) || payload;
}

export async function forwardOrderToTrader(orderId, payload) {
  if (!orderId) throw new Error("orderId is required");
  const response = await requestWithFallback(
    [
      () => axios.patch(`${ORDER_BASE}/${orderId}/forward`, payload, withCreds()),
      () => axios.patch(`${ORDER_BASE}/${orderId}/assign`, payload, withCreds()),
      () => axios.patch(`${ORDER_BASE}/${orderId}`, { status: "forwarded", ...payload }, withCreds()),
    ],
    "No order forward endpoint responded."
  );
  const data = unwrapPayload(response);
  return pickOrder(data) || data;
}

export async function deleteOrderById(orderId) {
  if (!orderId) throw new Error("orderId is required");
  await requestWithFallback(
    [
      () => axios.delete(`${ORDER_BASE}/${orderId}`, withCreds()),
      () => axios.delete(`${API_BASE}/orders/${orderId}`, withCreds()),
    ],
    "No order delete endpoint responded."
  );
}
