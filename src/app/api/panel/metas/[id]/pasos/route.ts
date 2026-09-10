import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { addPaso, getMetaById } from "@/lib/panel/db";

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyToken(token).valid;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const metaId = Number(id);
  const body = await req.json();
  const texto = String(body.texto || "").trim();
  if (!texto) return NextResponse.json({ error: "El texto del paso es requerido" }, { status: 400 });
  const pasoId = addPaso(metaId, texto);
  return NextResponse.json({ id: pasoId, meta: getMetaById(metaId) });
}
