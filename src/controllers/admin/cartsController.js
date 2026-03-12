import axios from "axios";
import { API_BASE, pickArray, pickObject, requestWithFallback, unwrapPayload, withCreds } from "./shared";

const CART_BASE = `${API_BASE}/cart`;

function pickCarts(payload) {
  return pickArray(payload, ["carts", "cartItems", "results"]);
}

function pickCart(payload) {
  return pickObject(payload, ["cart"]);
}

export async function fetchAllCarts() {
  const response = await requestWithFallback(
    [
      () => axios.get(`${CART_BASE}/get-carts`, withCreds()),
      () => axios.get(`${CART_BASE}/carts`, withCreds()),
      () => axios.get(CART_BASE, withCreds()),
    ],
    "No carts endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickCarts(payload);
}

export async function fetchCartByUser(userId) {
  if (!userId) throw new Error("userId is required");
  const response = await requestWithFallback(
    [
      () => axios.get(`${CART_BASE}/user/${userId}`, withCreds()),
      () => axios.get(`${CART_BASE}/by-user/${userId}`, withCreds()),
      () => axios.get(`${CART_BASE}/${userId}`, withCreds()),
    ],
    "No cart endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickCart(payload) || payload;
}

export async function fetchCartsByRole(role) {
  if (!role) throw new Error("role is required");
  const encoded = encodeURIComponent(role);
  const response = await requestWithFallback(
    [
      () => axios.get(`${CART_BASE}?role=${encoded}`, withCreds()),
      () => axios.get(`${CART_BASE}/role/${encoded}`, withCreds()),
      () => axios.get(`${CART_BASE}/by-role/${encoded}`, withCreds()),
      () => axios.get(`${CART_BASE}/carts?role=${encoded}`, withCreds()),
    ],
    "No carts endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickCarts(payload);
}

export async function updateCartByUser(userId, updates) {
  if (!userId) throw new Error("userId is required");
  const response = await requestWithFallback(
    [
      () => axios.patch(`${CART_BASE}/user/${userId}`, updates, withCreds()),
      () => axios.patch(`${CART_BASE}/by-user/${userId}`, updates, withCreds()),
      () => axios.patch(`${CART_BASE}/${userId}`, updates, withCreds()),
    ],
    "No cart update endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickCart(payload) || payload;
}

export async function clearCartByUser(userId) {
  if (!userId) throw new Error("userId is required");
  await requestWithFallback(
    [
      () => axios.delete(`${CART_BASE}/user/${userId}`, withCreds()),
      () => axios.delete(`${CART_BASE}/by-user/${userId}`, withCreds()),
      () => axios.delete(`${CART_BASE}/${userId}`, withCreds()),
    ],
    "No cart delete endpoint responded."
  );
}
