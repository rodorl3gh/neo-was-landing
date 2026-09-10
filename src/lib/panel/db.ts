import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

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
  seedUsers(_db);
  seedEnlaces(_db);
  seedColaboradores(_db);
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
  `);
}

function seedUsers(db: Database.Database) {
  const defaults = [
    { username: process.env.ADMIN_USER || "rodorl3", hash: process.env.ADMIN_PASS_HASH || "d67b5d0b8b59fa804adc20aebc433452b4c9a7531a04151a3e5a9e798f5cf9fb", role: "developer" },
    { username: process.env.SECOND_USER || "Wasito26", hash: process.env.SECOND_PASS_HASH || "ef290e16389382bfd875c3015b8ae106803b12d25d34ae650c9f6e5564273fe7", role: "admin" },
  ];

  for (const u of defaults) {
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(u.username) as { id: number } | undefined;
    if (!existing) {
      db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run(u.username, u.hash, u.role);
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
  role: string;
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
