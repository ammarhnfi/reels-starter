# Reels Starter

Template untuk membuat video Reels, Shorts, atau TikTok (1080×1920) dengan kode React, sepenuhnya di laptop sendiri:

- **Remotion** merakit gambar dan animasi.
- **Chatterbox-TTS-Indonesian** membuat narasi bahasa Indonesia dengan warna suaramu sendiri, dari rekaman sekitar 10 detik.
- **Musik dan efek suara** disintesis langsung oleh skrip, jadi bebas hak cipta.
- **Subtitle karaoke** dan **durasi adegan** menyesuaikan panjang suara secara otomatis.

Tidak perlu API berbayar dan tidak perlu GPU.

Contoh di dalamnya adalah aplikasi fiktif bernama "Catatku" (3 adegan). Ganti semuanya dengan proyekmu.

## Yang perlu disiapkan
- [Node.js](https://nodejs.org) versi 18 atau lebih baru
- [Python](https://python.org) 3.11–3.13. Saat memasang, centang "Add to PATH".
- Ruang kosong ±6 GB untuk model suara

## Pasang (sekali saja)
```bash
npm install
npm run setup:tts
```
`setup:tts` membuat Python venv di `.tts/`, memasang Chatterbox (PyTorch versi CPU), dan mengunduh model bahasa Indonesia. Python bawaan komputermu tidak diubah.

Catatan: perintah ini memakai path venv Windows (`.tts/venv/Scripts/python.exe`). Di macOS atau Linux, ganti menjadi `.tts/venv/bin/python` di `scripts/setup-tts.mjs` dan `scripts/voice.mjs`.

## Membuat video
1. **Rekam suaramu** selama 10–12 detik. Bicara jelas, di ruangan yang tidak bergema, kalimatnya bebas. Simpan sebagai `rekaman/narator.wav`.
2. **Tulis naskah** di `src/script.json`, satu baris per adegan:
   ```json
   { "id": "s1", "say": "yang diucapkan", "sub": "yang tampil di subtitle" }
   ```
   `say` boleh ditulis sesuai cara baca (misalnya "lima detik", "er te"), sedangkan `sub` memakai ejaan yang rapi ("5 detik", "RT").
3. **Buat suara, musik, lalu render:**
   ```bash
   npm run voice     # ±1 menit per kalimat di CPU
   npm run music     # jalankan setelah voice, karena panjang lagu mengikuti naskah
   npm run render    # hasil: out/video.mp4
   ```
   Untuk membuat ulang satu kalimat saja: `node scripts/voice.mjs s2`

## Melihat dan mengedit
```bash
npm run studio
```
Perintah ini membuka preview di browser. Video bisa diputar dan digeser per frame, dan setiap file yang disimpan langsung terlihat hasilnya.

## Mau mengubah apa?
| Yang diubah | File |
|---|---|
| Logo | `public/img/logo.png` (persegi, PNG) |
| Warna brand | Objek `C` di `src/ui.tsx` |
| Naskah | `src/script.json` |
| Isi tiap adegan | `src/scenes/*.tsx` |
| Menambah adegan | Buat file di `src/scenes/`, beri `id` baru di `script.json`, lalu daftarkan di `VIEWS` (`src/Video.tsx`) |
| Jeda antar-adegan | `src/timing.json` (`lead` sebelum suara, `tail` sesudahnya, `outroExtra` untuk penutup) |
| Gaya musik | `src/timing.json`: `"style": "calm"` untuk yang tenang; hapus untuk versi berketukan |
| Volume musik | `musicVol` di `src/Reel.tsx` (saat ada suara, saat jeda) |
| Latar | `src/Bg.tsx` |

## Komponen siap pakai (`src/ui.tsx`)
- `Caption`: subtitle karaoke; kata yang sedang diucapkan menyala.
- `Headline`: judul besar yang muncul baris demi baris dengan efek 3D.
- `Phone`: mockup HP untuk memamerkan tampilan aplikasi.
- `AppBar`: baris judul aplikasi dengan logo.
- `Sfx`: memutar efek suara (`whoosh`, `pop`, `ding`, `boom`, `sparkle`) di frame tertentu.
- `usePop`: animasi pegas untuk elemen yang muncul.
- `wordAt`: perkiraan frame saat sebuah kata diucapkan, supaya animasi pas dengan narasi.

## Tips konten
- **Satu video, satu masalah.** Taruh masalahnya di 3 detik pertama dan produknya belakangan.
- Durasi 20–40 detik.
- Tutup dengan pertanyaan untuk kolom komentar, bukan "download sekarang".
- Tandai data atau nama fiktif di layar.

## Ingin model 3D?
```bash
npm install @remotion/three @react-three/fiber@8 three
```
Lalu pakai `<ThreeCanvas>` dari `@remotion/three` di dalam adegan. Model `.glb` taruh di `public/models/`.

## Jalan pintas dengan Claude Code
Buka folder ini di Claude Code, lalu minta dalam bahasa biasa. Misalnya:
> "Ganti contoh Catatku dengan produkku: [jelaskan]. Warna utama #XXXXXX, logo sudah di public/img/logo.png. Buat video 30 detik: masalahnya …, solusinya …"
