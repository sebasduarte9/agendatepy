import { NextResponse, type NextRequest } from "next/server";
import { CashMovementType, ProductOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireTenantSession, isGuardError, UUID_REGEX } from "@/lib/api-guard";
import { ALLOWED_FROM, STATUS_FROM_CLIENT, orderInclude, serializeOrder } from "@/lib/product-orders";
import type { ProductOrder } from "@/lib/dashboard-types";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

class OrderTransitionError extends Error {}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const auth = await requireTenantSession(request, ["OWNER", "SUPERADMIN"]);
    if (isGuardError(auth)) return auth;

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ ok: false, error: "VALIDATION_ERROR", message: "Pedido inválido." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const nextStatus = STATUS_FROM_CLIENT[body?.status as ProductOrder["status"]];
    if (!nextStatus || nextStatus === ProductOrderStatus.PENDING) {
      return NextResponse.json({ ok: false, error: "VALIDATION_ERROR", message: "Estado inválido." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Cambio condicionado al estado actual: si dos pedidos de "entregado" llegan juntos, solo uno pasa
      const moved = await tx.productOrder.updateMany({
        where: { id, tenantId: auth.tenantId, status: { in: ALLOWED_FROM[nextStatus] } },
        data: {
          status: nextStatus,
          ...(nextStatus === ProductOrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
        },
      });
      if (moved.count === 0) {
        throw new OrderTransitionError();
      }

      const order = await tx.productOrder.findUniqueOrThrow({ where: { id }, include: orderInclude });
      if (nextStatus !== ProductOrderStatus.DELIVERED) {
        return { order, cashMovement: null, stock: [] as { id: string; stock: number }[] };
      }

      // Descontar stock (sin bajar de 0) de los productos que siguen existiendo
      const stock: { id: string; stock: number }[] = [];
      for (const item of order.items) {
        if (!item.productId) continue;
        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId: auth.tenantId },
          select: { id: true, stock: true },
        });
        if (!product || product.stock === null) continue;
        const nextStock = Math.max(0, product.stock - item.qty);
        await tx.product.update({ where: { id: product.id }, data: { stock: nextStock } });
        stock.push({ id: product.id, stock: nextStock });
      }

      const cashMovement = await tx.cashMovement.create({
        data: {
          tenantId: auth.tenantId,
          type: CashMovementType.INCOME,
          amount: order.totalAmount,
          category: "Venta Producto",
          description: `Venta de producto: ${order.items.map((i) => `${i.qty}x ${i.productName}`).join(", ")} · ${order.orderNumber}`,
          paymentMethod: order.paymentMethod,
          createdBy: auth.session.name || "Cajero",
        },
      });
      const delivered = await tx.productOrder.update({
        where: { id },
        data: { cashMovementId: cashMovement.id },
        include: orderInclude,
      });

      await tx.platformEvent.create({
        data: {
          event: "PRODUCT_ORDER_DELIVERED",
          tenantId: auth.tenantId,
          entityType: "ProductOrder",
          entityId: id,
          metadata: { totalAmount: order.totalAmount, cashMovementId: cashMovement.id },
        },
      });

      return { order: delivered, cashMovement, stock };
    });

    return NextResponse.json({
      ok: true,
      order: serializeOrder(result.order),
      stock: result.stock,
      cashMovement: result.cashMovement && {
        id: result.cashMovement.id,
        type: "ingreso",
        amount: result.cashMovement.amount,
        method: result.cashMovement.paymentMethod,
        concept: result.cashMovement.description,
        date: result.cashMovement.createdAt.toISOString(),
        category: result.cashMovement.category,
        createdBy: result.cashMovement.createdBy,
      },
    });
  } catch (error) {
    if (error instanceof OrderTransitionError) {
      return NextResponse.json(
        { ok: false, error: "INVALID_TRANSITION", message: "Este pedido ya cambió de estado. Actualizá la lista." },
        { status: 409 },
      );
    }
    console.error("Error en PATCH /api/dashboard/orders/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "DB_UNAVAILABLE", message: "No se pudo actualizar el pedido." },
      { status: 500 },
    );
  }
}
