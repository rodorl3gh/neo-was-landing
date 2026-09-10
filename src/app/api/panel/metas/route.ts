import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { createMeta, getMetas, reorderMetas, type MetaPrioridad } from "@/lib/panel/db";

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyToken(token).valid;
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const titulo = String(body.titulo || "").trim();
    if (!titulo) return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    const pasos: string[] = Array.isArray(body.pasos)
      ? body.pasos.map((p: unknown) => String(p)).filter((p: string) => p.trim() !== "")
      : [];
    const prioridad: MetaPrioridad = ["alta", "media", "baja"].includes(body.prioridad) ? body.prioridad : "media";
    const id = createMeta({
      titulo,
      descripcion: body.descripcion ? String(body.descripcion) : "",
      colaborador_id: body.colaborador_id != null && body.colaborador_id !== "" ? Number(body.colaborador_id) : null,
      tipo: body.tipo ? String(body.tipo) : "trabajo",
      prioridad,
      fecha_limite: body.fecha_limite ? String(body.fecha_limite) : "",
      estado: ["pendiente", "progreso", "completada"].includes(body.estado) ? body.estado : "pendiente",
      pasos,
    });
    return NextResponse.json({ id, metas: getMetas() });
  } catch {
    return NextResponse.json({ error: "Error al crear la meta" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    if (!Array.isArray(body.ordenes)) return NextResponse.json({ error: "Se requiere el arreglo de órdenes" }, { status: 400 });
    reorderMetas(body.ordenes.map((o: { id: number; orden: number }) => ({ id: Number(o.id), orden: Number(o.orden) })));
    return NextResponse.json({ metas: getMetas() });
  } catch {
    return NextResponse.json({ error: "Error al reordenar" }, { status: 500 });
  }
}
