import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { createDirectorioEntry, getDirectorio, logActivity } from "@/lib/panel/db";
import { TIPO_LABELS } from "@/lib/panel/nichos";

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  return NextResponse.json({
    entradas: getDirectorio({
      tipo: sp.get("tipo") || undefined,
      nicho: sp.get("nicho") || undefined,
      q: sp.get("q") || undefined,
    }),
  });
}

export async function POST(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const negocio = String(body?.negocio || "").trim();
    const nicho = String(body?.nicho || "").trim();
    const tipo = ["prospecto", "cliente"].includes(body?.tipo) ? String(body.tipo) : "prospecto";
    if (!nicho) return NextResponse.json({ error: "El nicho de mercado es requerido" }, { status: 400 });
    if (!negocio) return NextResponse.json({ error: "El nombre del negocio es requerido" }, { status: 400 });
    const id = createDirectorioEntry({
      tipo,
      nicho,
      negocio,
      contacto: String(body?.contacto || "").trim(),
      telefono: String(body?.telefono || "").trim(),
      correo: String(body?.correo || "").trim(),
      fecha_alta: String(body?.fecha_alta || "").trim(),
      servicio: String(body?.servicio || "").trim(),
      notas: String(body?.notas || "").trim(),
    });
    logActivity({
      tipo: "directorio_creado",
      actor: me.username || "",
      mensaje: `${me.username} agregó ${TIPO_LABELS[tipo] || tipo} "${negocio}" (${nicho})`,
    });
    return NextResponse.json({ id, entradas: getDirectorio() });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el registro" }, { status: 500 });
  }
}
