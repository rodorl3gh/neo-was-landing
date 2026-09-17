import webpush from "web-push";
import {
  getSetting,
  setSetting,
  getPushSubscriptions,
  removePushSubscription,
  type ActivityRow,
} from "./db";

const VAPID_PUBLIC_KEY = "vapid_public_key";
const VAPID_PRIVATE_KEY = "vapid_private_key";

let ready = false;

function ensureVapid(): void {
  if (ready) return;
  let publicKey = getSetting(VAPID_PUBLIC_KEY);
  let privateKey = getSetting(VAPID_PRIVATE_KEY);

  if (!publicKey || !privateKey) {
    const generated = webpush.generateVAPIDKeys();
    publicKey = generated.publicKey;
    privateKey = generated.privateKey;
    setSetting(VAPID_PUBLIC_KEY, publicKey);
    setSetting(VAPID_PRIVATE_KEY, privateKey);
  }

  webpush.setVapidDetails("mailto:admin@neowas.app", publicKey, privateKey);
  ready = true;
}

export function getPublicVapidKey(): string {
  ensureVapid();
  return getSetting(VAPID_PUBLIC_KEY);
}

export async function broadcastPush(entry: ActivityRow): Promise<void> {
  const subscriptions = getPushSubscriptions().filter((sub) => !entry.actor || sub.username !== entry.actor);
  if (subscriptions.length === 0) return;

  ensureVapid();

  const payload = JSON.stringify({
    id: entry.id,
    title: "Wasito · Nueva actividad",
    body: entry.mensaje,
    tipo: entry.tipo,
    actor: entry.actor,
    url: "/panel/notificaciones",
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          removePushSubscription(sub.endpoint);
        }
      }
    })
  );
}
