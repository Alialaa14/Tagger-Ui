import { io } from "socket.io-client";

// Singleton socket instance — connects to local development server
const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  // allow cookies to be sent on the socket handshake
  withCredentials: true,
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

export default socket;
