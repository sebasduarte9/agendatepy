import { ProductOrderStatus, type Prisma } from "@prisma/client";
import type { ProductOrder } from "@/lib/dashboard-types";

export const ORDER_PAYMENT_METHODS = ["efectivo", "transferencia", "pos", "sipap"] as const;
export const ORDER_DELIVERY_TYPES = ["retirar_en_local", "delivery"] as const;

const STATUS_TO_CLIENT: Record<ProductOrderStatus, ProductOrder["status"]> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const STATUS_FROM_CLIENT: Record<ProductOrder["status"], ProductOrderStatus> = {
  pending: ProductOrderStatus.PENDING,
  confirmed: ProductOrderStatus.CONFIRMED,
  delivered: ProductOrderStatus.DELIVERED,
  cancelled: ProductOrderStatus.CANCELLED,
};

/** Desde qué estados se puede llegar a cada estado. Entregado y cancelado son finales. */
export const ALLOWED_FROM: Record<ProductOrderStatus, ProductOrderStatus[]> = {
  PENDING: [],
  CONFIRMED: [ProductOrderStatus.PENDING],
  DELIVERED: [ProductOrderStatus.PENDING, ProductOrderStatus.CONFIRMED],
  CANCELLED: [ProductOrderStatus.PENDING, ProductOrderStatus.CONFIRMED],
};

export const orderInclude = {
  items: { orderBy: { id: "asc" } },
} satisfies Prisma.ProductOrderInclude;

type OrderWithItems = Prisma.ProductOrderGetPayload<{ include: typeof orderInclude }>;

export function serializeOrder(order: OrderWithItems): ProductOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    sellerStaffId: order.sellerStaffId ?? undefined,
    items: order.items.map((item) => ({
      productId: item.productId ?? "",
      productName: item.productName,
      qty: item.qty,
      unitPrice: item.unitPrice,
    })),
    totalAmount: order.totalAmount,
    status: STATUS_TO_CLIENT[order.status],
    paymentMethod: (ORDER_PAYMENT_METHODS as readonly string[]).includes(order.paymentMethod)
      ? (order.paymentMethod as ProductOrder["paymentMethod"])
      : "efectivo",
    deliveryType: order.deliveryType === "delivery" ? "delivery" : "retirar_en_local",
    createdAt: order.createdAt.toISOString(),
    notes: order.notes ?? undefined,
  };
}

/** "#PED-1007" → 1007. Los números arrancan en 1001 por negocio. */
export function nextOrderNumber(lastOrderNumber: string | null | undefined): string {
  const last = Number(String(lastOrderNumber ?? "").replace(/\D/g, ""));
  const next = Number.isFinite(last) && last >= 1000 ? last + 1 : 1001;
  return `#PED-${next}`;
}
