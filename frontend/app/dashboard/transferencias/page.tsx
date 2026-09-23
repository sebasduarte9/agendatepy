"use client";

import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import DataTable from "@/components/dashboard/ui/DataTable";
import { formatGs } from "@/lib/dashboard-dates";
import type { Receipt } from "@/lib/dashboard-types";

export default function TransferenciasPage() {
  const { receipts, business, setReceiptStatus, pushToast } = useDashboardStore();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Transferencias</h1>
      <Card>
        <DataTable<Receipt>
          rows={receipts}
          columns={[
            { key: "client", header: "Cliente", render: (row) => row.clientName },
            { key: "amount", header: "Monto", render: (row) => formatGs(row.amount) },
            {
              key: "when",
              header: "Enviado",
              hideOnMobile: true,
              render: (row) =>
                formatInTimeZone(row.submittedAt, business.timezone, "dd/MM HH:mm"),
            },
            { key: "note", header: "Nota", hideOnMobile: true, render: (row) => row.note },
            {
              key: "status",
              header: "Estado",
              render: (row) => (
                <span className="capitalize text-slate-600">{row.status}</span>
              ),
            },
            {
              key: "actions",
              header: "Acciones",
              render: (row) =>
                row.status === "pending" ? (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn-approve rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                      onClick={() => {
                        setReceiptStatus(row.id, "approved");
                        pushToast("success", "Comprobante aprobado · turno confirmado");
                      }}
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      className="btn-reject rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
                      onClick={() => {
                        setReceiptStatus(row.id, "rejected");
                        pushToast("error", "Comprobante rechazado · turno cancelado");
                      }}
                    >
                      Rechazar
                    </button>
                  </div>
                ) : (
                  "—"
                ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
