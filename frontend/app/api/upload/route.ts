import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";

const ALLOWED_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión para subir imágenes." },
        { status: 401 }
      );
    }

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
      const uploadDir = path.join(process.cwd(), "public", "uploads");
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
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, cleanName);

    await writeFile(filePath, buffer);
    return NextResponse.json({ ok: true, url: `/uploads/${cleanName}` });
  } catch (err: unknown) {
    console.error("Error al subir archivo:", err);
    return NextResponse.json({ error: "Error al procesar la subida" }, { status: 500 });
  }
}
