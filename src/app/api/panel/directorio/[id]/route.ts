import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import {
  deleteDirectorioEntry,
  getDirectorio,
  getDirectorioEntry,
  logActivity,
  updateDirectorioEntry,
} from "@/lib/panel/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, string> = {};
    for (const key of ["tipo", "nicho", "negocio", "contacto", "telefono", "correo", "notas"]) {
      if (body?.[key] !== undefined) data[key] = String(body[key]).trim();
    }
    if (data.nicho === "") return NextResponse.json({ error: "El nicho de mercado es requerido" }, { status: 400 });
    if (data.negocio === "") return NextResponse.json({ error: "El nombre del negocio es requerido" }, { status: 400 });
    updateDirectorioEntry(Number(id), data);
    const entry = getDirectorioEntry(Number(id));
    logActivity({
      tipo: "directorio_editado",
      actor: me.username || "",
      mensaje: `${me.username} editó "${entry?.negocio || data.negocio || ""}" del directorio`,
    });
    return NextResponse.json({ entradas: getDirectorio() });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el registro" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  try {
    const entry = getDirectorioEntry(Number(id));
    deleteDirectorioEntry(Number(id));
    logActivity({
      tipo: "directorio_eliminado",
      actor: me.username || "",
      mensaje: `${me.username} eliminó "${entry?.negocio || `#${id}`}" del directorio`,
    });
    return NextResponse.json({ entradas: getDirectorio() });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el registro" }, { status: 500 });
  }
}
