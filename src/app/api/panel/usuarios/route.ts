import { NextRequest, NextResponse } from "next/server";
import { decryptSecret } from "@/lib/panel/auth";
import { authFromRequest } from "@/lib/panel/request";
import { createUser, countPasswordChangesThisMonth, getUsers, logActivity, PASSWORD_CHANGE_LIMIT, updateColaborador } from "@/lib/panel/db";

function buildList(req: NextRequest) {
  const me = authFromRequest(req);
  const superadmin = me.superadmin;
  const usuarios = getUsers().map((u) => {
    const isSelf = u.username === me.username;
    const canSee = superadmin || isSelf;
    return {
      id: u.id,
      username: u.username,
      role: u.role,
      colaborador_id: u.colaborador_id,
      colaborador_nombre: u.colaborador_nombre,
      colaborador_icono: u.colaborador_icono,
      colaborador_color: u.colaborador_color,
      has_password: u.has_password,
      password: canSee ? decryptSecret(u.password_enc ?? "") : null,
      can_see_password: canSee,
      can_edit: superadmin || isSelf,
      can_edit_username: superadmin || isSelf,
      can_edit_profile: superadmin || isSelf,
      changes_this_month: countPasswordChangesThisMonth(u.id),
      limit: superadmin ? null : PASSWORD_CHANGE_LIMIT,
    };
  });
  return { usuarios, me: { username: me.username, role: me.role, superadmin } };
}

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(buildList(req));
}

export async function POST(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!me.superadmin) return NextResponse.json({ error: "Solo el superadministrador puede crear usuarios" }, { status: 403 });

  const body = await req.json();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username) return NextResponse.json({ error: "El usuario es requerido" }, { status: 400 });
  if (!password) return NextResponse.json({ error: "La contraseña es requerida" }, { status: 400 });

  const exists = getUsers().some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return NextResponse.json({ error: "Ese usuario ya existe" }, { status: 409 });

  const role = ["developer", "admin", "user"].includes(body.role) ? body.role : "user";
  const colabId = body.colaborador_id != null && body.colaborador_id !== "" ? Number(body.colaborador_id) : null;
  const id = createUser({ username, password, role, colaborador_id: colabId });
  if (colabId && (typeof body.icono === "string" || typeof body.color === "string")) {
    updateColaborador(colabId, {
      icono: typeof body.icono === "string" ? body.icono : undefined,
      color: typeof body.color === "string" ? body.color : undefined,
    });
  }
  logActivity({ tipo: "usuario_creado", actor: me.username || "", mensaje: `${me.username} creó el usuario ${username}` });
  return NextResponse.json({ id, ...buildList(req) });
}
