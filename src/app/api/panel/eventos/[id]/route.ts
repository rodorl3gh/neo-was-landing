import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { deleteEvento, getEventos, updateEvento } from "@/lib/panel/db";

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyToken(token).valid;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: {
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    hora?: string;
    colaborador_id?: number | null;
    color?: string;
  } = {};
  if (body.titulo !== undefined && String(body.titulo).trim() !== "") data.titulo = String(body.titulo).trim();
  if (body.descripcion !== undefined) data.descripcion = String(body.descripcion);
  if (body.fecha !== undefined) data.fecha = String(body.fecha);
  if (body.hora !== undefined) data.hora = String(body.hora);
  if (body.colaborador_id !== undefined) data.colaborador_id = body.colaborador_id != null && body.colaborador_id !== "" ? Number(body.colaborador_id) : null;
  if (body.color !== undefined) data.color = String(body.color);
  updateEvento(Number(id), data);
  return NextResponse.json({ eventos: getEventos() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  deleteEvento(Number(id));
  return NextResponse.json({ eventos: getEventos() });
}
