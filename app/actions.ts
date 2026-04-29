"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("El email no es válido"),
  business: z.string().optional(),
  service: z.enum(["WEB", "BRAND", "BOTH"], {
    message: "Seleccioná un servicio",
  }),
  message: z.string().optional(),
});

export type LeadState = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
} | null;

export async function registerLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    business: formData.get("business") || undefined,
    service: formData.get("service"),
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])
      ) as LeadState extends null ? never : NonNullable<LeadState>["fieldErrors"],
    };
  }

  try {
    await prisma.lead.create({ data: parsed.data });
    return { success: true };
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { success: false, error: "Ese email ya está registrado. ¡Pronto te contacto!" };
    }
    return { success: false, error: "Ocurrió un error. Intentá de nuevo." };
  }
}
