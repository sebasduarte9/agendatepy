import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { dataUrl, filename = "image.webp" } = await req.json();
      if (!dataUrl) {
        return NextResponse.json({ error: "No se proporcionó dataUrl" }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 });
      }

      const buffer = Buffer.from(matches[2], "base64");
      const ext = matches[1].includes("webp") ? ".webp" : ".jpg";
      const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".webp";
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
