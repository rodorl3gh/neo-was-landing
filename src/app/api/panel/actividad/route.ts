import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { getActivitySince, getLatestActivityId } from "@/lib/panel/db";

const SENSITIVE_TYPES = [
  "password_cambiada",
  "rol_cambiado",
  "usuario_renombrado",
  "usuario_colaborador",
  "usuario_creado",
  "usuario_eliminado",
];

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const sinceParam = req.nextUrl.searchParams.get("since");
  const latestId = getLatestActivityId();

  if (sinceParam == null) {
    return NextResponse.json({ actividad: [], latestId });
  }

  const since = Number(sinceParam);
  if (!Number.isFinite(since)) {
    return NextResponse.json({ actividad: [], latestId });
  }

  const actividad = getActivitySince(since).filter(
    (a) => me.superadmin || !SENSITIVE_TYPES.includes(a.tipo)
  );
  return NextResponse.json({ actividad, latestId });
}
