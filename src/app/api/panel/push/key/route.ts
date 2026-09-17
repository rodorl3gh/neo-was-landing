import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { getPublicVapidKey } from "@/lib/panel/push";

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ publicKey: getPublicVapidKey() });
}
