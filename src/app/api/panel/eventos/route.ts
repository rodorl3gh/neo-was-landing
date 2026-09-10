import { NextRequest, NextResponse } from "next/server";
import { createEvento, getEventos, logActivity } from "@/lib/panel/db";
import { authFromRequest } from "@/lib/panel/request";

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  return NextResponse.json({
    eventos: getEventos({ desde: sp.get("desde") || undefined, hasta: sp.get("hasta") || undefined }),
  });
}

export async function POST(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const titulo = String(body.titulo || "").trim();
  const fecha = String(body.fecha || "").trim();
  if (!titulo) return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
  if (!fecha) return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 });
  const id = createEvento({
    titulo,
    descripcion: body.descripcion ? String(body.descripcion) : "",
    fecha,
    hora: body.hora ? String(body.hora) : "09:00",
    colaborador_id: body.colaborador_id != null && body.colaborador_id !== "" ? Number(body.colaborador_id) : null,
    color: body.color ? String(body.color) : "",
  });
  logActivity({ tipo: "evento_creado", actor: me.username || "", mensaje: `${me.username} creó el evento "${titulo}" (${fecha})` });
  return NextResponse.json({ id, eventos: getEventos() });
}
