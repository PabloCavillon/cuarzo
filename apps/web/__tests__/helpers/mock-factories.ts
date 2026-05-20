/**
 * Shared test utilities — no vi.fn() here because those must be created
 * inside each test file's vi.hoisted() call to be properly hoisted.
 *
 * What lives here: pure factory helpers that produce plain objects/data.
 */

export type MockRole = "owner" | "admin" | "staff";

export interface MockAuthUser {
  id:       string;
  email:    string;
  name:     string;
  role:     MockRole;
  tenantId: string;
}

export function makeAuthUser(overrides?: Partial<MockAuthUser>): MockAuthUser {
  return {
    id:       "user-1",
    email:    "test@cuarzo.dev",
    name:     "Test User",
    role:     "staff",
    tenantId: "tenant-1",
    ...overrides,
  };
}

export function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.append(k, v);
  return fd;
}

/** Returns a Date N days from today (positive = future, negative = past). */
export function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

/** Returns YYYY-MM-DD string N days from today. */
export function dateStringFromNow(n: number): string {
  return daysFromNow(n).toISOString().slice(0, 10);
}

/** Returns the next weekday (Mon-Fri) that is at least `minDaysAhead` days in the future. */
export function nextWeekday(minDaysAhead = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + minDaysAhead);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Build a NextRequest-like POST request with a JSON body. */
export function makeJsonRequest(url: string, body: unknown, extraHeaders?: Record<string, string>): Request {
  const json = JSON.stringify(body);
  return new Request(url, {
    method:  "POST",
    headers: {
      "Content-Type":   "application/json",
      "content-length": String(new TextEncoder().encode(json).length),
      ...extraHeaders,
    },
    body: json,
  });
}
