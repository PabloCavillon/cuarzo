export function appUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;
  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") throw new Error("NEXT_PUBLIC_APP_URL not configured");
  return "http://localhost:3000";
}
