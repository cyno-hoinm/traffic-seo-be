import { io as Client } from "socket.io-client";

// Connect to your server
const socket = Client(process.env.DEV_URL || "http://localhost:9999"); // Adjust port if different

// Handle connection
socket.on("connect", () => {
  console.log("Connected to server");
  
  // Join a user's room (replace 123 with actual user ID)
  const userId = 3;
  socket.emit("join", userId);
  console.log(`Joined room for user ${userId}`);
});

// Listen for notifications
socket.on("newNotification", (notification) => {
  console.log("Received new notification:", notification);
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// Keep the process running
process.on("SIGINT", () => {
  socket.disconnect();
  process.exit();
}); 