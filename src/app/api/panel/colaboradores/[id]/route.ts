import { NextRequest, NextResponse } from "next/server";
import { deleteColaborador, getColaboradorById, getColaboradores, logActivity, updateColaborador } from "@/lib/panel/db";
import { authFromRequest } from "@/lib/panel/request";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
  if (data.nombre || data.puesto !== undefined || data.icono !== undefined || data.color !== undefined) {
    logActivity({ tipo: "colaborador_editado", actor: me.username || "", mensaje: `${me.username} actualizó al colaborador ${data.nombre || id}` });
  }
  return NextResponse.json({ colaboradores: getColaboradores() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const colab = getColaboradorById(Number(id));
  deleteColaborador(Number(id));
  if (colab) logActivity({ tipo: "colaborador_eliminado", actor: me.username || "", mensaje: `${me.username} eliminó al colaborador ${colab.nombre}` });
  return NextResponse.json({ colaboradores: getColaboradores() });
}
