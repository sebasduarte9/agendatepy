"use client";

import { useActionState, useState } from "react";
import { cancelAppointment, confirmAppointment } from "@/lib/admin/actions";

export default function AppointmentActions({
  appointmentId,
  canConfirm,
  canCancel,
}: {
  appointmentId: string;
  canConfirm: boolean;
  canCancel: boolean;
}) {
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmAppointment, null);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelAppointment, null);
  const [askCancel, setAskCancel] = useState(false);
  const message = (!confirmState?.ok && confirmState?.message) || (!cancelState?.ok && cancelState?.message);

  if (!canConfirm && !canCancel) return null;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {canConfirm && (
          <form action={confirmAction}>
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <button
              type="submit"
              disabled={confirmPending}
              className="h-10 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {confirmPending ? "Confirmando…" : "Confirmar"}
            </button>
          </form>
        )}
        {canCancel && !askCancel && (
          <button
            type="button"
            onClick={() => setAskCancel(true)}
            className="h-10 rounded-full border border-rose-200 px-4 text-sm font-semibold text-rose-700"
          >
            Cancelar
          </button>
        )}
        {canCancel && askCancel && (
          <form action={cancelAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <button
              type="submit"
              disabled={cancelPending}
              className="h-10 rounded-full bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {cancelPending ? "Cancelando…" : "Sí, cancelar"}
            </button>
            <button
              type="button"
              onClick={() => setAskCancel(false)}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-600"
            >
              Volver
            </button>
          </form>
        )}
      </div>
      {message && <p className="mt-2 text-sm text-rose-700">{message}</p>}
    </div>
  );
}
