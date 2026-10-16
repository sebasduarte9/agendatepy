-- CreateEnum
CREATE TYPE "web_event_type" AS ENUM ('CLICK', 'MOUSE_MOVE', 'SCROLL');

-- CreateTable
CREATE TABLE "web_analytics_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "page_path" TEXT NOT NULL,
    "device_type" TEXT NOT NULL DEFAULT 'desktop',
    "viewport_width" INTEGER NOT NULL DEFAULT 1280,
    "viewport_height" INTEGER NOT NULL DEFAULT 800,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "web_analytics_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_analytics_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_record_id" UUID,
    "event_type" "web_event_type" NOT NULL,
    "page_path" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scroll_depth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewport_width" INTEGER NOT NULL DEFAULT 1280,
    "viewport_height" INTEGER NOT NULL DEFAULT 800,
    "element_selector" TEXT,
    "element_tag" TEXT,
    "element_text" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "web_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "web_analytics_sessions_tenant_id_session_id_page_path_key"
ON "web_analytics_sessions"("tenant_id", "session_id", "page_path");

-- CreateIndex
CREATE INDEX "web_analytics_sessions_tenant_id_created_at_idx"
ON "web_analytics_sessions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "web_analytics_sessions_session_id_idx"
ON "web_analytics_sessions"("session_id");

-- CreateIndex
CREATE INDEX "web_analytics_events_tenant_id_event_type_created_at_idx"
ON "web_analytics_events"("tenant_id", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "web_analytics_events_tenant_id_page_path_idx"
ON "web_analytics_events"("tenant_id", "page_path");

-- CreateIndex
CREATE INDEX "web_analytics_events_session_id_idx"
ON "web_analytics_events"("session_id");

-- AddForeignKey
ALTER TABLE "web_analytics_sessions"
ADD CONSTRAINT "web_analytics_sessions_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_analytics_events"
ADD CONSTRAINT "web_analytics_events_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_analytics_events"
ADD CONSTRAINT "web_analytics_events_session_record_id_fkey"
FOREIGN KEY ("session_record_id") REFERENCES "web_analytics_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
