import { io as Client } from "socket.io-client";

// Connect to your server
const socket = Client(process.env.DEV_URL || "http://localhost:9999"); // Adjust port if different

// Handle connection
socket.on("connect", () => {
  // Join a user's room (replace 123 with actual user ID)
  const userId = 3;
  socket.emit("join", userId);
});

// Listen for notifications
socket.on("newNotification", (notification) => {
  // Handle disconnection
  console.log(notification);
  socket.disconnect();
  process.exit();
});

// Handle disconnection
socket.on("disconnect", () => {
  process.exit();
});

// Keep the process running
process.on("SIGINT", () => {
  socket.disconnect();
  process.exit();
}); 