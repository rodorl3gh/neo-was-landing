let notifPref = "device";
let notifEnabled = true;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "prefs") {
    notifPref = data.sound || "device";
    notifEnabled = data.enabled !== false;
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};
      try {
        payload = event.data ? event.data.json() : {};
      } catch {
        payload = {};
      }

      const title = payload.title || "Wasito";
      const body = payload.body || "Nueva actividad en el panel";
      const url = payload.url || "/panel/notificaciones";

      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const focused = clients.some((c) => c.focused || c.visibilityState === "visible");

      if (!notifEnabled) return;

      if (focused && notifPref !== "device") {
        clients.forEach((c) => c.postMessage({ type: "push", data: payload }));
        return;
      }

      await self.registration.showNotification(title, {
        body,
        icon: "/logo-mark.png",
        badge: "/logo-mark.png",
        tag: "wasito-activity",
        renotify: true,
        data: { url },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/panel/notificaciones";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if ("focus" in client) {
          if (client.navigate) {
            try {
              client.navigate(url);
            } catch {
              /* ignore */
            }
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })()
  );
});
