import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { removePushSubscription } from "@/lib/panel/db";

export async function POST(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const endpoint = String(body?.endpoint || "");
    if (endpoint) removePushSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la suscripción" }, { status: 500 });
  }
}
