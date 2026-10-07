// Reusable pagination bar — shows Previous/Next with page count and jump buttons.

interface Props {
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ count, page, pageSize, onPageChange }: Props) {
  const totalPages = Math.ceil(count / pageSize);
  const start = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);

  if (totalPages <= 1) return null;

  // Generate page numbers to show (up to 5 around current)
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}–{end}</span> of{" "}
        <span className="font-medium text-slate-700">{count}</span> results
      </p>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                p === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
