import axios from "axios";
import { API_BASE, unwrapPayload, withCreds, pickArray, requestWithFallback } from "./admin/shared";

const INVENTORY_BASE = `${API_BASE}/inventory`;

/**
 * Fetch current user's inventory
 * GET /api/v1/inventory/my?source=platform|custom&lowStock=true
 */
export async function fetchMyInventory(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(`${INVENTORY_BASE}/my?${query}`, withCreds());
  return unwrapPayload(response);
}

/**
 * Link a platform product to inventory
 * POST /api/v1/inventory/platform
 */
export async function createPlatformInventory(data) {
  const response = await axios.post(`${INVENTORY_BASE}/platform`, data, withCreds());
  return unwrapPayload(response);
}

/**
 * Create a custom product entry in inventory
 * POST /api/v1/inventory/custom
 */
export async function createCustomInventory(formData) {
  const response = await axios.post(`${INVENTORY_BASE}/custom`, formData, {
    ...withCreds(),
    headers: { "Content-Type": "multipart/form-data" }
  });
  return unwrapPayload(response);
}

/**
 * Update inventory (Custom details or Low Stock Threshold)
 * PATCH /api/v1/inventory/:id
 */
export async function updateInventory(id, data) {
  const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
  const response = await axios.patch(`${INVENTORY_BASE}/${id}`, data, {
    ...withCreds(),
    headers
  });
  return unwrapPayload(response);
}

/**
 * Delete inventory entry
 * DELETE /api/v1/inventory/:id
 */
export async function deleteInventory(id) {
  const response = await axios.delete(`${INVENTORY_BASE}/${id}`, withCreds());
  return unwrapPayload(response);
}

/**
 * Stock In movement
 * POST /api/v1/inventory/:id/stock-in
 */
export async function stockIn(id, quantity, note = "") {
  const response = await axios.post(`${INVENTORY_BASE}/${id}/stock-in`, { quantity, note }, withCreds());
  return unwrapPayload(response);
}

/**
 * Stock Out movement
 * POST /api/v1/inventory/:id/stock-out
 */
export async function stockOut(id, quantity, note = "") {
  const response = await axios.post(`${INVENTORY_BASE}/${id}/stock-out`, { quantity, note }, withCreds());
  return unwrapPayload(response);
}

/**
 * Adjust Stock movement
 * POST /api/v1/inventory/:id/adjust
 */
export async function adjustStock(id, quantity, note = "") {
  const response = await axios.post(`${INVENTORY_BASE}/${id}/adjust`, { quantity, note }, withCreds());
  return unwrapPayload(response);
}

/**
 * Get Inventory Logs
 * GET /api/v1/inventory/:id/logs
 */
export async function fetchInventoryLogs(id, params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(`${INVENTORY_BASE}/${id}/logs?${query}`, withCreds());
  return unwrapPayload(response);
}
