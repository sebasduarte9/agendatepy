import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError } from "@/lib/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const avatarCache = new Map<string, { expiresAt: number; image: Buffer }>();
type TenantWhatsAppSettings = {
  evolutionConfig?: { instance?: unknown; instanceName?: unknown } | null;
};

async function readLimitedImage(response: Response): Promise<Buffer> {
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_SOURCE_BYTES || !response.body) {
    throw new Error("La imagen excede el tamaño permitido.");
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_SOURCE_BYTES) {
        await reader.cancel();
        throw new Error("La imagen excede el tamaño permitido.");
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, total);
}

function isAllowedWhatsAppImage(url: URL) {
  return url.protocol === "https:" &&
    (url.hostname.endsWith(".whatsapp.net") ||
      url.hostname.endsWith(".fbcdn.net") ||
      url.hostname === "lookaside.fbsbx.com");
}

export async function GET(request: NextRequest) {
  const auth = await requireTenantSession(request);
  if (isGuardError(auth)) return auth;

  const phone = (request.nextUrl.searchParams.get("phone") || "").replace(/\D/g, "");
  if (!/^\d{8,15}$/.test(phone)) {
    return NextResponse.json({ ok: false, message: "Número inválido." }, { status: 400 });
  }

  const cacheKey = `${auth.tenantId}:${phone}`;
  const cached = avatarCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return new NextResponse(new Uint8Array(cached.image), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, max-age=21600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (cached) avatarCache.delete(cacheKey);

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings || {}) as TenantWhatsAppSettings;
    const evolutionConfig = settings.evolutionConfig;
    const instance = String(
      evolutionConfig?.instance || evolutionConfig?.instanceName || process.env.EVOLUTION_INSTANCE || ""
    ).trim();
    const baseUrl = (process.env.EVOLUTION_API_URL || "http://localhost:8081").replace(/\/$/, "");
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!instance || !apiKey) {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, max-age=60" } });
    }

    const profileResponse = await fetch(
      `${baseUrl}/chat/fetchProfilePictureUrl/${encodeURIComponent(instance)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({ number: phone }),
        cache: "no-store",
        signal: AbortSignal.timeout(7000),
      }
    );
    if (!profileResponse.ok) {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, max-age=60" } });
    }

    const profileData = await profileResponse.json().catch(() => ({}));
    const rawImageUrl = profileData.profilePictureUrl || profileData.profilePicUrl || profileData.url;
    if (typeof rawImageUrl !== "string") {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, max-age=60" } });
    }

    const imageUrl = new URL(rawImageUrl);
    if (!isAllowedWhatsAppImage(imageUrl)) {
      console.warn("[CRM avatar] Evolution devolvió un host de imagen no permitido.");
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, max-age=60" } });
    }

    const imageResponse = await fetch(imageUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(7000),
    });
    const contentType = (imageResponse.headers.get("content-type") || "")
      .split(";", 1)[0]
      .trim()
      .toLowerCase();
    if (!imageResponse.ok || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(contentType)) {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, max-age=60" } });
    }

    const sourceImage = await readLimitedImage(imageResponse);
    const optimizedImage = await sharp(sourceImage, { limitInputPixels: 16_000_000 })
      .rotate()
      .resize(128, 128, { fit: "cover", position: "attention" })
      .webp({ quality: 78, effort: 4 })
      .toBuffer();

    // Keep the in-memory cache bounded across long-lived Node processes.
    if (avatarCache.size >= 600) {
      const oldestKey = avatarCache.keys().next().value;
      if (oldestKey) avatarCache.delete(oldestKey);
    }
    avatarCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, image: optimizedImage });

    return new NextResponse(new Uint8Array(optimizedImage), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, max-age=21600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.warn("[CRM avatar] No se pudo obtener la foto de WhatsApp:", error);
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, max-age=60" } });
  }
}
