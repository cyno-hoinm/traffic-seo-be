import { connectDB } from "./database/connect";
import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log("Server running on port :", PORT);
  connectDB();
});
