import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import {
  addPasswordChange,
  countPasswordChangesThisMonth,
  deleteUser,
  getUserById,
  getUsers,
  logActivity,
  PASSWORD_CHANGE_LIMIT,
  updateUser,
} from "@/lib/panel/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const userId = Number(id);
  const target = getUserById(userId);
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const isSelf = target.username === me.username;
  if (!me.superadmin && !isSelf) {
    return NextResponse.json({ error: "No puedes modificar a otro usuario" }, { status: 403 });
  }

  const body = await req.json();
  const newPassword = typeof body.password === "string" ? body.password : "";
  const newUsername = typeof body.username === "string" ? body.username.trim() : undefined;
  const newRole = me.superadmin && typeof body.role === "string" && ["developer", "admin", "user"].includes(body.role) ? body.role : undefined;
  const newColaborador =
    me.superadmin && body.colaborador_id !== undefined
      ? body.colaborador_id != null && body.colaborador_id !== ""
        ? Number(body.colaborador_id)
        : null
      : undefined;

  const data: { username?: string; password?: string; role?: string; colaborador_id?: number | null } = {};

  // Cambio de nombre de usuario: solo superadministrador
  if (me.superadmin && newUsername && newUsername !== target.username) {
    const dup = getUsers().some((u) => u.id !== userId && u.username.toLowerCase() === newUsername.toLowerCase());
    if (dup) return NextResponse.json({ error: "Ese usuario ya existe" }, { status: 409 });
    data.username = newUsername;
  }

  // Cambio de contraseña
  if (newPassword !== "") {
    if (!me.superadmin) {
      const used = countPasswordChangesThisMonth(userId);
      if (used >= PASSWORD_CHANGE_LIMIT) {
        return NextResponse.json(
          { error: `Alcanzaste el límite de ${PASSWORD_CHANGE_LIMIT} cambios de contraseña este mes.` },
          { status: 403 }
        );
      }
    }
    data.password = newPassword;
  }

  if (newRole) data.role = newRole;
  if (newColaborador !== undefined) data.colaborador_id = newColaborador;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true, sinCambios: true });
  }

  updateUser(userId, data);

  const finalUsername = data.username || target.username;
  if (data.password) {
    addPasswordChange(userId, finalUsername, me.username || "");
    logActivity({
      tipo: "password_cambiada",
      actor: me.username || "",
      mensaje: `${me.username} cambió la contraseña de ${finalUsername}`,
      detalle: isSelf && !me.superadmin ? "Cambio propio" : "Cambio por superadministrador",
    });
  }
  if (data.username) {
    logActivity({
      tipo: "usuario_renombrado",
      actor: me.username || "",
      mensaje: `${me.username} cambió el usuario ${target.username} a ${data.username}`,
    });
  }
  if (data.role) {
    logActivity({ tipo: "rol_cambiado", actor: me.username || "", mensaje: `${me.username} cambió el rol de ${finalUsername} a ${data.role}` });
  }
  if (data.colaborador_id !== undefined) {
    logActivity({ tipo: "usuario_colaborador", actor: me.username || "", mensaje: `${me.username} actualizó el colaborador de ${finalUsername}` });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!me.superadmin) return NextResponse.json({ error: "Solo el superadministrador puede eliminar usuarios" }, { status: 403 });

  const { id } = await params;
  const userId = Number(id);
  const target = getUserById(userId);
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  if (target.username === me.username) return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 });

  deleteUser(userId);
  logActivity({ tipo: "usuario_eliminado", actor: me.username || "", mensaje: `${me.username} eliminó el usuario ${target.username}` });
  return NextResponse.json({ ok: true });
}
