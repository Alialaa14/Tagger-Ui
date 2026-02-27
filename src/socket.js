import { io } from "socket.io-client";

// Singleton socket instance — connects to local development server
const SOCKET_URL = "http://localhost:3000";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="));
  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : null;
}

// read token from cookies (key: access_token)
const token = getCookie("access_token");

const socket = io(SOCKET_URL, {
  autoConnect: true,
  // allow cookies to be sent on the socket handshake
  withCredentials: true,
  auth: { token },
});

// call this if token changes (e.g. after login) to refresh socket auth
export function refreshAuthFromCookies() {
  const t = getCookie("access_token");
  socket.auth = { token: t };
  if (socket.connected) {
    socket.disconnect();
    socket.connect();
  }
}

export default socket;
