import { io } from "socket.io-client";

// Singleton socket instance — connects to local development server
const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  // allow cookies to be sent on the socket handshake
  withCredentials: true,
});

export default socket;
