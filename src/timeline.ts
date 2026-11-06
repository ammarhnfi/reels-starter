import script from "./script.json";
import timing from "./timing.json";
import voice from "./voice.json";

// Panjang tiap adegan mengikuti panjang suaranya, jadi naskah bisa diubah tanpa menyetel frame.
export type Line = { id: string; say: string; sub: string };
export type Timing = { fps: number; lead: number; tail: number; introExtra: number; outroExtra: number };

export const buildScenes = (lines: Line[], t: Timing, v: Record<string, number>) => {
  let acc = 0;
  return lines.map((line, i) => {
    const intro = i === 0 ? t.introExtra : 0;
    const outro = i === lines.length - 1 ? t.outroExtra : 0;
    const len = (v[line.id] ?? 3) + t.lead + t.tail + intro + outro;
    const from = Math.round(acc * t.fps);
    acc += len;
    return {
      ...line,
      from,
      dur: Math.round(acc * t.fps) - from,
      voiceFrom: Math.round((t.lead + intro) * t.fps),
      voiceDur: Math.round((v[line.id] ?? 3) * t.fps),
    };
  });
};
export type Scene = ReturnType<typeof buildScenes>[number];
export const totalOf = (scenes: Scene[]) => scenes[scenes.length - 1].from + scenes[scenes.length - 1].dur;

export const FPS = timing.fps;
export const SCENES = buildScenes(script, timing, voice as Record<string, number>);
export const TOTAL = totalOf(SCENES);
