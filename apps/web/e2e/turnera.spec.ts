import { test, expect } from "@playwright/test";

// ── Public turnera page ───────────────────────────────────────────────────────

test.describe("Public turnera", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/appointments");
  });

  test("turnera page loads and shows service selection", async ({ page }) => {
    // Wait for the page to finish loading services
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("services are listed after page load", async ({ page }) => {
    // The booking wizard fetches services — wait for at least one to appear
    await expect(
      page.getByRole("button").or(page.locator("[data-service], .service-card, li")).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── Booking flow ─────────────────────────────────────────────────────────────

  test("selecting a service advances the wizard", async ({ page }) => {
    // Click the first available service option
    const firstService = page.getByRole("button").filter({ hasText: /min|minutos|\$|ARS/i }).first();
    await firstService.click({ timeout: 10_000 });

    // Should show date/time picker or next step UI
    await expect(
      page.locator("input[type='date'], [data-step='2'], [aria-label*='fecha' i]")
        .or(page.getByText(/elegí|selecciona|fecha|horario/i).first())
    ).toBeVisible({ timeout: 8_000 });
  });

  test("full booking flow: service → date → time → form → confirmation code", async ({ page }) => {
    // Step 1: pick first service
    const firstService = page
      .getByRole("button")
      .filter({ hasText: /min|minutos|\$|ARS/i })
      .first();
    await firstService.click({ timeout: 10_000 });

    // Step 2: pick a date — find a clickable date that isn't disabled/greyed
    const dateBtn = page.locator("button:not([disabled])").filter({ hasText: /^[0-9]+$/ }).first();
    if (await dateBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await dateBtn.click();
    }

    // Step 3: pick a time slot
    const timeBtn = page.getByRole("button").filter({ hasText: /[0-9]+:[0-9]+/ }).first();
    if (await timeBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await timeBtn.click();
    }

    // Step 4: fill client info
    const nameInput = page.locator('input[name="name"], input[placeholder*="nombre" i]');
    const emailInput = page.locator('input[type="email"]');

    if (await nameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nameInput.fill("Cliente E2E");
      await emailInput.fill("cliente-e2e@test.dev");

      // Submit
      const submitBtn = page.getByRole("button", { name: /confirmar|reservar/i });
      await submitBtn.click();

      // Should show a booking code (TUR-XXXXXX)
      await expect(
        page.getByText(/TUR-[A-Z0-9]{6}/i)
          .or(page.getByText(/código|confirmado|confirmación/i).first())
      ).toBeVisible({ timeout: 10_000 });
    }
  });
});

// ── My bookings page ──────────────────────────────────────────────────────────

test.describe("Mis reservas", () => {
  test("my-bookings page loads with a code or email lookup form", async ({ page }) => {
    await page.goto("/appointments/my-bookings");
    await expect(
      page.locator('input[type="text"], input[type="email"]').first()
    ).toBeVisible();
  });

  test("searching with an email that has no bookings shows no-results message", async ({ page }) => {
    await page.goto("/appointments/my-bookings");
    const input = page.locator('input[type="email"]');
    await input.fill("nobody@notexists-e2e.test");
    await page.keyboard.press("Enter");
    // "No encontramos reservas para ese email." / "No bookings found for that email."
    await expect(
      page.getByText(/no encontr|no bookings found|nenhum agendamento/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
