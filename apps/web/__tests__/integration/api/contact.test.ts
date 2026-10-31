import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const emailMock = vi.hoisted(() => ({
  sendContactMessage: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/integrations/email", () => emailMock);

import { POST } from "@/app/api/contact/route";

function postReq(body: string): NextRequest {
  return new NextRequest("http://localhost/api/contact", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

const VALID = { name: "  Ana\n García ", email: "ana@example.com", message: "Necesito un bot" };

describe("POST /api/contact", () => {
  beforeEach(() => {
    emailMock.sendContactMessage.mockReset().mockResolvedValue(true);
  });

  it("sends the message with a single-line name", async () => {
    const res = await POST(postReq(JSON.stringify(VALID)));
    expect(res.status).toBe(200);
    expect(emailMock.sendContactMessage).toHaveBeenCalledWith({
      name: "Ana García", email: "ana@example.com", company: undefined, message: "Necesito un bot",
    });
  });

  it.each([
    ["missing name", { ...VALID, name: " " }],
    ["bad email", { ...VALID, email: "ana" }],
    ["missing message", { ...VALID, message: "" }],
    ["non-string company", { ...VALID, company: 1 }],
  ])("rejects %s", async (_, body) => {
    const res = await POST(postReq(JSON.stringify(body)));
    expect(res.status).toBe(400);
    expect(emailMock.sendContactMessage).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    expect((await POST(postReq("{"))).status).toBe(400);
  });

  it("reports failure when the email was not sent", async () => {
    emailMock.sendContactMessage.mockResolvedValue(false);
    expect((await POST(postReq(JSON.stringify(VALID)))).status).toBe(502);
  });

  it("reports failure when the provider throws", async () => {
    emailMock.sendContactMessage.mockRejectedValue(new Error("down"));
    expect((await POST(postReq(JSON.stringify(VALID)))).status).toBe(502);
  });
});
