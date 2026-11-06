import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Scene } from "../timeline";
import { AppBar, C, Caption, Phone, Sfx, usePop } from "../ui";

// Contoh data (fiktif)
const ITEMS: [string, string, number][] = [["☕", "Kopi", 18_000], ["🛵", "Ojek", 24_000], ["🍜", "Makan siang", 35_000], ["📺", "Langganan", 54_000]];

const Row: React.FC<{ at: number; icon: string; name: string; amount: number }> = ({ at, icon, name, amount }) => {
  const p = usePop(at);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 24, padding: "18px 22px", margin: "0 22px 14px",
      opacity: p, transform: `translateX(${(1 - p) * 120}px)` }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: C.paper, display: "grid", placeItems: "center", fontSize: 32 }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 30, fontWeight: 800 }}>{name}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#DC2626" }}>-{amount.toLocaleString("id-ID")}</div>
    </div>
  );
};

// HP masuk dari samping dan berayun 3D (CSS perspective), baris pengeluaran muncul satu per satu.
export const S2Hp: React.FC<{ s: Scene }> = ({ s }) => {
  const f = useCurrentFrame();
  const enter = usePop(0, { damping: 14, stiffness: 90, mass: 1 });
  const ry = interpolate(f, [0, s.dur], [18, -8]);
  const step = Math.max(8, (s.voiceDur * 0.7) / ITEMS.length);
  const totalAt = s.voiceFrom + step * ITEMS.length + 6;
  const bar = usePop(totalAt);
  return (
    <AbsoluteFill style={{ perspective: 1700 }}>
      <div style={{ position: "absolute", left: 540 - 250, top: 170, transform: `translateX(${(1 - enter) * 900}px) rotateY(${ry}deg) rotateX(6deg)` }}>
        <Phone time="21.40">
          <AppBar title="Catatku" />
          <div style={{ fontSize: 24, fontWeight: 700, color: "#6B7280", padding: "0 28px 12px" }}>Hari ini</div>
          {ITEMS.map(([icon, name, amount], i) => <Row key={name} at={s.voiceFrom + i * step} icon={icon} name={name} amount={amount} />)}
          <div style={{ margin: "18px 22px", background: C.brand, color: "#fff", borderRadius: 24, padding: "20px 24px", opacity: bar }}>
            <div style={{ fontSize: 24, fontWeight: 700, opacity: 0.8 }}>Paling banyak buat</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>📺 Langganan · 41%</div>
            <div style={{ height: 14, borderRadius: 9, background: "rgba(255,255,255,.25)", marginTop: 14 }}>
              <div style={{ width: `${bar * 41}%`, height: "100%", borderRadius: 9, background: C.gold }} />
            </div>
          </div>
        </Phone>
      </div>
      {ITEMS.map((_, i) => <Sfx key={i} at={s.voiceFrom + i * step} src="pop" volume={0.35} />)}
      <Sfx at={totalAt} src="ding" volume={0.4} />
      <Caption text={s.sub} from={s.voiceFrom} dur={s.voiceDur} y={1330} />
    </AbsoluteFill>
  );
};
