self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Cuarzo", {
      body:  data.body  ?? "",
      icon:  "/icon-192.png",
      badge: "/icon-192.png",
      data:  { url: data.url ?? "/admin/tasks" },
      vibrate: [100, 50, 100],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const target = event.notification.data?.url ?? "/admin/tasks";
        for (const client of list) {
          if (client.url.includes(target) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(target);
      }),
  );
});
