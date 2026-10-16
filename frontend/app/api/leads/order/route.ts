import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { UUID_REGEX } from "@/lib/api-guard";
import { normalizeParaguayPhone } from "@/lib/dashboard-dates";
import { nextOrderNumber } from "@/lib/product-orders";
import { isSaleActive, saleUnitsSoldByProduct } from "@/lib/product-sales";

export const dynamic = "force-dynamic";

const MAX_ITEMS = 30;
const MAX_QTY = 99;

// Límite simple por IP + negocio (pedidos públicos sin login): 5 cada 10 minutos
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentByKey = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recentByKey.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recentByKey.set(key, hits);
    return true;
  }
  hits.push(now);
  recentByKey.set(key, hits);
  return false;
}

function validation(message: string) {
  return NextResponse.json({ ok: false, error: "VALIDATION_ERROR", message }, { status: 400 });
}

/**
 * Pedido de la tienda pública (/[tenant]/reservar). El precio SIEMPRE se calcula
 * acá (lista u oferta vigente); nunca se confía en el precio que manda el navegador.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return validation("Datos del pedido inválidos.");

    const tenantSlug = typeof body.tenantSlug === "string" ? body.tenantSlug.trim() : "";
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const rawPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";
    const digits = rawPhone.replace(/\D/g, "");
    if (!tenantSlug) return validation("Negocio inválido.");
    if (customerName.length < 2 || customerName.length > 80) return validation("Ingresá tu nombre.");
    if (digits.length < 8 || digits.length > 15) return validation("Ingresá un teléfono válido.");

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
    if (isRateLimited(`${ip}:${tenantSlug}`)) {
      return NextResponse.json(
        { ok: false, error: "RATE_LIMITED", message: "Recibimos varios pedidos seguidos. Probá de nuevo en unos minutos." },
        { status: 429 }
      );
    }

    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ subdomain: tenantSlug }, { slug: tenantSlug }], status: "ACTIVE" },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND", message: "Negocio no encontrado." }, { status: 404 });
    }

    const rawItems: { productId?: unknown; qty?: unknown }[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > MAX_ITEMS) return validation("El pedido debe tener al menos un producto.");

    const productIds = rawItems
      .map((it) => (typeof it.productId === "string" && UUID_REGEX.test(it.productId) ? it.productId : null))
      .filter((id): id is string => id !== null);
    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id, id: { in: productIds }, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        isOnSale: true,
        salePrice: true,
        saleType: true,
        saleExpiresAt: true,
        saleMaxUnits: true,
        saleStartedAt: true,
      },
    });
    const productsById = new Map(products.map((p) => [p.id, p]));
    const saleUnits = await saleUnitsSoldByProduct(tenant.id, products);

    const items: { productId: string; productName: string; qty: number; unitPrice: number }[] = [];
    for (const it of rawItems) {
      const product = typeof it.productId === "string" ? productsById.get(it.productId) : undefined;
      if (!product) return validation("Uno de los productos ya no está disponible.");
      const qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return validation("Cantidad inválida.");
      const onSale = isSaleActive(product, saleUnits.get(product.id) || 0);
      items.push({
        productId: product.id,
        productName: product.name,
        qty,
        unitPrice: onSale && product.salePrice ? product.salePrice : product.price,
      });
    }

    const clientPhone = normalizeParaguayPhone(rawPhone) || digits;
    const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 500) : null;
    const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);

    // Vincular con la ficha del cliente por teléfono (últimos 8 dígitos)
    let clientId: string | null = null;
    const suffix = digits.slice(-8);
    const match = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM clients
      WHERE tenant_id = ${tenant.id}::uuid
        AND right(regexp_replace(phone, '\\D', '', 'g'), 8) = ${suffix}
      LIMIT 1`;
    clientId = match[0]?.id ?? null;

    // Número correlativo por negocio; reintenta si dos pedidos chocan con el mismo número
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const last = await prisma.productOrder.findFirst({
          where: { tenantId: tenant.id },
          orderBy: { createdAt: "desc" },
          select: { orderNumber: true },
        });
        const created = await prisma.productOrder.create({
          data: {
            tenantId: tenant.id,
            orderNumber: nextOrderNumber(last?.orderNumber),
            clientId,
            clientName: customerName,
            clientPhone,
            notes,
            totalAmount,
            items: { create: items },
          },
          select: { id: true, orderNumber: true, totalAmount: true },
        });

        await prisma.platformEvent.create({
          data: {
            event: "PRODUCT_ORDER_CREATED",
            tenantId: tenant.id,
            entityType: "ProductOrder",
            entityId: created.id,
            metadata: { totalAmount, items: items.length, source: "tienda" },
          },
        });

        return NextResponse.json(
          { ok: true, orderNumber: created.orderNumber, totalAmount: created.totalAmount },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && attempt < 2) continue;
        throw error;
      }
    }
    throw new Error("No se pudo asignar número de pedido.");
  } catch (error) {
    console.error("Error en POST /api/leads/order:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No pudimos registrar tu pedido. Probá de nuevo." },
      { status: 500 }
    );
  }
}
