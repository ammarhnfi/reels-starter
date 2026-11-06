// Suara narasi lokal lewat Chatterbox-TTS-Indonesian (scripts/tts.py) + durasinya.
//   node scripts/voice.mjs                 semua kalimat video promo
//   node scripts/voice.mjs s3 s5           hanya kalimat tertentu (yang lain tetap)
//   node scripts/voice.mjs --ep ep04 [e2]  episode di src/episodes/ep04/
// Rekaman narator: VOICE_REF, atau rekaman/narator.wav, atau WAV pertama di rekaman/.
import { spawnSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";

const PY = ".tts/venv/Scripts/python.exe";
if (!existsSync(PY)) throw new Error("Belum dipasang. Jalankan dulu: npm run setup:tts");

const args = process.argv.slice(2);
const epAt = args.indexOf("--ep");
const ep = epAt >= 0 ? args.splice(epAt, 2)[1] : null;
const dir = ep ? `src/episodes/${ep}` : "src";
const out = ep ? `public/voice/${ep}` : "public/voice";
if (!existsSync(`${dir}/script.json`)) throw new Error(`Naskah tidak ada: ${dir}/script.json`);

const ref = process.env.VOICE_REF
  || (existsSync("rekaman/narator.wav") ? "rekaman/narator.wav" : null)
  || (existsSync("rekaman") && readdirSync("rekaman").filter((f) => f.endsWith(".wav")).sort().map((f) => `rekaman/${f}`)[0]);
if (!ref) throw new Error("Taruh rekaman suara narator di rekaman/narator.wav");
console.log("Rekaman narator:", ref, ep ? `| episode ${ep}` : "");

const r = spawnSync(PY, ["scripts/tts.py", "--ref", ref, "--script", `${dir}/script.json`, "--out", out, ...args], { stdio: "inherit" });
if (r.status !== 0) throw new Error("tts.py gagal");

// durasi dari header WAV
const wavSeconds = (f) => {
  const b = readFileSync(f);
  const bytesPerSec = b.readUInt32LE(28);
  for (let i = 12; i < b.length; ) {
    const id = b.toString("ascii", i, i + 4), size = b.readUInt32LE(i + 4);
    if (id === "data") return size / bytesPerSec;
    i += 8 + size;
  }
  throw new Error("data chunk tidak ditemukan: " + f);
};

const lines = JSON.parse(readFileSync(`${dir}/script.json`, "utf8"));
const durs = {};
for (const l of lines) {
  durs[l.id] = +wavSeconds(`${out}/${l.id}.wav`).toFixed(3);
  console.log(l.id, durs[l.id] + " dtk");
}
writeFileSync(`${dir}/voice.json`, JSON.stringify(durs, null, 2));
console.log(`Selesai: ${dir}/voice.json`);
