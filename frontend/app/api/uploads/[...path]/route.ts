import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

/**
 * Sirve las imágenes subidas en tiempo de ejecución. `next start` solo sirve lo
 * que estaba en /public al compilar, así que /uploads/* llega acá por un rewrite
 * de fallback (next.config.ts). En producción la carpeta es un volumen de Docker.
 */
export async function GET(_request: NextRequest, { params }: RouteProps) {
  const { path: segments } = await params;
  const uploadDir = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadDir, ...segments);
  const ext = path.extname(filePath).toLowerCase();

  // Solo archivos de imagen dentro de /public/uploads (sin ../)
  if (!filePath.startsWith(uploadDir + path.sep) || !CONTENT_TYPES[ext]) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext],
        // Los nombres son únicos (timestamp + aleatorio), así que se pueden cachear para siempre
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }
}
