import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  if (totalPages <= 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Build page numbers to show
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="bg-white rounded-2xl px-6 py-4 mt-6 flex items-center justify-between shadow-sm border border-gray-100">
      {/* Showing info */}
      <p className="text-xs font-semibold text-gray-400 tracking-wider">
        SHOWING{" "}
        <span className="text-orange-500">{from}</span> TO{" "}
        <span className="text-orange-500">{to}</span> OF{" "}
        <span className="text-orange-500">{total}</span>
      </p>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition ${
                p === page
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Version tag */}
      <p className="text-[10px] font-semibold text-gray-300 tracking-wider">GROWPATH ERP V2.0</p>
    </div>
  );
}
