import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { createColaborador, getColaboradores } from "@/lib/panel/db";

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyToken(token).valid;
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const includeInactive = req.nextUrl.searchParams.get("inactivos") === "1";
  return NextResponse.json({ colaboradores: getColaboradores(includeInactive) });
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { nombre, puesto, icono, color } = body as {
    nombre?: string;
    puesto?: string;
    icono?: string;
    color?: string;
  };
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  const id = createColaborador({ nombre: nombre.trim(), puesto, icono, color });
  return NextResponse.json({ id, colaboradores: getColaboradores() });
}
