-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "theme_settings" JSONB NOT NULL DEFAULT '{"primaryColor":"#5b31e6","backgroundColor":"#f4f2fb","fontFamily":"sans","logoUrl":""}';
