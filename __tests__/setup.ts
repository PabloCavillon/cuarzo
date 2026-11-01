import { vi } from "vitest";

// ── Resend email SDK ─────────────────────────────────────────────────────────
// Must use a regular function (not arrow) so `new Resend()` works as a constructor.
vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn(function (this: any) {
    this.emails = { send: vi.fn().mockResolvedValue({ data: { id: "email-id-123" }, error: null }) };
  }),
}));

// ── Environment variables needed by tests ────────────────────────────────────
process.env.RESEND_API_KEY = "re_test_key";
