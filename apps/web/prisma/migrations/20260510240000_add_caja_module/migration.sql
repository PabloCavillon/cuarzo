-- CreateEnum
CREATE TYPE "CajaTipo" AS ENUM ('ingreso', 'egreso');

-- AlterEnum
ALTER TYPE "ModuleSlug" ADD VALUE 'caja';

-- CreateTable
CREATE TABLE "caja_movimientos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tipo" "CajaTipo" NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT,
    "metodo_pago" TEXT NOT NULL DEFAULT 'efectivo',
    "notes" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caja_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "caja_movimientos_tenant_id_fecha_idx" ON "caja_movimientos"("tenant_id", "fecha");

-- AddForeignKey
ALTER TABLE "caja_movimientos" ADD CONSTRAINT "caja_movimientos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
