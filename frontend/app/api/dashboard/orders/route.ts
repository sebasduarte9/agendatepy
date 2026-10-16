import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import {
  ORDER_DELIVERY_TYPES,
  ORDER_PAYMENT_METHODS,
  nextOrderNumber,
  orderInclude,
  serializeOrder,
} from "@/lib/product-orders";

export const dynamic = "force-dynamic";

const MAX_ITEMS = 30;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const orders = await prisma.productOrder.findMany({
      where: { tenantId: auth.tenantId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ ok: true, orders: orders.map(serializeOrder) });
  } catch (error) {
    console.error("Error en GET /api/dashboard/orders:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No pudimos consultar los pedidos." },
      { status: 500 },
    );
  }
}

type IncomingItem = { productId?: unknown; productName?: unknown; qty?: unknown; unitPrice?: unknown };

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return validation("Datos del pedido inválidos.");
    }

    const clientName = typeof body.clientName === "string" ? body.clientName.trim() : "";
    const clientPhone = typeof body.clientPhone === "string" ? body.clientPhone.trim() : "";
    if (clientName.length < 2 || clientName.length > 80) return validation("Ingresá el nombre del cliente.");
    if (clientPhone.length > 40) return validation("Teléfono inválido.");

    const rawItems: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > MAX_ITEMS) return validation("El pedido debe tener al menos un producto.");

    // Los productos tienen que existir en este negocio; el nombre sale de la base
    const productIds = rawItems
      .map((it) => (typeof it.productId === "string" && UUID_REGEX.test(it.productId) ? it.productId : null))
      .filter((id): id is string => id !== null);
    const products = await prisma.product.findMany({
      where: { tenantId: auth.tenantId, id: { in: productIds } },
      select: { id: true, name: true, price: true, isActive: true },
    });
    const productsById = new Map(products.map((p) => [p.id, p]));

    const items: { productId: string; productName: string; qty: number; unitPrice: number }[] = [];
    for (const it of rawItems) {
      const product = typeof it.productId === "string" ? productsById.get(it.productId) : undefined;
      if (!product || !product.isActive) return validation("Uno de los productos ya no está disponible.");
      const qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > 999) return validation("Cantidad inválida.");
      // El precio unitario puede venir con descuento de oferta; nunca más caro que el de lista
      const requested = Number(it.unitPrice);
      const unitPrice = Number.isInteger(requested) && requested > 0 ? Math.min(requested, product.price) : product.price;
      items.push({ productId: product.id, productName: product.name, qty, unitPrice });
    }

    const paymentMethod = (ORDER_PAYMENT_METHODS as readonly string[]).includes(body.paymentMethod)
      ? body.paymentMethod
      : "efectivo";
    const deliveryType = (ORDER_DELIVERY_TYPES as readonly string[]).includes(body.deliveryType)
      ? body.deliveryType
      : "retirar_en_local";
    const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 500) : null;
    const sellerStaffId =
      typeof body.sellerStaffId === "string" && UUID_REGEX.test(body.sellerStaffId) ? body.sellerStaffId : null;
    const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);

    // Vincular con la ficha del cliente por teléfono (últimos 8 dígitos)
    let clientId: string | null = null;
    const suffix = clientPhone.replace(/\D/g, "").slice(-8);
    if (suffix.length === 8) {
      const match = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM clients
        WHERE tenant_id = ${auth.tenantId}::uuid
          AND right(regexp_replace(phone, '\\D', '', 'g'), 8) = ${suffix}
        LIMIT 1`;
      clientId = match[0]?.id ?? null;
    }

    // Número correlativo por negocio; reintenta si dos pedidos chocan con el mismo número
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const last = await prisma.productOrder.findFirst({
          where: { tenantId: auth.tenantId },
          orderBy: { createdAt: "desc" },
          select: { orderNumber: true },
        });
        const created = await prisma.productOrder.create({
          data: {
            tenantId: auth.tenantId,
            orderNumber: nextOrderNumber(last?.orderNumber),
            clientId,
            clientName,
            clientPhone,
            sellerStaffId,
            paymentMethod,
            deliveryType,
            notes,
            totalAmount,
            items: { create: items },
          },
          include: orderInclude,
        });

        await prisma.platformEvent.create({
          data: {
            event: "PRODUCT_ORDER_CREATED",
            tenantId: auth.tenantId,
            entityType: "ProductOrder",
            entityId: created.id,
            metadata: { totalAmount, items: items.length, source: body.source === "crm" ? "crm" : "dashboard" },
          },
        });

        return NextResponse.json({ ok: true, order: serializeOrder(created) }, { status: 201 });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && attempt < 2) continue;
        throw error;
      }
    }

    return NextResponse.json({ ok: false, message: "No se pudo numerar el pedido. Intentá de nuevo." }, { status: 409 });
  } catch (error) {
    console.error("Error en POST /api/dashboard/orders:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo guardar el pedido." },
      { status: 500 },
    );
  }
}

function validation(message: string) {
  return NextResponse.json({ ok: false, error: "VALIDATION_ERROR", message }, { status: 400 });
}
