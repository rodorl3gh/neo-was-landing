import { NextRequest, NextResponse } from "next/server";
import { authFromRequest } from "@/lib/panel/request";
import { getUserPrefs, setUserPrefs } from "@/lib/panel/db";

const MAX_SOUND_BYTES = 1_500_000;

export async function GET(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid || !me.username) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const prefs = getUserPrefs(me.username);
  return NextResponse.json({
    prefs: {
      notif_enabled: !!prefs.notif_enabled,
      sound: prefs.sound,
      sound_data: prefs.sound_data,
      sound_name: prefs.sound_name,
    },
  });
}

export async function PUT(req: NextRequest) {
  const me = authFromRequest(req);
  if (!me.valid || !me.username) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const soundData = body?.sound_data === undefined ? undefined : String(body.sound_data);
    if (soundData && soundData.length > MAX_SOUND_BYTES) {
      return NextResponse.json({ error: "El audio es demasiado grande (máx. 1.5 MB)" }, { status: 400 });
    }
    setUserPrefs({
      username: me.username,
      notif_enabled: body?.notif_enabled ? 1 : 0,
      sound: String(body?.sound || "device"),
      sound_data: soundData,
      sound_name: body?.sound_name === undefined ? undefined : String(body.sound_name),
    });
    const prefs = getUserPrefs(me.username);
    return NextResponse.json({
      prefs: {
        notif_enabled: !!prefs.notif_enabled,
        sound: prefs.sound,
        sound_data: prefs.sound_data,
        sound_name: prefs.sound_name,
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudieron guardar las preferencias" }, { status: 500 });
  }
}
