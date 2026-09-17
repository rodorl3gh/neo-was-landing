"use client";

export interface SoundPreset {
  id: string;
  label: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: "campana", label: "Campana" },
  { id: "pop", label: "Pop" },
  { id: "alerta", label: "Alerta" },
  { id: "suave", label: "Suave" },
  { id: "tintineo", label: "Tintineo" },
];

export const SYSTEM_SOUNDS = [
  { id: "device", label: "Sonido del dispositivo" },
  { id: "silent", label: "Silencio" },
];

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOptions {
  freq: number;
  start: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  endFreq?: number;
}

function tone(audio: AudioContext, { freq, start, dur, type = "sine", gain = 0.18, endFreq }: ToneOptions) {
  const osc = audio.createOscillator();
  const vol = audio.createGain();
  osc.type = type;
  const t0 = audio.currentTime + start;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  vol.gain.setValueAtTime(0.0001, t0);
  vol.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(vol);
  vol.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export function playPreset(id: string): void {
  const audio = getCtx();
  if (!audio) return;
  switch (id) {
    case "campana":
      tone(audio, { freq: 880, start: 0, dur: 0.55, gain: 0.16 });
      tone(audio, { freq: 1320, start: 0.02, dur: 0.5, gain: 0.1 });
      tone(audio, { freq: 1760, start: 0.04, dur: 0.4, gain: 0.06 });
      break;
    case "pop":
      tone(audio, { freq: 620, endFreq: 140, start: 0, dur: 0.14, type: "sine", gain: 0.25 });
      break;
    case "alerta":
      tone(audio, { freq: 1046, start: 0, dur: 0.09, type: "square", gain: 0.09 });
      tone(audio, { freq: 1046, start: 0.14, dur: 0.09, type: "square", gain: 0.09 });
      tone(audio, { freq: 1046, start: 0.28, dur: 0.12, type: "square", gain: 0.09 });
      break;
    case "suave":
      tone(audio, { freq: 523.25, start: 0, dur: 0.85, gain: 0.08 });
      tone(audio, { freq: 659.25, start: 0.05, dur: 0.8, gain: 0.07 });
      tone(audio, { freq: 783.99, start: 0.1, dur: 0.75, gain: 0.06 });
      break;
    case "tintineo":
      tone(audio, { freq: 1568, start: 0, dur: 0.28, gain: 0.12 });
      tone(audio, { freq: 2093, start: 0.08, dur: 0.3, gain: 0.08 });
      break;
    default:
      break;
  }
}

export function playCustom(dataUrl: string): void {
  if (!dataUrl) return;
  try {
    const audio = new Audio(dataUrl);
    void audio.play().catch(() => {
      /* requiere interacción del usuario */
    });
  } catch {
    /* audio inválido */
  }
}

export function playSound(sound: string, dataUrl?: string): void {
  if (sound === "silent" || sound === "device") return;
  if (sound === "custom") {
    if (dataUrl) playCustom(dataUrl);
    return;
  }
  playPreset(sound);
}
