-- CreateEnum
CREATE TYPE "product_order_status" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "product_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "order_number" TEXT NOT NULL,
    "client_id" UUID,
    "client_name" TEXT NOT NULL,
    "client_phone" TEXT NOT NULL,
    "seller_staff_id" UUID,
    "status" "product_order_status" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT NOT NULL DEFAULT 'efectivo',
    "delivery_type" TEXT NOT NULL DEFAULT 'retirar_en_local',
    "notes" TEXT,
    "total_amount" INTEGER NOT NULL,
    "cash_movement_id" UUID,
    "delivered_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID,
    "product_name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,

    CONSTRAINT "product_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_orders_cash_movement_id_key" ON "product_orders"("cash_movement_id");

-- CreateIndex
CREATE INDEX "product_orders_tenant_id_created_at_idx" ON "product_orders"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "product_orders_tenant_id_status_idx" ON "product_orders"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "product_orders_tenant_id_order_number_key" ON "product_orders"("tenant_id", "order_number");

-- CreateIndex
CREATE INDEX "product_order_items_order_id_idx" ON "product_order_items"("order_id");

-- AddForeignKey
ALTER TABLE "product_orders" ADD CONSTRAINT "product_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_orders" ADD CONSTRAINT "product_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_order_items" ADD CONSTRAINT "product_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "product_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_order_items" ADD CONSTRAINT "product_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
