// server.js
// Entry point for the Express app.

import express from "express";
import cors from "cors";
import { router as productRoutes } from "./routes.js";
import "dotenv/config";

const app = express();

app.use(cors()); // allow the frontend (different origin) to call this API
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Product browsing API is running" });
});

app.use(productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
