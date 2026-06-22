export const CATEGORIES = [
  { value: "", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "fashion", label: "Fashion" },
  { value: "sports", label: "Sports" },
  { value: "home", label: "Home" },
  { value: "beauty", label: "Beauty" },
  { value: "toys", label: "Toys" },
  { value: "grocery", label: "Grocery" },
];

export function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const isActive = c.value === active;

        return (
          <button
            key={c.value || "all"}
            type="button"
            onClick={() => onChange(c.value)}
            className={
              isActive
                ? "h-8 rounded-full border border-neutral-900 bg-neutral-900 px-4 text-sm text-white"
                : "h-8 rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-100"
            }
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
