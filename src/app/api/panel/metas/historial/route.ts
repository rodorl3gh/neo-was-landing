import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { getHistorialMetas, getHistorialStats, META_HISTORY_DAYS } from "@/lib/panel/db";

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({
    metas: getHistorialMetas(),
    stats: getHistorialStats(),
    retencionDias: META_HISTORY_DAYS,
  });
}
