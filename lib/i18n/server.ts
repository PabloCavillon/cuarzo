import { cookies } from "next/headers";
import { locales, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const raw = (await cookies()).get("locale")?.value ?? "es";
  return locales.includes(raw as Locale) ? (raw as Locale) : "es";
}
