import { io as Client } from "socket.io-client";

// Connect to your server
const socket = Client(process.env.DEV_URL || "http://localhost:9999");

// Handle connection
socket.on("connect", () => {
  // Join a user's room (replace 123 with actual user ID)
  const userId = 5;
  socket.emit("join", userId);
});

// Listen for notifications
socket.on("newNotification", (notification) => {
});

// Handle disconnection
socket.on("disconnect", () => {
});

// Keep the process running
process.on("SIGINT", () => {
  socket.disconnect();
  process.exit();
}); 