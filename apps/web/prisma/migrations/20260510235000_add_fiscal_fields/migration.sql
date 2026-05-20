-- DropIndex
DROP INDEX "fiscal_invoices_tenant_id_tipo_comprobante_numero_key";

-- AlterTable
ALTER TABLE "fiscal_configs" ADD COLUMN     "production" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ta_expiration" TIMESTAMP(3),
ADD COLUMN     "ta_sign" TEXT,
ADD COLUMN     "ta_token" TEXT;

-- AlterTable
ALTER TABLE "fiscal_invoices" ADD COLUMN     "concepto" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "environment" TEXT NOT NULL DEFAULT 'test',
ADD COLUMN     "fecha" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "importe_iva" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "importe_neto" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "punto_venta" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "receptor_doc_nro" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "receptor_doc_tipo" INTEGER NOT NULL DEFAULT 99,
ADD COLUMN     "receptor_nombre" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_invoices_tenant_id_tipo_comprobante_punto_venta_nume_key" ON "fiscal_invoices"("tenant_id", "tipo_comprobante", "punto_venta", "numero");
