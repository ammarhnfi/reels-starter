import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Scene } from "../timeline";
import { C, FONT, Headline, Sfx, usePop, wordAt } from "../ui";

// Penutup: logo, kalimat yang membekas, lalu ajakan.
export const S3Penutup: React.FC<{ s: Scene }> = ({ s }) => {
  const f = useCurrentFrame();
  const at = (w: string) => s.voiceFrom + wordAt(s.sub, s.voiceDur, w);
  const logo = usePop(4, { damping: 10, stiffness: 120, mass: 0.8 });
  const ctaAt = s.voiceFrom + s.voiceDur + 6;
  const cta = usePop(ctaAt, { damping: 10, stiffness: 140, mass: 0.7 });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <img src={staticFile("img/logo.png")} style={{ width: 220, height: 220, borderRadius: 56, transform: `scale(${logo}) rotate(${(1 - logo) * -20}deg)`,
          boxShadow: "0 40px 90px rgba(0,0,0,.45)" }} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, color: "#fff", opacity: logo }}>Catatku</div>
      </div>
      <Headline top={860} size={80} lines={[
        { text: "Biar akhir bulan,", at: at("Biar") - 4 },
        { text: "nggak bikin kaget.", at: at("nggak") - 4, color: C.gold },
      ]} />
      <div style={{ position: "absolute", top: 1300, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: cta, transform: `scale(${0.6 + cta * 0.4})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: C.ink, background: C.gold, padding: "22px 52px", borderRadius: 99,
          boxShadow: `0 0 0 ${8 + Math.sin(f / 6) * 4}px ${C.gold}55, 0 24px 50px rgba(0,0,0,.35)` }}>
          Coba gratis
        </div>
      </div>
      <Sfx at={4} src="boom" volume={0.4} />
      <Sfx at={ctaAt} src="sparkle" volume={0.4} />
    </AbsoluteFill>
  );
};
