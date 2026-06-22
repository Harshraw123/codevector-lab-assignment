// db.js
// Sets up the Drizzle ORM client connected to Neon Postgres.
// Neon's "serverless" driver works over HTTP, which is perfect for
// short-lived backend requests (and for deploying to Render's free tier).

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Did you create a .env file?");
}

const sql = neon(process.env.DATABASE_URL);

// `db` is what we import everywhere else to run queries.
export const db = drizzle(sql, { schema });
