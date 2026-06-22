import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CategoryFilter } from "@/components/category-filter";
import { ProductGrid } from "@/components/product-grid";

const PAGE_SIZE = 20;
const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function App() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [snapshot, setSnapshot] = useState("");
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  async function fetchPage(reset, opts) {
    const cat = opts?.category ?? category;

    if (reset) setLoadingInitial(true);
    else setLoadingMore(true);

    setError(null);

    try {
      const params = new URLSearchParams();
      if (cat) params.set("category", cat);
      params.set("limit", String(PAGE_SIZE));
      if (!reset && cursor) params.set("cursor", cursor);
      if (!reset && snapshot) params.set("snapshot", snapshot);

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const json = await res.json();

      setProducts((prev) => (reset ? json.data : [...prev, ...json.data]));
      setSnapshot(json.snapshot);
      setCursor(json.nextCursorToken ?? "");
      setHasMore(Boolean(json.nextCursorToken));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchPage(true, { category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const visible = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-sm font-bold text-white">
              S
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Shopr</h1>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Browse the catalog. Filter by category, then load more.
          </p>
        </div>

        <div className="mb-6">
          <CategoryFilter active={category} onChange={setCategory} />
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-neutral-300 bg-white p-4 text-sm text-neutral-700">
            {error}{" "}
            <button
              type="button"
              onClick={() => fetchPage(true)}
              className="ml-2 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        <ProductGrid
          products={visible}
          loadingInitial={loadingInitial}
          loadingMore={loadingMore}
        />

        {!loadingInitial && visible.length > 0 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-2">
            {hasMore ? (
              <button
                type="button"
                onClick={() => fetchPage(false)}
                disabled={loadingMore}
                className="h-10 rounded-full bg-neutral-900 px-6 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            ) : (
              <p className="text-sm text-neutral-500">
                You&apos;ve reached the end — {products.length} products loaded
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
