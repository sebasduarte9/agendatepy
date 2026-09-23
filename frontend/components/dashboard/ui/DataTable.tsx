"use client";

import { useMemo, useState, type ReactNode } from "react";

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
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-slate-400">
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-3 text-slate-700">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {slice.map((row) => (
          <article key={row.id} className="rounded-2xl border border-border p-4">
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="flex justify-between gap-3 py-1 text-sm">
                  <span className="text-slate-400">{col.header}</span>
                  <span className="text-right font-medium text-slate-800">{col.render(row)}</span>
                </div>
              ))}
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Página {page + 1} de {pages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((value) => value - 1)}
            className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
          >
            Atrás
          </button>
          <button
            type="button"
            disabled={page >= pages - 1}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
