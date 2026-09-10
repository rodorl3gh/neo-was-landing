import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { hashPassword, encryptSecret } from "./auth";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "wasito.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("busy_timeout = 5000");

  runMigrations(_db);
  seedColaboradores(_db);
  seedUsers(_db);
  seedEnlaces(_db);
  return _db;
}

function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin'
    );

    CREATE TABLE IF NOT EXISTS enlaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      descripcion TEXT DEFAULT '',
      icono TEXT DEFAULT '',
      orden INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS colaboradores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      puesto TEXT NOT NULL DEFAULT '',
      icono TEXT NOT NULL DEFAULT 'user',
      color TEXT NOT NULL DEFAULT '#36afc0',
      activo INTEGER NOT NULL DEFAULT 1,
      orden INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS metas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL DEFAULT '',
      colaborador_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
      tipo TEXT NOT NULL DEFAULT 'trabajo',
      prioridad TEXT NOT NULL DEFAULT 'media',
      fecha_limite TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL DEFAULT 'pendiente',
      orden INTEGER NOT NULL DEFAULT 0,
      completado_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_metas_colaborador ON metas(colaborador_id);
    CREATE INDEX IF NOT EXISTS idx_metas_fecha ON metas(fecha_limite);
    CREATE INDEX IF NOT EXISTS idx_metas_estado ON metas(estado);

    CREATE TABLE IF NOT EXISTS meta_pasos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meta_id INTEGER NOT NULL REFERENCES metas(id) ON DELETE CASCADE,
      texto TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      orden INTEGER NOT NULL DEFAULT 0,
      done_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_meta_pasos_meta ON meta_pasos(meta_id);

    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL DEFAULT '',
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL DEFAULT '09:00',
      colaborador_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
      color TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);

    CREATE TABLE IF NOT EXISTS password_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL DEFAULT '',
      changed_by TEXT NOT NULL DEFAULT '',
      year_month TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_pwd_changes_user ON password_changes(user_id, year_month);

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT '',
      mensaje TEXT NOT NULL DEFAULT '',
      detalle TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);
  `);

  // Migracion: columnas de usuarios (contraseña cifrada + colaborador vinculado)
  try { db.exec("ALTER TABLE users ADD COLUMN password_enc TEXT NOT NULL DEFAULT ''"); } catch { /* ya existe */ }
  try { db.exec("ALTER TABLE users ADD COLUMN colaborador_id INTEGER"); } catch { /* ya existe */ }
}

const SEED_USERS: { username: string; password: string; colaborador: string }[] = [
  { username: "maribelnw", password: "mariNW2026*", colaborador: "Maribel" },
  { username: "saidnw", password: "saidNW2026*", colaborador: "Said" },
  { username: "wendynw", password: "wenNW2026*", colaborador: "Wendy" },
  { username: "marilunw", password: "marluNW2026*", colaborador: "Marilu" },
  { username: "ivonnenw", password: "ivonNW2026*", colaborador: "Ivonne" },
];

function colaboradorIdByName(db: Database.Database, nombre: string): number | null {
  const row = db.prepare("SELECT id FROM colaboradores WHERE nombre = ?").get(nombre) as { id: number } | undefined;
  return row ? row.id : null;
}

function seedUsers(db: Database.Database) {
  // El usuario administrador anterior se elimina (solo queda el superadministrador).
  db.prepare("DELETE FROM users WHERE username = ?").run("Wasito26");

  // Superadministrador (rodorl3)
  const adminUser = process.env.ADMIN_USER || "rodorl3";
  const adminHash = process.env.ADMIN_PASS_HASH;
  const existingAdmin = db.prepare("SELECT id FROM users WHERE username = ?").get(adminUser) as { id: number } | undefined;
  const rodoId = colaboradorIdByName(db, "Rodo");
  if (!existingAdmin) {
    const hash = adminHash && adminHash.length > 0 ? adminHash : hashPassword("wasito2026*");
    db.prepare("INSERT INTO users (username, password_hash, role, colaborador_id) VALUES (?, ?, 'developer', ?)").run(adminUser, hash, rodoId);
  } else {
    if (adminHash && adminHash.length > 0) {
      db.prepare("UPDATE users SET password_hash = ? WHERE username = ?").run(adminHash, adminUser);
    }
    db.prepare("UPDATE users SET role = 'developer' WHERE id = ?").run(existingAdmin.id);
    if (rodoId) db.prepare("UPDATE users SET colaborador_id = ? WHERE id = ? AND colaborador_id IS NULL").run(rodoId, existingAdmin.id);
  }

  // Colaboradores con acceso al panel
  for (const u of SEED_USERS) {
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(u.username) as { id: number } | undefined;
    const colabId = colaboradorIdByName(db, u.colaborador);
    if (!existing) {
      db.prepare(
        "INSERT INTO users (username, password_hash, password_enc, role, colaborador_id) VALUES (?, ?, ?, 'user', ?)"
      ).run(u.username, hashPassword(u.password), encryptSecret(u.password), colabId);
    } else if (colabId) {
      db.prepare("UPDATE users SET colaborador_id = ? WHERE id = ? AND colaborador_id IS NULL").run(colabId, existing.id);
    }
  }
}

function seedEnlaces(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM enlaces").get() as { c: number }).c;
  if (count === 0) {
    const formUrl = process.env.FORM_URL || "https://gowlink-agency-test-neo-was-formulario.laeji7.easypanel.host";
    db.prepare("INSERT INTO enlaces (titulo, url, descripcion, icono, orden) VALUES (?, ?, ?, ?, ?)").run(
      "Formulario de recabación",
      formUrl,
      "Formulario para recabar la información de cada área",
      "clipboard",
      0
    );
  }
}

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  password_enc: string;
  role: string;
  colaborador_id: number | null;
}

export interface Enlace {
  id: number;
  titulo: string;
  url: string;
  descripcion: string;
  icono: string;
  orden: number;
  created_at: number;
}

export function getUserByUsername(username: string): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE username = ?").get(username) as UserRow | undefined;
}

export function getEnlaces(): Enlace[] {
  return getDb().prepare("SELECT * FROM enlaces ORDER BY orden, id").all() as Enlace[];
}

export function createEnlace(data: { titulo: string; url: string; descripcion?: string; icono?: string }): number {
  const db = getDb();
  const maxOrden = (db.prepare("SELECT COALESCE(MAX(orden), 0) as m FROM enlaces").get() as { m: number }).m;
  return db
    .prepare("INSERT INTO enlaces (titulo, url, descripcion, icono, orden) VALUES (?, ?, ?, ?, ?)")
    .run(data.titulo, data.url, data.descripcion || "", data.icono || "", maxOrden + 1).lastInsertRowid as number;
}

export function updateEnlace(id: number, data: { titulo?: string; url?: string; descripcion?: string; icono?: string }) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      fields.push(`${k} = ?`);
      values.push(v);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE enlaces SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteEnlace(id: number) {
  getDb().prepare("DELETE FROM enlaces WHERE id = ?").run(id);
}

// ------------------------------------------------------------------
// Colaboradores
// ------------------------------------------------------------------
const SEED_COLABORADORES: { nombre: string; puesto: string; icono: string; color: string }[] = [
  { nombre: "Maribel", puesto: "Recursos Humanos", icono: "users", color: "#a855f7" },
  { nombre: "Marilu", puesto: "Marketing", icono: "megaphone", color: "#ec4899" },
  { nombre: "Ivonne", puesto: "Diseño Gráfico", icono: "palette", color: "#f59e0b" },
  { nombre: "Wendy", puesto: "Contabilidad", icono: "calculator", color: "#22c55e" },
  { nombre: "Said", puesto: "Marketing y Ventas", icono: "trending-up", color: "#3b82f6" },
  { nombre: "Rodo", puesto: "Ventas y Tecnología", icono: "cpu", color: "#36afc0" },
];

function seedColaboradores(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM colaboradores").get() as { c: number }).c;
  if (count > 0) return;
  const stmt = db.prepare("INSERT INTO colaboradores (nombre, puesto, icono, color, orden) VALUES (?, ?, ?, ?, ?)");
  const insertMany = db.transaction((rows: typeof SEED_COLABORADORES) => {
    rows.forEach((r, i) => stmt.run(r.nombre, r.puesto, r.icono, r.color, i));
  });
  insertMany(SEED_COLABORADORES);
}

export interface Colaborador {
  id: number;
  nombre: string;
  puesto: string;
  icono: string;
  color: string;
  activo: number;
  orden: number;
  created_at: number;
}

export function getColaboradores(includeInactive = true): Colaborador[] {
  const where = includeInactive ? "" : "WHERE activo = 1";
  return getDb().prepare(`SELECT * FROM colaboradores ${where} ORDER BY orden, id`).all() as Colaborador[];
}

export function getColaboradorById(id: number): Colaborador | undefined {
  return getDb().prepare("SELECT * FROM colaboradores WHERE id = ?").get(id) as Colaborador | undefined;
}

export function createColaborador(data: {
  nombre: string;
  puesto?: string;
  icono?: string;
  color?: string;
}): number {
  const db = getDb();
  const maxOrden = (db.prepare("SELECT COALESCE(MAX(orden), 0) as m FROM colaboradores").get() as { m: number }).m;
  return db
    .prepare("INSERT INTO colaboradores (nombre, puesto, icono, color, orden) VALUES (?, ?, ?, ?, ?)")
    .run(data.nombre, data.puesto || "", data.icono || "user", data.color || "#36afc0", maxOrden + 1)
    .lastInsertRowid as number;
}

export function updateColaborador(
  id: number,
  data: { nombre?: string; puesto?: string; icono?: string; color?: string; activo?: boolean; orden?: number }
) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.nombre !== undefined) { fields.push("nombre = ?"); values.push(data.nombre); }
  if (data.puesto !== undefined) { fields.push("puesto = ?"); values.push(data.puesto); }
  if (data.icono !== undefined) { fields.push("icono = ?"); values.push(data.icono); }
  if (data.color !== undefined) { fields.push("color = ?"); values.push(data.color); }
  if (data.activo !== undefined) { fields.push("activo = ?"); values.push(data.activo ? 1 : 0); }
  if (data.orden !== undefined) { fields.push("orden = ?"); values.push(data.orden); }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE colaboradores SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteColaborador(id: number) {
  getDb().prepare("DELETE FROM colaboradores WHERE id = ?").run(id);
}

// ------------------------------------------------------------------
// Metas
// ------------------------------------------------------------------
export type MetaEstado = "pendiente" | "progreso" | "completada";
export type MetaPrioridad = "alta" | "media" | "baja";

export interface Meta {
  id: number;
  titulo: string;
  descripcion: string;
  colaborador_id: number | null;
  tipo: string;
  prioridad: MetaPrioridad;
  fecha_limite: string;
  estado: MetaEstado;
  orden: number;
  completado_at: number | null;
  created_at: number;
}

export interface MetaPaso {
  id: number;
  meta_id: number;
  texto: string;
  done: number;
  orden: number;
  done_at: number | null;
}

export interface MetaWithPasos extends Meta {
  pasos: MetaPaso[];
}

function attachPasos(metas: Meta[]): MetaWithPasos[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM meta_pasos WHERE meta_id = ? ORDER BY orden, id");
  return metas.map((m) => ({ ...m, pasos: stmt.all(m.id) as MetaPaso[] }));
}

export function getMetas(filters?: {
  colaborador_id?: number | null;
  tipo?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}): MetaWithPasos[] {
  const where: string[] = [];
  const values: unknown[] = [];
  if (filters?.colaborador_id != null) { where.push("colaborador_id = ?"); values.push(filters.colaborador_id); }
  if (filters?.tipo) { where.push("tipo = ?"); values.push(filters.tipo); }
  if (filters?.estado) { where.push("estado = ?"); values.push(filters.estado); }
  if (filters?.desde) { where.push("fecha_limite >= ?"); values.push(filters.desde); }
  if (filters?.hasta) { where.push("fecha_limite <= ?"); values.push(filters.hasta); }
  const sql = `SELECT * FROM metas ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY orden, id`;
  const metas = getDb().prepare(sql).all(...values) as Meta[];
  return attachPasos(metas);
}

export function getMetaById(id: number): MetaWithPasos | undefined {
  const meta = getDb().prepare("SELECT * FROM metas WHERE id = ?").get(id) as Meta | undefined;
  if (!meta) return undefined;
  return attachPasos([meta])[0];
}

export function createMeta(data: {
  titulo: string;
  descripcion?: string;
  colaborador_id?: number | null;
  tipo?: string;
  prioridad?: MetaPrioridad;
  fecha_limite?: string;
  estado?: MetaEstado;
  pasos?: string[];
}): number {
  const db = getDb();
  const maxOrden = (db.prepare("SELECT COALESCE(MAX(orden), 0) as m FROM metas").get() as { m: number }).m;
  const info = db
    .prepare(
      "INSERT INTO metas (titulo, descripcion, colaborador_id, tipo, prioridad, fecha_limite, estado, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.titulo,
      data.descripcion || "",
      data.colaborador_id ?? null,
      data.tipo || "trabajo",
      data.prioridad || "media",
      data.fecha_limite || "",
      data.estado || "pendiente",
      maxOrden + 1
    );
  const metaId = info.lastInsertRowid as number;
  if (data.pasos && data.pasos.length > 0) {
    const stmt = db.prepare("INSERT INTO meta_pasos (meta_id, texto, orden) VALUES (?, ?, ?)");
    const insertMany = db.transaction((pasos: string[]) => {
      pasos.forEach((t, i) => stmt.run(metaId, t, i));
    });
    insertMany(data.pasos);
  }
  return metaId;
}

export function updateMeta(
  id: number,
  data: {
    titulo?: string;
    descripcion?: string;
    colaborador_id?: number | null;
    tipo?: string;
    prioridad?: MetaPrioridad;
    fecha_limite?: string;
    estado?: MetaEstado;
    orden?: number;
  }
) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.titulo !== undefined) { fields.push("titulo = ?"); values.push(data.titulo); }
  if (data.descripcion !== undefined) { fields.push("descripcion = ?"); values.push(data.descripcion); }
  if (data.colaborador_id !== undefined) { fields.push("colaborador_id = ?"); values.push(data.colaborador_id); }
  if (data.tipo !== undefined) { fields.push("tipo = ?"); values.push(data.tipo); }
  if (data.prioridad !== undefined) { fields.push("prioridad = ?"); values.push(data.prioridad); }
  if (data.fecha_limite !== undefined) { fields.push("fecha_limite = ?"); values.push(data.fecha_limite); }
  if (data.estado !== undefined) {
    fields.push("estado = ?");
    values.push(data.estado);
    fields.push("completado_at = ?");
    values.push(data.estado === "completada" ? Math.floor(Date.now() / 1000) : null);
  }
  if (data.orden !== undefined) { fields.push("orden = ?"); values.push(data.orden); }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE metas SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteMeta(id: number) {
  getDb().prepare("DELETE FROM metas WHERE id = ?").run(id);
}

export function reorderMetas(ordenes: { id: number; orden: number }[]) {
  const db = getDb();
  const stmt = db.prepare("UPDATE metas SET orden = ? WHERE id = ?");
  const batch = db.transaction((items: { id: number; orden: number }[]) => {
    for (const it of items) stmt.run(it.orden, it.id);
  });
  batch(ordenes);
}

// ------------------------------------------------------------------
// Pasos de una meta
// ------------------------------------------------------------------
export function addPaso(metaId: number, texto: string): number {
  const db = getDb();
  const maxOrden = (db.prepare("SELECT COALESCE(MAX(orden), 0) as m FROM meta_pasos WHERE meta_id = ?").get(metaId) as { m: number }).m;
  return db
    .prepare("INSERT INTO meta_pasos (meta_id, texto, orden) VALUES (?, ?, ?)")
    .run(metaId, texto, maxOrden + 1).lastInsertRowid as number;
}

export function updatePaso(id: number, data: { texto?: string; done?: boolean }) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.texto !== undefined) { fields.push("texto = ?"); values.push(data.texto); }
  if (data.done !== undefined) {
    fields.push("done = ?");
    values.push(data.done ? 1 : 0);
    fields.push("done_at = ?");
    values.push(data.done ? Math.floor(Date.now() / 1000) : null);
  }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE meta_pasos SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deletePaso(id: number) {
  getDb().prepare("DELETE FROM meta_pasos WHERE id = ?").run(id);
}

// ------------------------------------------------------------------
// Eventos (calendario interno)
// ------------------------------------------------------------------
export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  colaborador_id: number | null;
  color: string;
  created_at: number;
}

export function getEventos(filters?: { desde?: string; hasta?: string }): Evento[] {
  const where: string[] = [];
  const values: unknown[] = [];
  if (filters?.desde) { where.push("fecha >= ?"); values.push(filters.desde); }
  if (filters?.hasta) { where.push("fecha <= ?"); values.push(filters.hasta); }
  const sql = `SELECT * FROM eventos ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY fecha, hora`;
  return getDb().prepare(sql).all(...values) as Evento[];
}

export function createEvento(data: {
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  colaborador_id?: number | null;
  color?: string;
}): number {
  return getDb()
    .prepare("INSERT INTO eventos (titulo, descripcion, fecha, hora, colaborador_id, color) VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      data.titulo,
      data.descripcion || "",
      data.fecha,
      data.hora || "09:00",
      data.colaborador_id ?? null,
      data.color || ""
    ).lastInsertRowid as number;
}

export function updateEvento(
  id: number,
  data: { titulo?: string; descripcion?: string; fecha?: string; hora?: string; colaborador_id?: number | null; color?: string }
) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.titulo !== undefined) { fields.push("titulo = ?"); values.push(data.titulo); }
  if (data.descripcion !== undefined) { fields.push("descripcion = ?"); values.push(data.descripcion); }
  if (data.fecha !== undefined) { fields.push("fecha = ?"); values.push(data.fecha); }
  if (data.hora !== undefined) { fields.push("hora = ?"); values.push(data.hora); }
  if (data.colaborador_id !== undefined) { fields.push("colaborador_id = ?"); values.push(data.colaborador_id); }
  if (data.color !== undefined) { fields.push("color = ?"); values.push(data.color); }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE eventos SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteEvento(id: number) {
  getDb().prepare("DELETE FROM eventos WHERE id = ?").run(id);
}

// ------------------------------------------------------------------
// Usuarios del panel (cuentas + contraseñas)
// ------------------------------------------------------------------
export const PASSWORD_CHANGE_LIMIT = 3;

export interface UserWithColaborador {
  id: number;
  username: string;
  role: string;
  colaborador_id: number | null;
  colaborador_nombre: string | null;
  has_password: number;
  password_enc: string;
}

export function getUsers(): UserWithColaborador[] {
  return getDb()
    .prepare(
      `SELECT u.id, u.username, u.role, u.colaborador_id,
              c.nombre AS colaborador_nombre,
              CASE WHEN u.password_enc != '' THEN 1 ELSE 0 END AS has_password,
              u.password_enc
       FROM users u LEFT JOIN colaboradores c ON c.id = u.colaborador_id
       ORDER BY CASE u.role WHEN 'developer' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, u.username`
    )
    .all() as UserWithColaborador[];
}

export function getUserById(id: number): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function createUser(data: {
  username: string;
  password: string;
  role?: string;
  colaborador_id?: number | null;
}): number {
  return getDb()
    .prepare("INSERT INTO users (username, password_hash, password_enc, role, colaborador_id) VALUES (?, ?, ?, ?, ?)")
    .run(
      data.username,
      hashPassword(data.password),
      encryptSecret(data.password),
      data.role || "user",
      data.colaborador_id ?? null
    ).lastInsertRowid as number;
}

export function updateUser(
  id: number,
  data: { username?: string; password?: string; role?: string; colaborador_id?: number | null }
) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.username !== undefined) { fields.push("username = ?"); values.push(data.username); }
  if (data.password !== undefined && data.password !== "") {
    fields.push("password_hash = ?"); values.push(hashPassword(data.password));
    fields.push("password_enc = ?"); values.push(encryptSecret(data.password));
  }
  if (data.role !== undefined) { fields.push("role = ?"); values.push(data.role); }
  if (data.colaborador_id !== undefined) { fields.push("colaborador_id = ?"); values.push(data.colaborador_id); }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteUser(id: number) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function getCurrentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function countPasswordChangesThisMonth(userId: number): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS c FROM password_changes WHERE user_id = ? AND year_month = ?")
    .get(userId, getCurrentYearMonth()) as { c: number };
  return row.c;
}

export function addPasswordChange(userId: number, username: string, changedBy: string) {
  getDb()
    .prepare("INSERT INTO password_changes (user_id, username, changed_by, year_month) VALUES (?, ?, ?, ?)")
    .run(userId, username, changedBy, getCurrentYearMonth());
}

// ------------------------------------------------------------------
// Log de actividad (Notificaciones)
// ------------------------------------------------------------------
export interface ActivityRow {
  id: number;
  tipo: string;
  actor: string;
  mensaje: string;
  detalle: string;
  created_at: number;
}

export function logActivity(data: { tipo: string; actor?: string; mensaje: string; detalle?: string }) {
  try {
    getDb()
      .prepare("INSERT INTO activity_log (tipo, actor, mensaje, detalle) VALUES (?, ?, ?, ?)")
      .run(data.tipo, data.actor || "", data.mensaje, data.detalle || "");
  } catch {
    /* el log nunca debe romper la operación */
  }
}

export function getActivityLog(limit = 200): ActivityRow[] {
  return getDb().prepare("SELECT * FROM activity_log ORDER BY id DESC LIMIT ?").all(limit) as ActivityRow[];
}
