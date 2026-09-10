import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { deleteMeta, getMetas, updateMeta, type MetaEstado, type MetaPrioridad } from "@/lib/panel/db";

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyToken(token).valid;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const metaId = Number(id);
  if (isNaN(metaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();

    const data: {
      titulo?: string;
      descripcion?: string;
      colaborador_id?: number | null;
      tipo?: string;
      prioridad?: MetaPrioridad;
      fecha_limite?: string;
      estado?: MetaEstado;
      orden?: number;
    } = {};
    if (body.titulo !== undefined && String(body.titulo).trim() !== "") data.titulo = String(body.titulo).trim();
    if (body.descripcion !== undefined) data.descripcion = String(body.descripcion);
    if (body.colaborador_id !== undefined) data.colaborador_id = body.colaborador_id != null && body.colaborador_id !== "" ? Number(body.colaborador_id) : null;
    if (body.tipo !== undefined) data.tipo = String(body.tipo);
    if (body.prioridad !== undefined && ["alta", "media", "baja"].includes(body.prioridad)) data.prioridad = body.prioridad;
    if (body.fecha_limite !== undefined) data.fecha_limite = String(body.fecha_limite);
    if (body.estado !== undefined && ["pendiente", "progreso", "completada"].includes(body.estado)) data.estado = body.estado;
    if (body.orden !== undefined) data.orden = Number(body.orden);

    updateMeta(metaId, data);
    return NextResponse.json({ metas: getMetas() });
  } catch {
    return NextResponse.json({ error: "Error al actualizar la meta" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  deleteMeta(Number(id));
  return NextResponse.json({ metas: getMetas() });
}
