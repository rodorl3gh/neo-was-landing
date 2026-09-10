import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { deleteColaborador, getColaboradores, updateColaborador } from "@/lib/panel/db";

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
    nombre?: string;
    puesto?: string;
    icono?: string;
    color?: string;
    activo?: boolean;
    orden?: number;
  } = {};
  if (body.nombre !== undefined && String(body.nombre).trim() !== "") data.nombre = String(body.nombre).trim();
  if (body.puesto !== undefined) data.puesto = String(body.puesto);
  if (body.icono !== undefined) data.icono = String(body.icono);
  if (body.color !== undefined) data.color = String(body.color);
  if (body.activo !== undefined) data.activo = Boolean(body.activo);
  if (body.orden !== undefined) data.orden = Number(body.orden);
  updateColaborador(Number(id), data);
  return NextResponse.json({ colaboradores: getColaboradores() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  deleteColaborador(Number(id));
  return NextResponse.json({ colaboradores: getColaboradores() });
}
