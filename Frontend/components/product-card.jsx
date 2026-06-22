function formatPrice(price) {
  const n = Number(price);
  if (Number.isNaN(n)) return price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function relativeFromNow(iso) {
  const then = new Date(iso).getTime();
  const days = Math.max(0, Math.floor((Date.now() - then) / 86400000));

  if (days === 0) return "added today";
  if (days === 1) return "added 1 day ago";
  if (days < 30) return `added ${days} days ago`;

  const months = Math.floor(days / 30);
  return months === 1 ? "added 1 month ago" : `added ${months} months ago`;
}

export function ProductCard({ product }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-0.5 text-xs capitalize text-neutral-700">
          {product.category}
        </span>
        <span className="text-xs text-neutral-500">#{product.id}</span>
      </div>

      <h3 className="line-clamp-2 text-base font-medium leading-snug text-neutral-900">
        {product.name}
      </h3>

      <div className="mt-auto flex items-end justify-between pt-3">
        <span className="rounded-md bg-neutral-900 px-2.5 py-1 text-sm font-semibold text-white">
          {formatPrice(product.price)}
        </span>
        <span className="text-xs text-neutral-500">
          {relativeFromNow(product.createdAt)}
        </span>
      </div>
    </article>
  );
}
