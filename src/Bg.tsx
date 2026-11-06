import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C } from "./ui";

// Latar yang menyambung di semua adegan: gradasi warna brand, pola titik, dan cahaya melayang.
export const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.mid} 0%, ${C.deep} 100%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% ${42 + Math.sin(f / 60) * 4}%, ${C.green}55 0%, transparent 70%)` }} />
      <AbsoluteFill style={{ opacity: 0.12, backgroundImage: "radial-gradient(#fff 2px, transparent 2.5px)", backgroundSize: "60px 60px",
        backgroundPosition: `${(f * 0.3) % 60}px ${(f * 0.2) % 60}px` }} />
      {Array.from({ length: 20 }).map((_, i) => {
        const size = 30 + random(`b${i}`) * 110;
        const y = (random(`by${i}`) * 2200 - f * (0.6 + random(`bs${i}`) * 1.4)) % 2200;
        return (
          <div key={i} style={{ position: "absolute", left: random(`bx${i}`) * 1080 - size / 2, top: (y < 0 ? y + 2200 : y) - 140, width: size, height: size,
            borderRadius: "50%", background: i % 4 === 0 ? C.gold : C.mint, filter: `blur(${size / 5}px)`, opacity: 0.06 + random(`bo${i}`) * 0.1 }} />
        );
      })}
    </AbsoluteFill>
  );
};
