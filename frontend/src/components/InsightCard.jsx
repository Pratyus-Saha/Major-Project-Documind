function InsightCard({ title, text, page, isActive, onPageSelect }) {
  const clickable = Boolean(page && onPageSelect);

  return (
    <article
      className={`rounded-[1.6rem] border p-5 transition ${
        isActive
          ? "border-sky-300 bg-sky-50/90 shadow-[0_18px_40px_rgba(14,165,233,0.12)]"
          : "border-slate-200 bg-slate-50/90"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Insight
          </p>
          <h3 className="mt-2 text-base font-semibold text-slate-950">{title}</h3>
        </div>

        {page ? (
          <button
            type="button"
            onClick={() => onPageSelect?.(page)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              clickable
                ? "bg-white text-slate-700 hover:bg-slate-950 hover:text-white"
                : "bg-white text-slate-500"
            }`}
          >
            Page {page}
          </button>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">
        {text || "Not found in document"}
      </p>
    </article>
  );
}

export default InsightCard;
