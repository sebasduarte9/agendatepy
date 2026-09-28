"use client";

import { useEffect, useState } from "react";
import { Printer, Download, X, CheckCircle2 } from "lucide-react";
import { formatGs } from "@/lib/dashboard-dates";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboardStore } from "@/store/useDashboardStore";

const TIMEZONE = "America/Asuncion";

interface PayoutReceiptModalProps {
  payoutId: string | null;
  onClose: () => void;
}

export default function PayoutReceiptModal({
  payoutId,
  onClose,
}: PayoutReceiptModalProps) {
  const [loading, setLoading] = useState(false);
  const [payout, setPayout] = useState<any>(null);
  const business = useDashboardStore((s) => s.business);

  useEffect(() => {
    if (!payoutId) {
      setPayout(null);
      return;
    }

    setLoading(true);
    fetch(`/api/commission-payouts/${payoutId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.payout) {
          setPayout(data.payout);
        }
      })
      .catch((err) => console.error("Error al cargar recibo de liquidación:", err))
      .finally(() => setLoading(false));
  }, [payoutId]);

  if (!payoutId) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    window.open(`/api/reports/payouts?payoutId=${payoutId}&format=csv`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      {/* Estilos CSS para impresión física y guardado en PDF */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-surface-800 border border-surface-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Barra superior de acciones (no se imprime) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700 bg-surface-900/60 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-300">Recibo de Liquidación</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Pagada
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-200 bg-surface-700/80 hover:bg-surface-700 rounded-lg transition"
              title="Descargar detalle en CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-lg transition shadow-sm"
              title="Imprimir o Guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-surface-700 transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor imprimible */}
        <div id="printable-receipt" className="p-8 text-surface-100 bg-surface-850 font-sans">
          {loading ? (
            <div className="py-20 text-center text-surface-400 animate-pulse">
              Cargando recibo oficial de liquidación...
            </div>
          ) : !payout ? (
            <div className="py-20 text-center text-red-400">
              No se pudo cargar la información de la liquidación solicitada.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Encabezado del Comercio y Recibo */}
              <div className="flex justify-between items-start border-b border-surface-700 pb-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                    {business.name || "AgendatePY"}
                  </h1>
                  <p className="text-xs text-surface-400">
                    Sistema de Gestión y Automatización de Servicios
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">Paraguay</p>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider font-semibold text-brand">
                    Recibo de Liquidación
                  </div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">
                    #LIQ-{payout.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Liquidación Pagada
                  </div>
                </div>
              </div>

              {/* Ficha Resumen de la Liquidación */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-900/70 border border-surface-700/60 text-xs">
                <div>
                  <span className="text-surface-400 block mb-0.5">Profesional:</span>
                  <span className="font-semibold text-white text-sm">
                    {payout.staffName}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block mb-0.5">Período de Corte:</span>
                  <span className="font-medium text-surface-200">
                    {formatInTimeZone(new Date(payout.periodStart), TIMEZONE, "dd/MM/yyyy")} al{" "}
                    {formatInTimeZone(new Date(payout.periodEnd), TIMEZONE, "dd/MM/yyyy")}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block mb-0.5">Fecha y Hora de Pago:</span>
                  <span className="font-medium text-surface-200">
                    {payout.paidAt
                      ? formatInTimeZone(new Date(payout.paidAt), TIMEZONE, "dd/MM/yyyy HH:mm")
                      : "Pendiente"}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block mb-0.5">Método de Pago:</span>
                  <span className="font-semibold text-emerald-400">
                    {payout.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Tabla Detallada de Turnos / Servicios Comisionados */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-2">
                  Detalle de Servicios Liquidados ({payout.items?.length || 0})
                </h3>
                <div className="border border-surface-700 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surface-900/80 text-surface-300 font-semibold border-b border-surface-700">
                      <tr>
                        <th className="py-2.5 px-3">Fecha y Hora</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Servicio</th>
                        <th className="py-2.5 px-3 text-right">Cobrado en Caja</th>
                        <th className="py-2.5 px-3 text-center">% Comisión</th>
                        <th className="py-2.5 px-3 text-right">Comisión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-750">
                      {payout.items?.map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-surface-800/40">
                          <td className="py-2 px-3 text-surface-300 whitespace-nowrap">
                            {formatInTimeZone(new Date(item.appointmentDate), TIMEZONE, "dd/MM/yyyy HH:mm")}
                          </td>
                          <td className="py-2 px-3 font-medium text-white">
                            {item.clientName}
                          </td>
                          <td className="py-2 px-3 text-surface-300">
                            {item.serviceName}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-surface-200">
                            {formatGs(item.chargedAmount)}
                          </td>
                          <td className="py-2 px-3 text-center text-surface-400 font-mono">
                            {item.commissionPercentage}%
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">
                            {formatGs(item.commissionAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bloque Totalizador */}
              <div className="flex justify-end pt-2">
                <div className="w-72 bg-surface-900/80 border border-surface-700 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-surface-400">
                    <span>Base Total Cobrada:</span>
                    <span className="font-mono text-surface-200">
                      {formatGs(
                        payout.items?.reduce((acc: number, cur: any) => acc + cur.chargedAmount, 0) || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-surface-400">
                    <span>Citas Liquidadas:</span>
                    <span className="font-mono text-surface-200">{payout.items?.length || 0}</span>
                  </div>
                  <div className="border-t border-surface-700 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Total Pagado:</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {formatGs(payout.amountPaid)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Firmas de Conformidad */}
              <div className="pt-10 border-t border-surface-700 grid grid-cols-2 gap-12 text-center text-xs">
                <div>
                  <div className="border-b border-surface-500 w-3/4 mx-auto mb-2"></div>
                  <p className="font-medium text-white">{payout.staffName}</p>
                  <p className="text-surface-400 text-[11px]">Firma del Colaborador (Recibí Conforme)</p>
                </div>
                <div>
                  <div className="border-b border-surface-500 w-3/4 mx-auto mb-2"></div>
                  <p className="font-medium text-white">
                    {payout.paidBy || "Administración"}
                  </p>
                  <p className="text-surface-400 text-[11px]">Firma Autorizada / Administración</p>
                </div>
              </div>

              {/* Footer legal */}
              <div className="text-center text-[10px] text-surface-500 pt-4">
                Comprobante interno de liquidación contable emitido por AgendatePY. Hora oficial de la República del Paraguay (America/Asuncion).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
