// schema.js
// This file defines our database table structure using Drizzle ORM.
// Drizzle generates SQL migrations from this file, so it's the single
// source of truth for our database shape.

import { pgTable, serial, varchar, numeric, timestamp, index } from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    // serial = auto-incrementing integer primary key (1, 2, 3, ...)
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    // category is a plain string column, but we index it (below)
    // because we filter by it constantly.
    category: varchar("category", { length: 50 }).notNull(),

    // numeric is used for money instead of float, to avoid rounding errors.
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),

    // defaultNow() lets Postgres set this automatically on insert.
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => {
    return {
      // CRITICAL INDEX for pagination performance.
      // We always sort by (created_at DESC, id DESC) and filter by category.
      // A composite index matching this exact sort order means Postgres can
      // walk the index directly instead of scanning + sorting the whole table.
      categoryCreatedIdx: index("idx_products_category_created_id").on(
        table.category,
        table.createdAt,
        table.id
      ),
      // Index for browsing ALL categories (no filter) — same sort, no category.
      createdIdx: index("idx_products_created_id").on(table.createdAt, table.id),
    };
  }
);
