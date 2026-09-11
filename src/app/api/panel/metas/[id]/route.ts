import { NextRequest, NextResponse } from "next/server";
import { deleteMeta, getMetaById, getMetas, logActivity, updateMeta, type MetaEstado, type MetaPrioridad } from "@/lib/panel/db";
import { authFromRequest } from "@/lib/panel/request";

const ESTADO_LABEL: Record<string, string> = { pendiente: "Pendiente", progreso: "En progreso", completada: "Completada" };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const metaId = Number(id);
  if (isNaN(metaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const before = getMetaById(metaId);

    const data: {
      titulo?: string;
      descripcion?: string;
      colaborador_id?: number | null;
      colaborador_ids?: number[];
      tipo?: string;
      prioridad?: MetaPrioridad;
      fecha_limite?: string;
      estado?: MetaEstado;
      orden?: number;
    } = {};
    if (body.titulo !== undefined && String(body.titulo).trim() !== "") data.titulo = String(body.titulo).trim();
    if (body.descripcion !== undefined) data.descripcion = String(body.descripcion);
    if (Array.isArray(body.colaborador_ids)) {
      data.colaborador_ids = body.colaborador_ids.map((v: unknown) => Number(v)).filter((n: number) => Number.isFinite(n));
    } else if (body.colaborador_id !== undefined) {
      data.colaborador_id = body.colaborador_id != null && body.colaborador_id !== "" ? Number(body.colaborador_id) : null;
    }
    if (body.tipo !== undefined) data.tipo = String(body.tipo);
    if (body.prioridad !== undefined && ["alta", "media", "baja"].includes(body.prioridad)) data.prioridad = body.prioridad;
    if (body.fecha_limite !== undefined) data.fecha_limite = String(body.fecha_limite);
    if (body.estado !== undefined && ["pendiente", "progreso", "completada"].includes(body.estado)) data.estado = body.estado;
    if (body.orden !== undefined) data.orden = Number(body.orden);

    updateMeta(metaId, data);

    if (data.estado && before && before.estado !== data.estado) {
      logActivity({
        tipo: data.estado === "completada" ? "meta_completada" : "meta_estado",
        actor: me.username || "",
        mensaje: `${me.username} marcó la meta "${before.titulo}" como ${ESTADO_LABEL[data.estado] || data.estado}`,
      });
    } else if (Object.keys(data).length > 0 && !data.orden) {
      logActivity({
        tipo: "meta_editada",
        actor: me.username || "",
        mensaje: `${me.username} editó la meta "${data.titulo || before?.titulo || ""}"`,
      });
    }

    return NextResponse.json({ metas: getMetas() });
  } catch {
    return NextResponse.json({ error: "Error al actualizar la meta" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const metaId = Number(id);
  const before = getMetaById(metaId);
  deleteMeta(metaId);
  if (before) {
    logActivity({ tipo: "meta_eliminada", actor: me.username || "", mensaje: `${me.username} eliminó la meta "${before.titulo}"` });
  }
  return NextResponse.json({ metas: getMetas() });
}
