"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type State = "unsupported" | "denied" | "off" | "loading" | "on";

export function NotificationToggle() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    });
  }, []);

  async function enable() {
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await fetch("/api/admin/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(json),
      });

      setState("on");
    } catch {
      setState("off");
    }
  }

  async function disable() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/admin/push/subscribe", {
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("off");
    }
  }

  if (state === "unsupported") return null;

  if (state === "loading") {
    return (
      <div className="p-1.5 text-white/30">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div title="Notificaciones bloqueadas en el navegador" className="p-1.5 text-white/20 cursor-not-allowed">
        <BellOff className="w-4 h-4" />
      </div>
    );
  }

  if (state === "on") {
    return (
      <button
        onClick={disable}
        title="Desactivar notificaciones"
        className="p-1.5 rounded-lg text-amber-400 hover:bg-white/8 transition-colors"
      >
        <Bell className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={enable}
      title="Activar notificaciones push"
      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
    >
      <BellOff className="w-4 h-4" />
    </button>
  );
}
