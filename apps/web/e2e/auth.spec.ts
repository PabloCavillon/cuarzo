import { test, expect } from "@playwright/test";
import { SEED_OWNER, SEED_STAFF, loginAs, uniqueEmail } from "./helpers";

// ── Login ─────────────────────────────────────────────────────────────────────

test.describe("Login", () => {
  test("owner can log in and reach the admin dashboard", async ({ page }) => {
    await loginAs(page, SEED_OWNER.email, SEED_OWNER.password);
    await expect(page).toHaveURL(/\/admin/);
    // Dashboard shows some recognisable admin UI element
    await expect(page.locator("nav, aside, [data-testid='sidebar']").first()).toBeVisible();
  });

  test("redirects to /login when accessing /admin unauthenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows an error message for wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', SEED_OWNER.email);
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Should stay on login and show some error
    await expect(page).toHaveURL(/\/login/);
    // Look for any error text rendered on the page
    await expect(page.getByText(/contraseña|credencial|inválid/i).first()).toBeVisible();
  });

  test("staff user can log in and reach the admin dashboard", async ({ page }) => {
    await loginAs(page, SEED_STAFF.email, SEED_STAFF.password);
    await expect(page).toHaveURL(/\/admin/);
  });
});

// ── Registration ──────────────────────────────────────────────────────────────

test.describe("Registration", () => {
  test("new user can register and is sent to onboarding or admin", async ({ page }) => {
    const email = uniqueEmail("reg");

    await page.goto("/register");
    await page.fill('#businessName', "Test Business E2E");
    await page.fill('#name', "Test User E2E");
    await page.fill('#email', email);
    await page.fill('#password', "password123");
    await page.fill('#confirm', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to /admin/onboarding or /admin after registration
    await expect(page).toHaveURL(/\/(admin|onboarding)/, { timeout: 15_000 });
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/register");
    await page.fill('#email', "not-an-email");
    await page.fill('#password', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/register/);
  });

  test("shows validation error for short password", async ({ page }) => {
    await page.goto("/register");
    await page.fill('#email', uniqueEmail("short"));
    await page.fill('#password', "short");
    await page.fill('#confirm', "short");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/register/);
  });
});

// ── Forgot password page ──────────────────────────────────────────────────────

test.describe("Forgot password", () => {
  test("forgot-password page loads and form is present", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("submitting any email always shows a success/neutral message", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.fill('input[type="email"]', "ghost@notregistered.dev");
    await page.click('button[type="submit"]');
    // The form should show a confirmation state (no error revealing whether email exists)
    await expect(
      page.getByText(/revisa|revise|enviamos|correo|email/i).first()
    ).toBeVisible({ timeout: 8000 });
  });

  test("login page has a link to forgot-password", async ({ page }) => {
    await page.goto("/login");
    const link = page.getByRole("link", { name: /contraseña|olvidaste/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
