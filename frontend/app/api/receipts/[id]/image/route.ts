import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

// Imagen del comprobante: solo para usuarios del negocio (contiene datos bancarios)
export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN", "STAFF"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    const receipt = await prisma.paymentReceipt.findFirst({
      where: { id, tenantId: auth.tenantId },
      select: { imageData: true, imageMime: true },
    });
    if (!receipt?.imageData || !receipt.imageMime) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(receipt.imageData), {
      headers: {
        "Content-Type": receipt.imageMime,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error en GET /api/receipts/[id]/image:", error);
    return NextResponse.json({ ok: false, error: "DB_UNAVAILABLE" }, { status: 500 });
  }
}
