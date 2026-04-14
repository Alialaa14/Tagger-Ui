import { io } from "socket.io-client";
import toast from "./utils/toast";

// Singleton socket instance — connects to local development server
const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  // allow cookies to be sent on the socket handshake
  withCredentials: true,
});

socket.on("error", (err) => {
  const msg = typeof err === "object" ? err.message || JSON.stringify(err) : String(err);
  toast(msg, "error");
});

export function connectSocket(user) {
  if (user && !socket.connected) {
    socket.auth = {
      userId: user._id || user.id,
      role: user.role || user.accountType
    };
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export function emitSendOrder(payload) {
  socket.emit("sendOrder", payload);
}

export function onSendOrder(handler) {
  socket.on("sendOrder", handler);
}

export function offSendOrder(handler) {
  socket.off("sendOrder", handler);
}

export function onOrderCreated(handler) {
  socket.on("orderCreated", handler);
}

export function offOrderCreated(handler) {
  socket.off("orderCreated", handler);
}

export default socket;
