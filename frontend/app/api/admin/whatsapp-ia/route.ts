import { NextRequest, NextResponse } from "next/server";
import { geminiPool } from "@/lib/ai/gemini-pool";

/**
 * Endpoint de Telemetría y Salud del Clúster de IA WhatsApp (Gemini Multi-Key Pool)
 *
 * Provee:
 * - Métricas en tiempo real de consumo de RPM (0-15) y RPD (0-1500) por clave.
 * - Estado de salud de las 4 cuentas.
 * - Registro de auditoría en vivo de consultas de clientes.
 * - Ping sintético de verificación.
 */
export async function GET(req: NextRequest) {
  try {
    const summary = geminiPool.getGlobalSummary();
    const keys = geminiPool.getStats();
    const auditLogs = geminiPool.getAuditLogs();

    return NextResponse.json({
      status: "success",
      summary,
      keys,
      auditLogs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Error al obtener telemetría de IA" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "ping";

    if (action === "ping" || action === "test") {
      const updatedKeys = await geminiPool.testAllKeys();
      const summary = geminiPool.getGlobalSummary();

      return NextResponse.json({
        status: "success",
        message: "Test sintético de las 4 claves completado exitosamente",
        keys: updatedKeys,
        summary,
      });
    }

    if (action === "reload") {
      geminiPool.reloadKeys();
      return NextResponse.json({
        status: "success",
        message: "Claves recargadas desde variables de entorno",
        keys: geminiPool.getStats(),
      });
    }

    return NextResponse.json({ status: "error", message: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Error al ejecutar acción en cluster" },
      { status: 500 }
    );
  }
}
