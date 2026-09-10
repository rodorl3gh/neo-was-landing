import { NextRequest, NextResponse } from "next/server";
import { createMeta, getMetas, reorderMetas, logActivity, getColaboradorById, type MetaPrioridad } from "@/lib/panel/db";
import { authFromRequest } from "@/lib/panel/request";

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const colaboradorParam = sp.get("colaborador");
  const metas = getMetas({
    colaborador_id: colaboradorParam != null ? Number(colaboradorParam) : undefined,
    tipo: sp.get("tipo") || undefined,
    estado: sp.get("estado") || undefined,
    desde: sp.get("desde") || undefined,
    hasta: sp.get("hasta") || undefined,
  });
  return NextResponse.json({ metas });
}

export async function POST(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const titulo = String(body.titulo || "").trim();
    if (!titulo) return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    const pasos: string[] = Array.isArray(body.pasos)
      ? body.pasos.map((p: unknown) => String(p)).filter((p: string) => p.trim() !== "")
      : [];
    const prioridad: MetaPrioridad = ["alta", "media", "baja"].includes(body.prioridad) ? body.prioridad : "media";
    const colaboradorId = body.colaborador_id != null && body.colaborador_id !== "" ? Number(body.colaborador_id) : null;
    const id = createMeta({
      titulo,
      descripcion: body.descripcion ? String(body.descripcion) : "",
      colaborador_id: colaboradorId,
      tipo: body.tipo ? String(body.tipo) : "trabajo",
      prioridad,
      fecha_limite: body.fecha_limite ? String(body.fecha_limite) : "",
      estado: ["pendiente", "progreso", "completada"].includes(body.estado) ? body.estado : "pendiente",
      pasos,
    });
    const colab = colaboradorId ? getColaboradorById(colaboradorId) : null;
    logActivity({
      tipo: "meta_creada",
      actor: me.username || "",
      mensaje: `${me.username} creó la meta "${titulo}"${colab ? ` para ${colab.nombre}` : ""}`,
      detalle: body.fecha_limite ? `Fecha límite: ${body.fecha_limite}` : "",
    });
    return NextResponse.json({ id, metas: getMetas() });
  } catch {
    return NextResponse.json({ error: "Error al crear la meta" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    if (!Array.isArray(body.ordenes)) return NextResponse.json({ error: "Se requiere el arreglo de órdenes" }, { status: 400 });
    reorderMetas(body.ordenes.map((o: { id: number; orden: number }) => ({ id: Number(o.id), orden: Number(o.orden) })));
    return NextResponse.json({ metas: getMetas() });
  } catch {
    return NextResponse.json({ error: "Error al reordenar" }, { status: 500 });
  }
}
