import { prisma } from "@/lib/db";
import type { ProductOfferType } from "@/lib/dashboard-types";

type SaleFields = {
  id: string;
  price: number;
  isOnSale: boolean;
  salePrice: number | null;
  saleType: string | null;
  saleExpiresAt: Date | null;
  saleMaxUnits: number | null;
  saleStartedAt: Date | null;
};

const SALE_TYPES: ProductOfferType[] = ["time", "quantity", "both"];

/**
 * Unidades vendidas a precio de oferta desde que arrancó la oferta vigente
 * (ítems de pedidos no cancelados con unitPrice igual al precio de oferta).
 */
export async function saleUnitsSoldByProduct(
  tenantId: string,
  products: SaleFields[],
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  const onSale = products.filter((p) => p.isOnSale && p.salePrice && p.saleMaxUnits);
  if (onSale.length === 0) return result;

  const items = await prisma.productOrderItem.findMany({
    where: {
      productId: { in: onSale.map((p) => p.id) },
      order: { tenantId, status: { not: "CANCELLED" } },
    },
    select: { productId: true, qty: true, unitPrice: true, order: { select: { createdAt: true } } },
  });

  const byId = new Map(onSale.map((p) => [p.id, p]));
  for (const it of items) {
    const p = it.productId ? byId.get(it.productId) : undefined;
    if (!p || it.unitPrice !== p.salePrice) continue;
    if (p.saleStartedAt && it.order.createdAt < p.saleStartedAt) continue;
    result.set(p.id, (result.get(p.id) || 0) + it.qty);
  }
  return result;
}

export function isSaleActive(p: SaleFields, unitsSold: number, now = Date.now()): boolean {
  if (!p.isOnSale || !p.salePrice || p.salePrice >= p.price) return false;
  if (p.saleExpiresAt && now > p.saleExpiresAt.getTime()) return false;
  if (p.saleMaxUnits && unitsSold >= p.saleMaxUnits) return false;
  return true;
}

/** Campos de oferta tal como los espera el front (ProductItem). */
export function serializeSale(p: SaleFields, unitsSold: number) {
  return {
    isOnSale: p.isOnSale,
    salePrice: p.salePrice ?? undefined,
    saleType: (p.saleType as ProductOfferType | null) ?? undefined,
    saleExpiresAt: p.saleExpiresAt?.toISOString(),
    saleMaxUnits: p.saleMaxUnits ?? undefined,
    saleUnitsSold: unitsSold,
  };
}

/**
 * Traduce el patch del panel a columnas. Desactivar la oferta limpia todo;
 * activarla (o cambiar el precio) reinicia el conteo de unidades vendidas.
 */
export function saleDataFromPatch(
  patch: Record<string, unknown>,
  current: { isOnSale: boolean; salePrice: number | null } | null,
) {
  if (patch.isOnSale === undefined) return {};
  if (patch.isOnSale !== true) {
    return {
      isOnSale: false,
      salePrice: null,
      saleType: null,
      saleExpiresAt: null,
      saleMaxUnits: null,
      saleStartedAt: null,
    };
  }

  const salePrice = Math.round(Number(patch.salePrice));
  const saleType = SALE_TYPES.includes(patch.saleType as ProductOfferType) ? (patch.saleType as string) : "time";
  const expires = typeof patch.saleExpiresAt === "string" ? new Date(patch.saleExpiresAt) : null;
  const maxUnits = Math.round(Number(patch.saleMaxUnits));
  const restart = !current?.isOnSale || current.salePrice !== salePrice;

  return {
    isOnSale: true,
    salePrice: Number.isFinite(salePrice) && salePrice > 0 ? salePrice : null,
    saleType,
    saleExpiresAt:
      (saleType === "time" || saleType === "both") && expires && !Number.isNaN(expires.getTime()) ? expires : null,
    saleMaxUnits: (saleType === "quantity" || saleType === "both") && maxUnits > 0 ? maxUnits : null,
    ...(restart ? { saleStartedAt: new Date() } : {}),
  };
}
