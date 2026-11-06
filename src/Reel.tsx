import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "./timeline";
import { Sfx, clamp } from "./ui";

// Masuk: zoom + blur singkat. Keluar: mengecil dan memudar. Adegan pertama langsung terlihat (thumbnail).
// `cutIn`/`cutOut` = sambung langsung tanpa transisi (adegan yang satu layar dengan sebelah/sesudahnya).
const Shell: React.FC<{ dur: number; cutIn: boolean; cutOut: boolean; children: React.ReactNode }> = ({ dur, cutIn, cutOut, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = cutIn ? 1 : spring({ frame: f, fps, config: { damping: 18, stiffness: 120 } });
  const out = cutOut ? 0 : interpolate(f, [dur - 8, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, inP * 1.6) * (1 - out), filter: `blur(${(1 - inP) * 14 + out * 12}px)`,
      transform: `scale(${interpolate(inP, [0, 1], [1.14, 1]) * (1 - out * 0.08)})` }}>
      {children}
    </AbsoluteFill>
  );
};

export type ReelProps = {
  scenes: Scene[];
  views: Record<string, React.FC<{ s: Scene }>>;
  voiceDir: string; // di public/, mis. "voice" atau "voice/ep04"
  music: string; // di public/, mis. "audio/music.wav"
  bg: React.ReactNode;
  join?: string[]; // id adegan yang menyambung tanpa transisi dari adegan sebelumnya
  musicVol?: [number, number]; // [saat ada suara, saat jeda]
};

export const Reel: React.FC<ReelProps> = ({ scenes, views, voiceDir, music, bg, join = [], musicVol = [0.13, 0.24] }) => {
  const [fonts] = useState(() => delayRender("Memuat font"));
  useEffect(() => {
    Promise.all(["500", "700", "800"].map((w) => document.fonts.load(`${w} 40px "Plus Jakarta Sans"`))).then(() => continueRender(fonts));
  }, [fonts]);
  // suara narasi aktif di frame ini? (untuk menurunkan musik di bawah suara)
  const speaking = (f: number) => scenes.some((s) => f >= s.from + s.voiceFrom - 3 && f <= s.from + s.voiceFrom + s.voiceDur + 3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {bg}
      {scenes.map((s, i) => {
        const View = views[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={`${s.id}: ${s.sub.slice(0, 30)}`}>
            <Shell dur={s.dur} cutIn={i === 0 || join.includes(s.id)} cutOut={i === scenes.length - 1 || join.includes(scenes[i + 1]?.id)}>
              <View s={s} />
            </Shell>
            <Sequence from={s.voiceFrom} layout="none" name="suara">
              <Audio src={staticFile(`${voiceDir}/${s.id}.wav`)} volume={1} />
            </Sequence>
          </Sequence>
        );
      })}
      {scenes.slice(1).filter((s) => !join.includes(s.id)).map((s) => <Sfx key={`w${s.id}`} at={s.from - 7} src="whoosh" volume={0.45} />)}
      <Audio src={staticFile(music)} volume={(f) => (speaking(f) ? musicVol[0] : musicVol[1])} />
    </AbsoluteFill>
  );
};
