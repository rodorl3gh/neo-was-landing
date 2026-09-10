import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/panel/auth";
import { deletePaso, updatePaso } from "@/lib/panel/db";

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyToken(token).valid;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const pasoId = Number(id);
  const body = await req.json();
  const data: { texto?: string; done?: boolean } = {};
  if (body.texto !== undefined && String(body.texto).trim() !== "") data.texto = String(body.texto).trim();
  if (body.done !== undefined) data.done = Boolean(body.done);
  updatePaso(pasoId, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  deletePaso(Number(id));
  return NextResponse.json({ ok: true });
}
