import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const sendMock = vi.hoisted(() => vi.fn().mockResolvedValue({ data: { id: "e1" }, error: null }));

// The global setup already mocks "resend", but we need access to the send fn.
// Override it here so we can inspect calls in this file's tests.
// Use a regular function (not arrow) so new Resend() works as a constructor.
vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn(function (this: any) { this.emails = { send: sendMock }; }),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { sendContactMessage } from "@/lib/integrations/email";

describe("sendContactMessage", () => {
  const MESSAGE = { name: "Ana", email: "ana@example.com", message: "<script>x</script>" };

  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    sendMock.mockClear();
    sendMock.mockResolvedValue({ data: { id: "e1" }, error: null });
  });

  it("escapes visitor text in the HTML", async () => {
    await sendContactMessage(MESSAGE);
    const { html } = sendMock.mock.calls[0][0];
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>x");
  });

  it("returns false when the provider reports an error", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "no" } });
    await expect(sendContactMessage(MESSAGE)).resolves.toBe(false);
  });
});
