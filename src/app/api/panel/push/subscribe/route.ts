import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { addPushSubscription } from "@/lib/panel/db";

export async function POST(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid || !me.username) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const endpoint = String(body?.endpoint || "");
    const p256dh = String(body?.keys?.p256dh || "");
    const auth = String(body?.keys?.auth || "");
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }
    addPushSubscription({ username: me.username, endpoint, p256dh, auth });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la suscripción" }, { status: 500 });
  }
}
