# Product Browsing API

Small Node.js backend for browsing ~200,000 products with category filtering and stable, fast pagination.

**Stack:** Express · Drizzle ORM · Neon Postgres

---

## Design decisions (for the interview)

### 1. Keyset pagination, not OFFSET

`OFFSET 10000` makes Postgres scan and discard 10,000 rows on every request — slow at 200k rows and unstable when rows are inserted mid-browse.

We use **cursor / keyset pagination**: each page asks for rows *after* the last `(created_at, id)` tuple from the previous page. Cost stays constant no matter how deep you paginate.

### 2. Snapshot for consistency while data changes

Problem: user loads page 1, 50 new products are inserted, user loads page 2 — with naive OFFSET they can see duplicates or miss rows.

Solution: page 1 returns a `snapshot` timestamp. Every subsequent page filters `created_at <= snapshot`. New inserts after the snapshot are invisible for this browsing session. Refreshing page 1 starts a new session and picks up new products.

Updates to existing rows (price, name) are fine — `created_at` and `id` don't change, so the row stays in the same position. The user just sees fresher field values when they reach it.

### 3. Composite indexes matching the sort order

We always sort `ORDER BY created_at DESC, id DESC` (newest first; `id` breaks ties).

- All categories: index on `(created_at, id)`
- Category filter: index on `(category, created_at, id)`

Postgres walks the index instead of sorting the full table.

### 4. Fast bulk seed

`scripts/seed.js` inserts in batches of 1,000 rows per `INSERT` statement — not 200,000 individual round-trips.

---

## API

### `GET /products`

| Query param | Required | Description |
|---|---|---|
| `limit` | no | Page size (default 20, max 100) |
| `category` | no | Filter, e.g. `electronics` |
| `snapshot` | no | ISO timestamp from page 1 — **send on every page after the first** |
| `cursor` | no | Opaque token from `nextCursorToken` on the previous page |

**Example — page 1**

```
GET /products?limit=20&category=electronics
```

**Example — page 2**

```
GET /products?limit=20&category=electronics&snapshot=2025-06-22T10:00:00.000Z&cursor=eyJjcmVhdGVkQXQiOi...
```

**Response**

```json
{
  "snapshot": "2025-06-22T10:00:00.000Z",
  "nextCursorToken": "eyJjcmVhdGVkQXQiOi...",
  "data": [ { "id": 1, "name": "...", "category": "electronics", "price": "49.99", "createdAt": "...", "updatedAt": "..." } ]
}
```



## Deploy (Render + Neon)

1. Create a Neon project, copy `DATABASE_URL`.
2. Locally: `npm run db:push && npm run seed`.
3. On Render: Web Service → connect repo → root directory `Backend`.
   - Build: `npm install`
   - Start: `npm start`
   - Env: `DATABASE_URL`, `PORT` (Render sets PORT automatically).

---

