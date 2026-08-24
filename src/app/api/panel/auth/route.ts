import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signToken, verifyToken } from "@/lib/panel/auth";
import { getUserByUsername } from "@/lib/panel/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, pass } = body as { user?: string; pass?: string };

    if (!user || !pass) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
    }

    const row = getUserByUsername(user);
    if (!row) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    if (hashPassword(pass) !== row.password_hash) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = signToken(row.username, "admin");
    return NextResponse.json({ success: true, token, username: row.username });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const verified = verifyToken(token);
  if (!verified.valid) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true, username: verified.username });
}
