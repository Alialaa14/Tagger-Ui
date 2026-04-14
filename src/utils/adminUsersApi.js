import axios from "axios";

const API_BASE = "/api/v1/auth";

function pickUsersArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function pickSingleUser(payload) {
  if (!payload) return null;
  if (payload.user && typeof payload.user === "object") return payload.user;
  if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  )
    return payload.data;
  if (typeof payload === "object" && !Array.isArray(payload)) return payload;
  return null;
}

async function requestWithFallback(requests) {
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

  throw lastError || new Error("No users endpoint responded.");
}

export async function fetchUsers() {
  const response = await requestWithFallback([
    () => axios.get(`${API_BASE}/get-users`, { withCredentials: true }),
  ]);

  const payload = response?.data?.data ?? response?.data;
  return pickUsersArray(payload);
}

export async function fetchUserById(userId) {
  if (!userId) throw new Error("userId is required");

  const response = await requestWithFallback([
    () => axios.get(`${API_BASE}/user/${userId}`, { withCredentials: true }),
  ]);

  const payload = response?.data?.data ?? response?.data;
  console.log(payload);
  return pickSingleUser(payload);
}

export async function updateUserById(userId, updates) {
  if (!userId) throw new Error("userId is required");

  const response = await requestWithFallback([
    () =>
      axios.patch(`${API_BASE}/update-profile/?id=${userId}`, updates, {
        withCredentials: true,
      }),
  ]);

  const payload = response?.data?.data ?? response?.data;
  return pickSingleUser(payload);
}

export async function deleteUserById(userId) {
  if (!userId) throw new Error("userId is required");

  await requestWithFallback([
    () => axios.delete(`${API_BASE}/user/${userId}`, { withCredentials: true }),
  ]);
}

export async function createAdminUser(userData) {
  const response = await requestWithFallback([
    () => axios.post(`${API_BASE}/admin`, userData, { withCredentials: true }),
  ]);

  const payload = response?.data?.data ?? response?.data;
  return pickSingleUser(payload);
}
