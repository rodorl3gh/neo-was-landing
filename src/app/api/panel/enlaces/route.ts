import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { createEnlace, getEnlaces } from "@/lib/panel/db";

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyToken(token).valid;
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ enlaces: getEnlaces() });
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { titulo, url, descripcion, icono } = body as { titulo?: string; url?: string; descripcion?: string; icono?: string };
  if (!titulo || !titulo.trim()) return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
  const id = createEnlace({ titulo: titulo.trim(), url: url || "", descripcion, icono });
  return NextResponse.json({ id, enlaces: getEnlaces() });
}
