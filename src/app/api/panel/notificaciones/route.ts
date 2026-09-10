import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { getActivityLog } from "@/lib/panel/db";

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!me.superadmin) return NextResponse.json({ error: "Solo el superadministrador puede ver las notificaciones" }, { status: 403 });
  const limit = Number(req.nextUrl.searchParams.get("limit") || 200);
  return NextResponse.json({ actividad: getActivityLog(Number.isFinite(limit) ? limit : 200) });
}
