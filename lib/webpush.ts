import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  await Promise.allSettled(
    subs.map((s) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? "/admin/tasks" }),
        )
        .catch(async (err) => {
          // 410 Gone = subscription expired, clean it up
          if (err.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          }
        }),
    ),
  );
}
