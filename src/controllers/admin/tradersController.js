import axios from "axios";
import { API_BASE, pickArray, pickObject, requestWithFallback, unwrapPayload, withCreds } from "./shared";

const AUTH_BASE = `${API_BASE}/auth`;

function pickUsers(payload) {
  return pickArray(payload, ["users", "results"]);
}

function pickUser(payload) {
  return pickObject(payload, ["user"]);
}

function filterTraders(users) {
  return (users || []).filter((u) => String(u?.role || "").toLowerCase() === "trader");
}

export async function fetchTraderUsers() {
  const response = await requestWithFallback(
    [
      () => axios.get(`${API_BASE}/user?role=trader`, withCreds()),
      () => axios.get(`${API_BASE}/users?role=trader`, withCreds()),
      () => axios.get(`${AUTH_BASE}/get-users?role=trader`, withCreds()),
      () => axios.get(`${AUTH_BASE}/get-users`, withCreds()),
    ],
    "No traders endpoint responded."
  );
  const payload = unwrapPayload(response);
  const users = pickUsers(payload);
  return filterTraders(users);
}

export async function fetchTraderById(userId) {
  if (!userId) throw new Error("userId is required");
  const response = await requestWithFallback(
    [
      () => axios.get(`${API_BASE}/user/${userId}`, withCreds()),
      () => axios.get(`${API_BASE}/users/${userId}`, withCreds()),
      () => axios.get(`${AUTH_BASE}/user/${userId}`, withCreds()),
    ],
    "No trader endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickUser(payload) || payload;
}

export async function updateTraderById(userId, updates) {
  if (!userId) throw new Error("userId is required");
  const response = await requestWithFallback(
    [
      () => axios.patch(`${AUTH_BASE}/update-profile/?id=${userId}`, updates, withCreds()),
      () => axios.patch(`${API_BASE}/user/${userId}`, updates, withCreds()),
      () => axios.patch(`${API_BASE}/users/${userId}`, updates, withCreds()),
    ],
    "No trader update endpoint responded."
  );
  const payload = unwrapPayload(response);
  return pickUser(payload) || payload;
}

export async function deleteTraderById(userId) {
  if (!userId) throw new Error("userId is required");
  await requestWithFallback(
    [
      () => axios.delete(`${API_BASE}/user/${userId}`, withCreds()),
      () => axios.delete(`${API_BASE}/users/${userId}`, withCreds()),
      () => axios.delete(`${AUTH_BASE}/user/${userId}`, withCreds()),
    ],
    "No trader delete endpoint responded."
  );
}
