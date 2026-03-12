export const API_BASE = "http://localhost:3000/api/v1";

export function unwrapPayload(response) {
  return response?.data?.data ?? response?.data;
}

export function pickArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") {
    for (const key of keys) {
      if (Array.isArray(payload.data?.[key])) return payload.data[key];
    }
  }
  return [];
}

export function pickObject(payload, keys = []) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }
  for (const key of keys) {
    if (payload?.[key] && typeof payload[key] === "object") return payload[key];
  }
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return null;
}

export async function requestWithFallback(requests, errorMessage) {
  let lastError = null;
  for (const run of requests) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status && status !== 404 && status !== 405) {
        throw error;
      }
    }
  }
  throw lastError || new Error(errorMessage || "No endpoint responded.");
}

export function withCreds(config = {}) {
  return { withCredentials: true, ...config };
}

export function normalizeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
