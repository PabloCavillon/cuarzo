import { describe, it, expect, vi, afterEach } from "vitest";
import { noonAR, todayAR } from "@/lib/utils/dates";

afterEach(() => vi.useRealTimers());

describe("todayAR", () => {
  it("is still the previous day at 01:00 UTC", () => {
    vi.useFakeTimers({ now: new Date("2026-10-28T01:00:00Z") });
    expect(todayAR()).toBe("2026-10-27");
  });
});

describe("noonAR", () => {
  it("keeps the calendar day in UTC", () => {
    expect(noonAR("2026-10-27").toISOString().slice(0, 10)).toBe("2026-10-27");
  });
});
