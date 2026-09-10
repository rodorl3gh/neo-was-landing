import { createHash, createHmac, timingSafeEqual, createCipheriv, createDecipheriv, randomBytes } from "crypto";

const SALT = "wasito_salt_";
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "wasito-token-secret-2026";

export type Role = "admin" | "developer" | "user";

export function hashPassword(pass: string): string {
  return createHash("sha256").update(SALT + pass).digest("hex");
}

export function isSuperadmin(role: string | null | undefined): boolean {
  return role === "developer";
}

// ------------------------------------------------------------------
// Cifrado reversible de contraseñas (para poder mostrarlas en el panel)
// AES-256-GCM con clave derivada de AUTH_TOKEN_SECRET.
// ------------------------------------------------------------------
function secretKey(): Buffer {
  return createHash("sha256").update(`${TOKEN_SECRET}::password-store`).digest();
}

export function encryptSecret(plain: string): string {
  if (!plain) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decryptSecret(payload: string | null | undefined): string {
  if (!payload) return "";
  const parts = payload.split(".");
  if (parts.length !== 3) return "";
  try {
    const iv = Buffer.from(parts[0], "base64");
    const tag = Buffer.from(parts[1], "base64");
    const data = Buffer.from(parts[2], "base64");
    const decipher = createDecipheriv("aes-256-gcm", secretKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", TOKEN_SECRET).update(payload).digest());
}

export function signToken(username: string, role: Role): string {
  const payload = b64url(JSON.stringify({ u: username, r: role, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

export interface VerifiedToken {
  valid: boolean;
  role: Role | null;
  username: string | null;
}

export function verifyToken(token: string | null | undefined): VerifiedToken {
  const invalid: VerifiedToken = { valid: false, role: null, username: null };
  if (!token) return invalid;

  const parts = token.split(".");
  if (parts.length !== 2) return invalid;
  const [payload, signature] = parts;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return invalid;

  try {
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    const role = (data.r as Role) || null;
    return { valid: true, role, username: data.u || null };
  } catch {
    return invalid;
  }
}
