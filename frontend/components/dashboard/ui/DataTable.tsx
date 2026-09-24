"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  hideOnMobile?: boolean;
};

export default function DataTable<T extends { id: string }>({
  rows,
  columns,
  pageSize = 6,
}: {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const slice = useMemo(
    () => rows.slice(page * pageSize, page * pageSize + pageSize),
    [rows, page, pageSize],
  );

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3.5 font-bold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {slice.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3.5 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="space-y-3 md:hidden">
        {slice.map((row) => (
          <article
            key={row.id}
            className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-2 backdrop-blur-sm"
          >
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-400 dark:text-slate-500">{col.header}</span>
                  <div className="text-right font-medium text-slate-800 dark:text-slate-100">{col.render(row)}</div>
                </div>
              ))}
          </article>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3.5 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Página <strong className="text-slate-800 dark:text-white font-bold">{page + 1}</strong> de {pages} ({rows.length} registros)
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Atrás</span>
          </button>
          <button
            type="button"
            disabled={page >= pages - 1}
            onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
