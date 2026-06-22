// drizzle.config.js
// Tells drizzle-kit where the schema is and how to connect, so it can
// generate and run migrations.

import "dotenv/config";

export default {
  schema: "./src/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
