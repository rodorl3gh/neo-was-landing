import type { NextRequest } from "next/server";
import { verifyToken, type Role } from "./auth";

export interface RequestUser {
  valid: boolean;
  username: string | null;
  role: Role | null;
  superadmin: boolean;
}

export function authFromRequest(req: NextRequest): RequestUser {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const v = verifyToken(token);
  return { valid: v.valid, username: v.username, role: v.role, superadmin: v.role === "developer" };
}
