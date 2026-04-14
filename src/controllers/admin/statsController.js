import axios from "axios";
import { API_BASE, unwrapPayload, withCreds, requestWithFallback } from "./shared";

const STATS_BASE = `${API_BASE}/order/stats`;

/**
 * Fetch global order statistics (Admin only)
 */
export async function fetchOrderStats(startDate, endDate) {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axios.get(STATS_BASE, withCreds({ params }));
  return unwrapPayload(response);
}

/**
 * Fetch statistics for a specific user (Trader or Shop)
 */
export async function fetchUserOrderStats(userId, startDate, endDate) {
  if (!userId) throw new Error("userId is required for specific stats");
  
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axios.get(`${STATS_BASE}/${userId}`, withCreds({ params }));
  // Backend returns: { data: { user: {...}, statistics: {...} } }
  // unwrapPayload gives us res.data.data → { user, statistics }
  return unwrapPayload(response);
}

/**
 * Fetch all users for the selection dropdown
 */
export async function fetchUsers() {
  const response = await requestWithFallback([
    () => axios.get(`${API_BASE}/auth/get-users`, withCreds()),
    () => axios.get(`${API_BASE}/users`, withCreds()),
  ], "Failed to fetch users list");
  const payload = unwrapPayload(response);
  return payload?.data?.users || payload?.users || payload?.results || [];
}
