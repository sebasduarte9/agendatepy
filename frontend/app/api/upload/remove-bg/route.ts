import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
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
      // Local server file with path traversal prevention
      const cleanFilename = path.basename(source);
      if (!/^[a-zA-Z0-9._-]+$/.test(cleanFilename) || cleanFilename.includes("..")) {
        return NextResponse.json(
          { error: "Nombre de archivo inválido." },
          { status: 400 }
        );
      }
      const uploadDir = path.resolve(process.cwd(), "public", "uploads");
      const localPath = path.resolve(uploadDir, cleanFilename);
      if (!localPath.startsWith(uploadDir)) {
        return NextResponse.json(
          { error: "Acceso a ruta no permitido." },
          { status: 403 }
        );
      }
      inputBuffer = await readFile(localPath);
      const ext = path.extname(cleanFilename).toLowerCase().replace(".", "");
      mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext || "png"}`;
    } else if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(source);
      } catch {
        return NextResponse.json({ error: "URL inválida." }, { status: 400 });
      }

      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        return NextResponse.json({ error: "Protocolo no permitido." }, { status: 400 });
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      // Bloquear acceso a loopback, metadatos y redes privadas (anti-SSRF)
      const isPrivate =
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname === "127.0.0.1" ||
        hostname === "::1" ||
        hostname === "0.0.0.0" ||
        hostname === "169.254.169.254" ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

      if (isPrivate) {
        return NextResponse.json(
          { error: "No se permite acceder a recursos locales o redes privadas." },
          { status: 403 }
        );
      }

      const resp = await fetch(source, { signal: AbortSignal.timeout(5000) });
      if (!resp.ok) {
        return NextResponse.json(
          { error: "No se pudo obtener la imagen remota." },
          { status: 400 }
        );
      }
      const arr = await resp.arrayBuffer();
      if (arr.byteLength > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagen remota demasiado grande." }, { status: 400 });
      }
      inputBuffer = Buffer.from(arr);
      mimeType = resp.headers.get("content-type") || "image/png";
    } else {
      return NextResponse.json(
        { error: "Origen de imagen no soportado." },
        { status: 400 }
      );
    }

    // Dynamic import to avoid bundling issues if any
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
      },
      { status: 500 }
    );
  }
}
