-- CreateTable
CREATE TABLE "platform_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "event" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_events_tenant_id_idx" ON "platform_events"("tenant_id");

-- CreateIndex
CREATE INDEX "platform_events_event_created_at_idx" ON "platform_events"("event", "created_at");

-- CreateIndex
CREATE INDEX "platform_events_created_at_idx" ON "platform_events"("created_at");

-- AddForeignKey
ALTER TABLE "platform_events" ADD CONSTRAINT "platform_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
