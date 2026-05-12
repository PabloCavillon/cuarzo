import { vi } from "vitest";

// ── Next.js server-only guard ────────────────────────────────────────────────
vi.mock("server-only", () => ({}));

// ── next/headers (used by getRequestIp in server actions) ────────────────────
// Use a stable factory (not vi.fn) so resetAllMocks() doesn't break it.
vi.mock("next/headers", () => ({
  headers: () => Promise.resolve({ get: () => null }),
  cookies: () => Promise.resolve({ get: () => null }),
}));

// ── Next.js cache helpers ────────────────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag:  vi.fn(),
}));

// ── Next.js navigation ───────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter:   vi.fn(() => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/"),
  redirect:    vi.fn(),
  notFound:    vi.fn(),
}));

// ── next-auth client (browser) ───────────────────────────────────────────────
vi.mock("next-auth/react", () => ({
  signIn:    vi.fn(),
  signOut:   vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}));

// ── Resend email SDK ─────────────────────────────────────────────────────────
// Must use a regular function (not arrow) so `new Resend()` works as a constructor.
vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn(function (this: any) {
    this.emails = { send: vi.fn().mockResolvedValue({ data: { id: "email-id-123" }, error: null }) };
  }),
}));

// ── Environment variables needed by tests ────────────────────────────────────
process.env.RESEND_API_KEY     = "re_test_key";
process.env.NEXTAUTH_URL       = "http://localhost:3000";
process.env.AUTH_SECRET        = "test-secret-32-bytes-long-enough!!";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.MP_ACCESS_TOKEN    = "TEST-mp-token";
