// routes.js
// Contains the /products endpoint and all the pagination logic.
// This is the most important file in the project — read the comments
// carefully, especially around "snapshot" and "cursor".

import express from "express";
import { db } from "./db.js";
import { products } from "./schema.js";
import { and, eq, lte, sql, desc } from "drizzle-orm";

export const router = express.Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Helper: turn a cursor object into a base64 string for the API response.
// We do this so cursors are opaque to the client (they shouldn't need to
// understand or construct them manually).
function encodeCursor(cursorObj) {
  return Buffer.from(JSON.stringify(cursorObj)).toString("base64");
}

function decodeCursor(cursorStr) {
  try {
    const json = Buffer.from(cursorStr, "base64").toString("utf-8");
    const obj = JSON.parse(json);
    if (!obj.createdAt || !obj.id) throw new Error("invalid cursor shape");
    return obj;
  } catch {
    throw new Error("Invalid cursor format");
  }
}

router.get("/products", async (req, res) => {
  try {
    const { category, cursor } = req.query;

    // ---- 1. Parse and clamp the limit ----
    let limit = parseInt(req.query.limit, 10) || DEFAULT_LIMIT;
    limit = Math.min(Math.max(limit, 1), MAX_LIMIT);

    // ---- 2. Determine the snapshot ----
    // The snapshot is a fixed point in time that represents "when this
    // browsing session started". On page 1 (no snapshot given), we create
    // one using the current timestamp. On later pages, the client sends
    // back the SAME snapshot it got on page 1.
    //
    // Why this matters: if 50 new products get inserted while the user is
    // browsing, those products have created_at AFTER the snapshot. By
    // filtering `created_at <= snapshot` on every page, new inserts are
    // invisible to this browsing session until the user starts a fresh one
    // (e.g. by refreshing). This is what prevents "skip" and "duplicate"
    // bugs caused by the data shifting underneath OFFSET-based pagination.
    const snapshot = req.query.snapshot ? new Date(req.query.snapshot) : new Date();
    if (isNaN(snapshot.getTime())) {
      return res.status(400).json({ error: "Invalid snapshot timestamp" });
    }

    // ---- 3. Build the WHERE conditions ----
    const conditions = [lte(products.createdAt, snapshot)];

    if (category) {
      conditions.push(eq(products.category, category));
    }

    // ---- 4. Apply the cursor (keyset pagination) ----
    // We order rows by (created_at DESC, id DESC). The cursor stores the
    // (created_at, id) of the LAST row the client saw. To get the "next"
    // page we want rows strictly AFTER that point in the same ordering,
    // i.e. rows whose (created_at, id) tuple is smaller.
    //
    // Postgres supports row-value comparison directly, which lets us
    // express "smaller in this exact sort order" in a single comparison
    // instead of an OR/AND mess. This is why we don't use OFFSET: OFFSET
    // re-scans and re-counts every row before the offset, every time
    // (slow at 200k rows, and unstable if rows are inserted/deleted).
    if (cursor) {
      const decoded = decodeCursor(cursor);
      conditions.push(
        sql`(${products.createdAt}, ${products.id}) < (${new Date(decoded.createdAt)}, ${decoded.id})`
      );
    }

    // ---- 5. Run the query ----
    // updatedAt is intentionally NOT part of the sort or the filter.
    // If an existing product is edited (price change, etc.), its
    // created_at and id don't change, so it stays in exactly the same
    // place in the pagination order. The user just sees updated values
    // for a product they already would have seen — never a duplicate row.
    const rows = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt), desc(products.id))
      .limit(limit);

    // ---- 6. Build the next cursor ----
    // If we got a full page, there might be more — point the cursor at the
    // last row. If we got fewer rows than `limit`, we've reached the end.
    let nextCursor = null;
    if (rows.length === limit) {
      const last = rows[rows.length - 1];
      nextCursor = encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id });
    }

    res.json({
      snapshot: snapshot.toISOString(),
      // Pass this back as ?cursor= on the next request.
      nextCursorToken: nextCursor,
      data: rows,
    });
  } catch (err) {
    console.error("Error in GET /products:", err);
    res.status(500).json({ error: "Something went wrong fetching products" });
  }
});
