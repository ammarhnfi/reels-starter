// Backsound + efek suara, disintesis lokal (bebas hak cipta).
//   node scripts/music.mjs              video promo -> public/audio/music.wav
//   node scripts/music.mjs --ep ep04    episode     -> public/audio/ep04-music.wav
// timing.json "style": "calm" = pad dan petikan jarang tanpa ketukan (untuk seri cerita).
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const SR = 44100;
const epAt = process.argv.indexOf("--ep");
const ep = epAt >= 0 ? process.argv[epAt + 1] : null;
const dir = ep ? `src/episodes/${ep}` : "src";
const T = JSON.parse(readFileSync(`${dir}/timing.json`, "utf8"));
const V = JSON.parse(readFileSync(`${dir}/voice.json`, "utf8"));
const calm = T.style === "calm";
const ids = Object.keys(V);
const sceneLen = ids.map((id, i) => V[id] + T.lead + T.tail + (i === 0 ? T.introExtra : 0) + (i === ids.length - 1 ? T.outroExtra : 0));
const starts = sceneLen.reduce((a, d, i) => (a.push(i ? a[i - 1] + sceneLen[i - 1] : 0), a), []);
const total = starts.at(-1) + sceneLen.at(-1);
mkdirSync("public/audio", { recursive: true });

const writeWav = (file, L, R = L) => {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  let peak = 1e-9; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = Math.min(1, 0.89 / peak);
  for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4); }
  writeFileSync(file, buf);
};
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

// ---------------------------------------------------------------- backsound
const n = Math.ceil(total * SR) + SR * 2;
const L = new Float32Array(n), R = new Float32Array(n);
const BPM = calm ? 72 : 96, beat = 60 / BPM, bar = beat * 4;
// Am  F  C  G  (akor naik pelan, hangat)
const chords = [[57, 60, 64], [53, 57, 60], [48, 55, 60, 64], [55, 59, 62]];
const t2 = starts[1], t3 = starts[2], tOut = starts.at(-1);
// calm: petikan mulai di momen fitur (T.liftAt = indeks adegan), sebelumnya hanya pad
const tLift = calm ? starts[T.liftAt ?? 0] : t2;

const add = (t0, dur, f, amp, pan = 0, kind = "pad") => {
  const i0 = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  for (let k = 0; k < len && i0 + k < n; k++) {
    const t = k / SR;
    let env, s;
    if (kind === "pad") {
      env = Math.min(1, t / 0.9) * Math.min(1, (dur - t) / 0.9);
      s = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.003 * t) + 0.18 * Math.sin(2 * Math.PI * f * 0.998 * t + 1);
    } else if (kind === "pluck") {
      env = Math.exp(-t * 5.5) * Math.min(1, t / 0.004);
      s = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t * 9);
    } else { // bass
      env = Math.min(1, t / 0.02) * Math.exp(-t * 1.6);
      s = Math.sin(2 * Math.PI * f * t);
    }
    const v = s * env * amp;
    L[i0 + k] += v * (1 - pan) * 0.5 + v * 0.5 * (1 - Math.abs(pan));
    R[i0 + k] += v * (1 + pan) * 0.5 + v * 0.5 * (1 - Math.abs(pan));
  }
};

for (let b = 0, t = 0; t < total + bar; b++, t += bar) {
  const ch = chords[b % 4];
  const outroFade = t > tOut + 1 ? 0.6 : 1;
  ch.forEach((m, j) => add(t, bar + 0.6, hz(m), 0.06 * outroFade, (j - 1) * 0.4, "pad"));
  if (calm) {
    // tiga petikan pelan per birama, naik saat momen fitur
    const lift = t >= tLift - 0.01;
    [0, 1.5, 2.5].forEach((q, s) => add(t + q * beat, 1.6, hz((s === 1 ? ch[1] : ch[s === 2 ? 2 : 0]) + 12 + (lift ? 12 : 0)), (lift ? 0.05 : 0.03) * outroFade, s % 2 ? 0.4 : -0.4, "pluck"));
    if (lift) add(t, bar, hz(ch[0] - 12), 0.09 * outroFade, 0, "bass");
    continue;
  }
  if (t >= t2 - 0.01) add(t, bar, hz(ch[0] - 12), 0.16 * outroFade, 0, "bass");
  if (t >= t2 - 0.01) {
    // arpeggio 1/8
    const arp = [...ch, ch[1] + 12, ch[0] + 12, ...ch.slice(1)];
    for (let s = 0; s < 8; s++) add(t + s * beat / 2, 0.9, hz(arp[s % arp.length] + 12), (s % 2 ? 0.045 : 0.065) * outroFade, s % 2 ? 0.5 : -0.5, "pluck");
  }
}
// ketukan lembut mulai adegan 3, berhenti di penutup
for (let t = Math.ceil(t3 / beat) * beat; !calm && t < tOut; t += beat) {
  const i0 = Math.floor(t * SR);
  for (let k = 0; k < SR * 0.25 && i0 + k < n; k++) {
    const tt = k / SR, f = 50 + 90 * Math.exp(-tt * 30);
    const v = Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt * 14) * 0.22;
    L[i0 + k] += v; R[i0 + k] += v;
  }
  // shaker di off-beat
  const j0 = Math.floor((t + beat / 2) * SR);
  for (let k = 0; k < SR * 0.05 && j0 + k < n; k++) { const v = rnd() * Math.exp(-(k / SR) * 80) * 0.03; L[j0 + k] += v; R[j0 + k] += v * 0.8; }
}
// gema sederhana (dua tap) supaya terasa luas
for (const [d, g] of [[0.23, 0.28], [0.37, 0.2]]) {
  const off = Math.floor(d * SR);
  for (let i = n - 1; i >= off; i--) { L[i] += R[i - off] * g; R[i] += L[i - off] * g; }
}
// fade in/out
const fi = SR * 1.2, fo = SR * 2.5, end = Math.floor(total * SR);
for (let i = 0; i < n; i++) {
  let g = Math.min(1, i / fi);
  if (i > end - fo) g *= Math.max(0, (end - i) / fo);
  L[i] *= g; R[i] *= g;
}
writeWav(ep ? `public/audio/${ep}-music.wav` : "public/audio/music.wav", L.subarray(0, end), R.subarray(0, end));

// ---------------------------------------------------------------- efek
const sfx = (file, dur, fn) => {
  const len = Math.floor(dur * SR), a = new Float32Array(len), b = new Float32Array(len);
  for (let k = 0; k < len; k++) { const [l, r] = fn(k / SR, k); a[k] = l; b[k] = r ?? l; }
  writeWav(file, a, b);
};
// whoosh: noise yang disaring naik-turun
let lp = 0, lp2 = 0;
sfx("public/audio/whoosh.wav", 0.7, (t) => {
  const x = t / 0.7, env = Math.sin(Math.PI * x) ** 2, c = 0.02 + 0.25 * Math.sin(Math.PI * x);
  lp += c * (rnd() - lp); lp2 += c * (lp - lp2);
  return [lp2 * env * (1 - x * 0.6), lp2 * env * (0.4 + x * 0.6)];
});
// pop: blip pendek untuk pin dan kartu
sfx("public/audio/pop.wav", 0.18, (t) => [Math.sin(2 * Math.PI * (520 + 900 * Math.exp(-t * 40)) * t) * Math.exp(-t * 28)]);
// boom: dentum rendah saat logo muncul
sfx("public/audio/boom.wav", 2.2, (t) => [Math.sin(2 * Math.PI * (38 + 60 * Math.exp(-t * 6)) * t) * Math.exp(-t * 1.8) + rnd() * Math.exp(-t * 25) * 0.15]);
// ding: notifikasi
sfx("public/audio/ding.wav", 1.2, (t) => [(Math.sin(2 * Math.PI * 1318.5 * t) * 0.6 + Math.sin(2 * Math.PI * 1975.5 * t) * 0.3) * Math.exp(-t * 4.5) * Math.min(1, t / 0.003)]);
// sparkle: kilau naik untuk penutup
sfx("public/audio/sparkle.wav", 1.6, (t) => {
  let s = 0; for (let j = 0; j < 6; j++) { const tj = t - j * 0.09; if (tj > 0) s += Math.sin(2 * Math.PI * hz(84 + [0, 4, 7, 12, 16, 19][j]) * tj) * Math.exp(-tj * 6); }
  return [s * 0.3];
});
// tick: ketukan keyboard HP
sfx("public/audio/tick.wav", 0.05, (t) => [(rnd() * 0.5 + Math.sin(2 * Math.PI * 2400 * t)) * Math.exp(-t * 160) * 0.5]);
// send: desis kecil naik saat pesan terkirim
sfx("public/audio/send.wav", 0.3, (t) => [Math.sin(2 * Math.PI * (600 + 2200 * t) * t) * Math.sin(Math.PI * t / 0.3) * 0.35]);
console.log("total", total.toFixed(2), "dtk; scene starts", starts.map((s) => s.toFixed(2)).join(" "));
