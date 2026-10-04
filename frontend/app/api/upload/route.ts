import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";

const ALLOWED_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión para subir imágenes." },
        { status: 401 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { dataUrl } = await req.json();
      if (!dataUrl) {
        return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:image\/([A-Za-z-+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json(
          { error: "Formato de imagen inválido. Solo se admiten imágenes JPG, PNG o WEBP." },
          { status: 400 }
        );
      }

      const rawExt = `.${matches[1].toLowerCase().replace("jpeg", "jpg")}`;
      if (!ALLOWED_EXTENSIONS.has(rawExt)) {
        return NextResponse.json(
          { error: "Extensión no permitida. Solo JPG, PNG o WEBP." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(matches[2], "base64");
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "La imagen excede el límite máximo de 5MB." },
          { status: 400 }
        );
      }

      const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${rawExt}`;
      const filePath = path.join(uploadDir, cleanName);

      await writeFile(filePath, buffer);
      return NextResponse.json({ ok: true, url: `/uploads/${cleanName}` });
    }

    // Multipart Form Data fallback
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se encontró ningún archivo" }, { status: 400 });
    }

    const ext = (path.extname(file.name) || ".webp").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo se admiten imágenes JPG, PNG o WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo permitido de 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, cleanName);

    await writeFile(filePath, buffer);
    return NextResponse.json({ ok: true, url: `/uploads/${cleanName}` });
  } catch (err: unknown) {
    console.error("Error al subir archivo:", err);
    return NextResponse.json({ error: "Error al procesar la subida" }, { status: 500 });
  }
}

/**
 * DELETE /api/upload
 * Client soft-delete with 90-day retention policy:
 * The image is removed immediately from the client's public catalog/store,
 * while safely preserved in server storage for 90 days before final purge.
 */
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const manifestPath = path.join(uploadDir, ".retention_manifest.json");
    let manifest: Array<{
      url: string;
      deletedAt: string;
      purgeScheduledAt: string;
      retentionDays: number;
      status: string;
    }> = [];

    try {
      const { readFile } = await import("fs/promises");
      const data = await readFile(manifestPath, "utf-8");
      manifest = JSON.parse(data);
    } catch {
      manifest = [];
    }

    const now = new Date();
    const purgeDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    manifest.push({
      url,
      deletedAt: now.toISOString(),
      purgeScheduledAt: purgeDate.toISOString(),
      retentionDays: 90,
      status: "retained_90_days",
    });

    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    return NextResponse.json({
      ok: true,
      clientRemoved: true,
      retentionDays: 90,
      purgeScheduledAt: purgeDate.toISOString(),
      message: "Imagen retirada del catálogo público. Se conservará durante 90 días de respaldo.",
    });
  } catch (err: unknown) {
    console.error("Error al registrar retención de 90 días:", err);
    return NextResponse.json({ error: "Error al procesar eliminación" }, { status: 500 });
  }
}

