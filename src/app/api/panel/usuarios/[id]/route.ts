import { NextRequest, NextResponse } from "next/server";
import { signToken, type Role } from "@/lib/panel/auth";
import { authFromRequest } from "@/lib/panel/request";
import {
  addPasswordChange,
  countPasswordChangesThisMonth,
  deleteUser,
  getColaboradorById,
  getUserById,
  getUsers,
  logActivity,
  PASSWORD_CHANGE_LIMIT,
  updateColaborador,
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

  // Perfil (logo/color): el propio usuario o el superadministrador
  const newIcono = typeof body.icono === "string" ? body.icono : undefined;
  const newColor = typeof body.color === "string" ? body.color : undefined;

  const data: { username?: string; password?: string; role?: string; colaborador_id?: number | null } = {};

  // Cambio de nombre de usuario: el propio usuario o el superadministrador
  if ((me.superadmin || isSelf) && newUsername && newUsername !== target.username) {
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

  if (Object.keys(data).length === 0 && newIcono === undefined && newColor === undefined) {
    return NextResponse.json({ ok: true, sinCambios: true });
  }

  if (Object.keys(data).length > 0) updateUser(userId, data);

  // Actualiza logo/color del colaborador vinculado
  const colabId = data.colaborador_id !== undefined ? data.colaborador_id : target.colaborador_id;
  if (colabId && (newIcono !== undefined || newColor !== undefined)) {
    const before = getColaboradorById(colabId);
    updateColaborador(colabId, { icono: newIcono, color: newColor });
    logActivity({
      tipo: "perfil_actualizado",
      actor: me.username || "",
      mensaje: `${me.username} actualizó el perfil de ${before?.nombre || target.username}`,
    });
  }

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

  // Si el usuario renombró su propia cuenta, emitir un token nuevo.
  let token: string | undefined;
  if (isSelf && data.username) {
    token = signToken(data.username, (data.role || target.role) as Role);
  }

  return NextResponse.json({ ok: true, token });
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
