"""Bacakan src/script.json dengan Chatterbox-TTS-Indonesian, satu WAV per kalimat.

    .tts/venv/Scripts/python scripts/tts.py --ref rekaman/narator.wav [s1 s3 ...]
    .tts/venv/Scripts/python scripts/tts.py --ref ... --script src/episodes/ep04/script.json --out public/voice/ep04

Suara di Chatterbox punya dua bagian. T3 menentukan apa yang diucapkan dan bagaimana
(tempo, logat Indonesia), S3Gen menentukan warna suaranya. T3 tetap memakai
suara bawaan model yang dilatih bahasa Indonesia; S3Gen diambil dari rekaman.
Kalau rekaman dikloning utuh, logatnya cenderung ikut bergeser.
Hanya 10 detik pertama rekaman yang dipakai untuk warna suara.
"""
import argparse
import json
import os
import warnings

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS, Conditionals

warnings.filterwarnings("ignore")
MODEL_DIR = os.path.join(".tts", "models", "cb")
# pengaturan suara; naikkan exaggeration untuk nada lebih ekspresif
SETTINGS = dict(exaggeration=0.6, cfg_weight=0.5, temperature=0.7)
SEED = 42

ap = argparse.ArgumentParser()
ap.add_argument("ids", nargs="*", help="hanya kalimat ini (mis. s3 s5); kosong = semua")
ap.add_argument("--ref", required=True, help="rekaman suara narator (WAV)")
ap.add_argument("--script", default=os.path.join("src", "script.json"), help="naskah (JSON)")
ap.add_argument("--out", default=os.path.join("public", "voice"), help="folder hasil WAV")
a = ap.parse_args()

torch.set_num_threads(os.cpu_count() or 4)
model = ChatterboxTTS.from_local(MODEL_DIR, device="cpu")

# conditionals dicampur sekali per rekaman, lalu disimpan supaya cepat dipakai ulang
voice = os.path.join(".tts", "voices", os.path.splitext(os.path.basename(a.ref))[0] + ".pt")
if not os.path.exists(voice) or os.path.getmtime(voice) < os.path.getmtime(a.ref):
    os.makedirs(os.path.dirname(voice), exist_ok=True)
    indonesian = model.conds
    model.prepare_conditionals(a.ref, exaggeration=SETTINGS["exaggeration"])
    Conditionals(t3=indonesian.t3, gen=model.conds.gen).save(voice)
model.conds = Conditionals.load(voice, map_location="cpu")

lines = json.load(open(a.script, encoding="utf-8"))
os.makedirs(a.out, exist_ok=True)
for line in lines:
    if a.ids and line["id"] not in a.ids:
        continue
    torch.manual_seed(SEED)
    wav = model.generate(line["say"], **SETTINGS)
    torchaudio.save(os.path.join(a.out, line["id"] + ".wav"), wav, model.sr)
    print("selesai", line["id"], flush=True)
