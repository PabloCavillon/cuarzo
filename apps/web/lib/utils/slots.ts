export type Busy = { time: string; duration: number };

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isTaken(time: string, duration: number, busy: Busy[]): boolean {
  const start = toMinutes(time);
  return busy.some((b) => {
    const other = toMinutes(b.time);
    return start < other + b.duration && other < start + duration;
  });
}
