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
