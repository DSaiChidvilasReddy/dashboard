import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export default socket;