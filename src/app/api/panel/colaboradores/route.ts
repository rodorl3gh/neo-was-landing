import { NextRequest, NextResponse } from "next/server";
import { createColaborador, getColaboradores, logActivity } from "@/lib/panel/db";
import { authFromRequest } from "@/lib/panel/request";

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const includeInactive = req.nextUrl.searchParams.get("inactivos") === "1";
  return NextResponse.json({ colaboradores: getColaboradores(includeInactive) });
}

export async function POST(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { nombre, puesto, icono, color } = body as {
    nombre?: string;
    puesto?: string;
    icono?: string;
    color?: string;
  };
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  const id = createColaborador({ nombre: nombre.trim(), puesto, icono, color });
  logActivity({ tipo: "colaborador_creado", actor: me.username || "", mensaje: `${me.username} agregó al colaborador ${nombre.trim()}` });
  return NextResponse.json({ id, colaboradores: getColaboradores() });
}
