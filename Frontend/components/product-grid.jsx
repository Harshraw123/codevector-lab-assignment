import { ProductCard } from "./product-card";

function CardSkeleton() {
  return (
    <div className="flex h-[170px] flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-4 w-8 rounded" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="mt-auto flex items-end justify-between">
        <div className="skeleton h-7 w-20 rounded-md" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, loadingInitial, loadingMore }) {
  if (loadingInitial) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
        <h3 className="text-base font-medium text-neutral-900">No products found</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Try a different category or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}

      {loadingMore &&
        Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={`more-${i}`} />
        ))}
    </div>
  );
}
