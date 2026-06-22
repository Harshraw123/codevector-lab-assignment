// server.js
// Entry point for the Express app.

import express from "express";
import cors from "cors";
import { router as productRoutes } from "./routes.js";
import "dotenv/config";

const app = express();

const allowedOrigins = [
  "https://codevector-lab-assignment.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Product browsing API is running" });
});

app.use(productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
