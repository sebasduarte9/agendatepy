import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getAiLearningStats,
  getAiInteractions,
  updateAiInteractionFeedback,
  exportFineTuningDataset,
} from "@/lib/ai/ai-learning-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    // Exportación de Dataset para Fine-Tuning
    const exportFormat = searchParams.get("export");
    if (exportFormat === "jsonl") {
      const scope = (searchParams.get("scope") as any) || "ALL";
      const jsonlData = await exportFineTuningDataset(scope);
      return new Response(jsonlData, {
        status: 200,
        headers: {
          "Content-Type": "application/x-jsonlines; charset=utf-8",
          "Content-Disposition": `attachment; filename="agendatepy-ai-training-${Date.now()}.jsonl"`,
        },
      });
    }

    const scope = (searchParams.get("scope") as any) || "ALL";
    const tenantId = searchParams.get("tenantId") || "ALL";
    const outcome = searchParams.get("outcome") || "ALL";
    const hasAudio = searchParams.get("hasAudio") === "true";
    const hasImage = searchParams.get("hasImage") === "true";
    const hasRepetition = searchParams.get("hasRepetition") === "true";
    const hasFeedback = searchParams.get("hasFeedback") === "true";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    const [stats, interactionsResult] = await Promise.all([
      getAiLearningStats(),
      getAiInteractions({
        scope,
        tenantId,
        outcome,
        hasAudio,
        hasImage,
        hasRepetition,
        hasFeedback,
        search,
        page,
        limit,
      }),
    ]);

    return NextResponse.json({
      stats,
      data: interactionsResult.data,
      pagination: interactionsResult.pagination,
    });
  } catch (error: any) {
    console.error("[API Aprendizaje IA] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Error al obtener datos de aprendizaje" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, correctedResponse, notes, isGoldenSample, isAntiPattern } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de registro requerido" }, { status: 400 });
    }

    const updated = await updateAiInteractionFeedback(id, {
      correctedResponse,
      notes,
      isGoldenSample,
      isAntiPattern,
      reviewedBy: session.email,
    });

    if (!updated) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", record: updated });
  } catch (error: any) {
    console.error("[API Aprendizaje IA] Error guardando feedback:", error);
    return NextResponse.json(
      { error: error?.message || "Error guardando corrección" },
      { status: 500 }
    );
  }
}
