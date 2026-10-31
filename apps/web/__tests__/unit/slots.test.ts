import { describe, it, expect } from "vitest";
import { isTaken } from "@/lib/utils/slots";

const busy = [{ time: "10:00", duration: 120 }];

describe("isTaken", () => {
  it("catches a start inside a longer booking", () => expect(isTaken("10:30", 30, busy)).toBe(true));
  it("catches a booking that runs into the next one", () => expect(isTaken("09:30", 60, busy)).toBe(true));
  it("allows back to back", () => {
    expect(isTaken("09:00", 60, busy)).toBe(false);
    expect(isTaken("12:00", 30, busy)).toBe(false);
  });
});
