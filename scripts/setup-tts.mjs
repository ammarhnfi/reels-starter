// Sekali per komputer: Python venv + Chatterbox (CPU) + model Indonesia ke .tts/ (±5 GB).
//   node scripts/setup-tts.mjs
import { execFileSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, renameSync } from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const PY = ".tts/venv/Scripts/python.exe";
const MODELS = ".tts/models/cb";
const ID = "https://huggingface.co/grandhigh/Chatterbox-TTS-Indonesian/resolve/main";
// t3_cfg = bagian yang dilatih bahasa Indonesia; s3gen dan ve sama dengan Chatterbox asli.
// conds.pt (suara bawaan) diambil dari rilis asli Chatterbox.
const FILES = [[`${ID}/tokenizer.json`, "tokenizer.json"], [`${ID}/ve.safetensors`, "ve.safetensors"],
  [`${ID}/s3gen.safetensors`, "s3gen.safetensors"], [`${ID}/t3_cfg.safetensors`, "t3_cfg.safetensors"],
  ["https://huggingface.co/ResembleAI/chatterbox/resolve/main/conds.pt", "conds.pt"]];

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });
if (!existsSync(PY)) {
  run("python", ["-m", "venv", ".tts/venv"]);
  run(PY, ["-m", "pip", "install", "-q", "--upgrade", "pip"]);
  // watermark Chatterbox (resemble-perth) masih memakai pkg_resources, yang tidak ikut venv Python 3.13
  run(PY, ["-m", "pip", "install", "-q", "chatterbox-tts==0.1.7", "soundfile", "setuptools<81"]);
}
mkdirSync(MODELS, { recursive: true });
for (const [url, name] of FILES) {
  const file = `${MODELS}/${name}`;
  if (existsSync(file)) { console.log("sudah ada:", name); continue; }
  console.log("mengunduh", name);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  // dialirkan ke disk, file terbesar 2 GB
  await pipeline(Readable.fromWeb(res.body), createWriteStream(`${file}.part`));
  renameSync(`${file}.part`, file);
}
console.log("Siap. Taruh rekaman di rekaman/narator.wav lalu jalankan: npm run voice");
