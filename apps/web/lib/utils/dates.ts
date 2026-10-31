// Vercel runs in UTC; the business day is Argentina's (UTC-3, no daylight saving).
const TZ = "America/Argentina/Buenos_Aires";

export function todayAR(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: TZ });
}

export function startOfDayAR(day = todayAR()): Date {
  return new Date(`${day}T00:00:00-03:00`);
}

// Noon keeps a date-only value on the same calendar day in UTC and in Argentina.
export function noonAR(day = todayAR()): Date {
  return new Date(`${day}T12:00:00-03:00`);
}
