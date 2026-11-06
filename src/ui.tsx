import React from "react";
import { Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FONT = '"Plus Jakarta Sans", "Segoe UI", sans-serif';
// Warna brand. Ganti di sini, semua adegan ikut berubah.
// (nama kunci dipertahankan supaya komponen lain tetap jalan: deep = latar gelap, brand/green = warna utama, gold = sorotan)
export const C = {
  deep: "#0B1230", brand: "#3730A3", mid: "#312E81", green: "#6366F1", mint: "#A5B4FC",
  amber: "#F97316", gold: "#FACC15", cream: "#FFF7ED", ink: "#111827", paper: "#F5F6FA",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(`audio/${src}.wav`)} volume={volume} />
  </Sequence>
);

export const usePop = (delay: number, config = { damping: 12, stiffness: 170, mass: 0.7 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

// ------------------------------------------------------------ waktu kata (perkiraan dari panjang kata)
export const wordTimes = (text: string, durFrames: number) => {
  const words = text.split(/\s+/);
  const w = words.map((x) => x.replace(/[^\p{L}\p{N}]/gu, "").length + 2 + (/[,.?!]$/.test(x) ? 5 : 0));
  const sum = w.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((word, i) => {
    const s = (acc / sum) * durFrames;
    acc += w[i];
    return { word, s, e: (acc / sum) * durFrames };
  });
};
// frame saat kata yang diawali `startsWith` mulai diucapkan
export const wordAt = (text: string, durFrames: number, startsWith: string) => {
  const t = wordTimes(text, durFrames).find((x) => x.word.toLowerCase().startsWith(startsWith.toLowerCase()));
  return t ? t.s : 0;
};

// ------------------------------------------------------------ subtitle karaoke
export const Caption: React.FC<{ text: string; from: number; dur: number; y?: number }> = ({ text, from, dur, y = 1290 }) => {
  const frame = useCurrentFrame() - from;
  const { fps } = useVideoConfig();
  const words = wordTimes(text, dur);
  const chunks: (typeof words)[] = [];
  for (const w of words) {
    const last = chunks[chunks.length - 1];
    if (!last || last.length >= 4 || /[,.?!]$/.test(last[last.length - 1].word)) chunks.push([w]);
    else last.push(w);
  }
  const idx = chunks.findIndex((c, i) => frame >= c[0].s && (i === chunks.length - 1 || frame < chunks[i + 1][0].s));
  if (frame < 0 || frame > dur + 12 || idx < 0) return null;
  const chunk = chunks[idx];
  const pop = spring({ frame: frame - chunk[0].s, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 18px",
      transform: `scale(${interpolate(pop, [0, 1], [0.82, 1])})`, opacity: pop }}>
      {chunk.map((w, i) => {
        const on = frame >= w.s && frame < w.e + 4;
        return (
          <span key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.18, color: on ? C.gold : "#fff",
            WebkitTextStroke: `12px ${C.deep}`, paintOrder: "stroke fill", textShadow: "0 8px 24px rgba(0,0,0,.45)",
            transform: `translateY(${on ? -4 : 0}px)` }}>
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------ mockup HP
export const Phone: React.FC<{ w?: number; children: React.ReactNode; time?: string }> = ({ w = 500, children, time = "19.03" }) => (
  <div style={{ width: w, height: w * 2.06, borderRadius: w * 0.14, background: "#0B0F0E", padding: w * 0.028,
    boxShadow: "0 70px 140px rgba(0,0,0,.55), inset 0 0 0 3px #2a2f2d", position: "relative" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: w * 0.115, background: C.paper, overflow: "hidden", position: "relative", fontFamily: FONT, color: C.ink }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", fontSize: 22, fontWeight: 700 }}>
        <span>{time}</span>
        <span style={{ width: 120, height: 30, borderRadius: 20, background: "#0B0F0E" }} />
        <span style={{ letterSpacing: 2 }}>5G ▮▮▮</span>
      </div>
      {children}
    </div>
  </div>
);

export const AppBar: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 28px 18px" }}>
    <img src={staticFile("img/logo.png")} style={{ width: 46, height: 46, borderRadius: 12 }} />
    <div style={{ fontSize: 28, fontWeight: 800, color: C.brand, flex: 1 }}>{title}</div>
    {right}
  </div>
);

// judul besar, tiap baris muncul pada frame `at`
export const Headline: React.FC<{ lines: { text: string; at: number; color?: string }[]; top: number; size?: number }> = ({ lines, top, size = 96 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.08, perspective: 900 }}>
      {lines.map((l, i) => {
        const p = spring({ frame: frame - l.at, fps, config: { damping: 15, stiffness: 140 } });
        return (
          <div key={i} style={{ color: l.color || "#fff", opacity: p, transform: `translateY(${(1 - p) * 50}px) rotateX(${(1 - p) * 70}deg)`,
            textShadow: "0 10px 40px rgba(0,0,0,.45)", transformOrigin: "50% 100%" }}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};
