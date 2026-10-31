import { after } from "next/server";

// Serverless functions can freeze once they respond, so a bare promise may never finish.
export function inBackground(task: () => Promise<unknown>) {
  after(() => task().catch((e) => console.error("[background]", e)));
}
