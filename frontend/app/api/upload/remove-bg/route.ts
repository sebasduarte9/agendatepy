import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const { imageUrl, dataUrl } = await req.json();
    const source = dataUrl || imageUrl;

    if (!source) {
      return NextResponse.json(
        { error: "No se proporcionó imagen para procesar." },
        { status: 400 }
      );
    }

    let inputBuffer: Buffer;
    let mimeType = "image/png";

    if (typeof source === "string" && source.startsWith("data:")) {
      const matches = source.match(/^data:image\/([A-Za-z-+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json(
          { error: "Formato de imagen en base64 no válido." },
          { status: 400 }
        );
      }
      mimeType = `image/${matches[1].toLowerCase().replace("jpg", "jpeg")}`;
      inputBuffer = Buffer.from(matches[2], "base64");
    } else if (typeof source === "string" && source.startsWith("/uploads/")) {
      // Local server file
      const localPath = path.join(process.cwd(), "public", source);
      inputBuffer = await readFile(localPath);
      const ext = path.extname(source).toLowerCase().replace(".", "");
      mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext || "png"}`;
    } else if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      // Remote URL fetch
      const resp = await fetch(source);
      if (!resp.ok) {
        return NextResponse.json(
          { error: "No se pudo obtener la imagen remota." },
          { status: 400 }
        );
      }
      const arr = await resp.arrayBuffer();
      inputBuffer = Buffer.from(arr);
      mimeType = resp.headers.get("content-type") || "image/png";
    } else {
      return NextResponse.json(
        { error: "Origen de imagen no soportado." },
        { status: 400 }
      );
    }

    // Dynamic import to avoid bundling issues if any
    // @ts-expect-error - Optional server-side image processing package
    const { removeBackground } = await import("@imgly/background-removal-node");

    // Convert Buffer to standard Blob with explicit MIME type
    const inputBlob = new Blob([new Uint8Array(inputBuffer)], { type: mimeType });

    // Execute server-side AI background removal model
    const outputBlob = await removeBackground(inputBlob);
    const outputArrayBuffer = await outputBlob.arrayBuffer();
    const outputBuffer = Buffer.from(outputArrayBuffer);

    // Save cutout PNG to public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `cutout-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.png`;
    const outputPath = path.join(uploadDir, filename);

    await writeFile(outputPath, outputBuffer);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${filename}`,
    });
  } catch (error: unknown) {
    console.error("Error en recorte de fondo en servidor:", error);
    return NextResponse.json(
      {
        error: "No se pudo procesar el recorte de fondo en el servidor.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
