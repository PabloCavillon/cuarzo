import { type Page } from "@playwright/test";

export const SEED_OWNER = { email: "admin@cuarzo.dev",   password: "admin123" };
export const SEED_ADMIN = { email: "manager@cuarzo.dev", password: "admin456" };
export const SEED_STAFF = { email: "staff@cuarzo.dev",   password: "staff123" };

/** Login via the UI and wait for the admin dashboard. */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin**");
}

/** Generate a unique email for registration tests so reruns don't conflict. */
export function uniqueEmail(prefix = "test") {
  return `${prefix}+${Date.now()}@cuarzo-e2e.dev`;
}
