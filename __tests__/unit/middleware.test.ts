import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import proxy from "../../proxy";

// The limiter only runs in production.
vi.stubEnv("NODE_ENV", "production");

const contact = (ip: string) => {
  const req = new NextRequest("http://localhost/api/contact", { method: "POST" });
  req.headers.set("x-forwarded-for", ip);
  return proxy(req);
};

describe("contact rate limit", () => {
  it("allows 5 messages a minute and blocks the sixth", async () => {
    for (let i = 0; i < 5; i++) expect(contact("10.0.0.1").status).not.toBe(429);

    const blocked = contact("10.0.0.1");
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("60");
    expect(typeof (await blocked.json()).error).toBe("string");
  });

  it("counts each IP on its own", () => {
    for (let i = 0; i < 6; i++) contact("10.0.0.2");
    expect(contact("10.0.0.3").status).not.toBe(429);
  });
});
