import axios from "axios";
import { API_BASE, unwrapPayload, withCreds, pickArray, requestWithFallback } from "./shared";

const TRADER_PROD_BASE = `${API_BASE}/trader-products`;

/**
 * Fetch products for a specific trader by ID
 * Using the endpoint: GET /api/v1/trader-products/trader/:traderId
 */
export async function fetchProductsByTraderId(traderId) {
  if (!traderId) throw new Error("traderId is required");
  const response = await axios.get(`${TRADER_PROD_BASE}/trader/${traderId}`, withCreds());
  const payload = unwrapPayload(response);
  return pickArray(payload, ["products", "results"]) || payload;
}

/**
 * Admin Update of a Trader's Product
 * PATCH /api/v1/trader-products/:id
 */
export async function updateTraderProduct(id, data) {
  if (!id) throw new Error("Product ID is required");
  const response = await axios.patch(`${TRADER_PROD_BASE}/${id}`, data, withCreds());
  return unwrapPayload(response);
}

/**
 * Admin Deletion of a Trader's Product
 * DELETE /api/v1/trader-products/:id
 */
export async function deleteTraderProduct(id) {
  if (!id) throw new Error("Product ID is required");
  const response = await axios.delete(`${TRADER_PROD_BASE}/${id}`, withCreds());
  return unwrapPayload(response);
}
