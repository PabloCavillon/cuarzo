-- CreateTable
CREATE TABLE "invitations" (
    "id"          TEXT NOT NULL,
    "tenant_id"   TEXT NOT NULL,
    "email"       TEXT NOT NULL,
    "role"        "UserRole" NOT NULL DEFAULT 'staff',
    "token"       TEXT NOT NULL,
    "expires_at"  TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key"          ON "invitations"("token");
CREATE UNIQUE INDEX "invitations_tenant_id_email_key" ON "invitations"("tenant_id", "email");
CREATE INDEX        "invitations_token_idx"           ON "invitations"("token");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
