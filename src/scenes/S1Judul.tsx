import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Scene } from "../timeline";
import { C, Caption, FONT, Headline, Sfx, clamp, usePop, wordAt } from "../ui";

// Adegan pembuka: hook berupa masalah. Saldo turun cepat sambil judul muncul.
export const S1Judul: React.FC<{ s: Scene }> = ({ s }) => {
  const f = useCurrentFrame();
  const at = (w: string) => s.voiceFrom + wordAt(s.sub, s.voiceDur, w);
  const drop = interpolate(f, [s.voiceFrom + 10, at("tinggal")], [0, 1], clamp);
  const saldo = Math.round(4_500_000 - drop * (4_500_000 - 87_000));
  const card = usePop(0);
  return (
    <AbsoluteFill>
      <Headline top={260} size={92} lines={[
        { text: "Gajian baru", at: at("Gajian") - 6 },
        { text: "seminggu…", at: at("seminggu") - 6, color: C.gold },
      ]} />
      <div style={{ position: "absolute", top: 640, left: 140, right: 140, background: "#fff", borderRadius: 44, padding: "44px 48px", fontFamily: FONT,
        boxShadow: "0 50px 100px rgba(0,0,0,.4)", transform: `scale(${0.7 + card * 0.3}) rotate(${(1 - card) * -6}deg)`, opacity: card }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#6B7280" }}>Saldo</div>
        <div style={{ fontSize: 96, fontWeight: 800, color: drop > 0.95 ? "#DC2626" : C.ink }}>
          Rp {saldo.toLocaleString("id-ID")}
        </div>
      </div>
      <Sfx at={at("tinggal")} src="pop" volume={0.5} />
      <Caption text={s.sub} from={s.voiceFrom} dur={s.voiceDur} />
    </AbsoluteFill>
  );
};
