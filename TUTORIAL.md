# Tutorial lengkap: bikin video Reels sendiri pakai Reels Starter

Panduan ini untuk kamu yang ingin membuat video promo vertikal (Reels, TikTok, Shorts) untuk proyekmu sendiri. Semuanya berjalan di laptopmu. Narasinya pakai **suaramu sendiri** yang ditirukan AI secara lokal, jadi **tidak perlu API berbayar**.

Hasil akhirnya berupa `out/video.mp4` berukuran 1080×1920, berisi:
- adegan animasi (mockup HP, judul, logo);
- narasi dengan suaramu;
- subtitle karaoke yang mengikuti ucapan;
- musik latar dan efek suara.

Repo: https://github.com/ammarhnfi/reels-starter

---

## Daftar isi
1. [Gambaran cara kerja](#1-gambaran-cara-kerja)
2. [Yang perlu dipasang dulu](#2-yang-perlu-dipasang-dulu)
3. [Ambil kodenya dari GitHub](#3-ambil-kodenya-dari-github)
4. [Pasang semuanya (sekali saja)](#4-pasang-semuanya-sekali-saja)
5. [Lihat contoh bawaan di Studio](#5-lihat-contoh-bawaan-di-studio)
6. [Rekam suaramu](#6-rekam-suaramu)
7. [Tulis naskah](#7-tulis-naskah)
8. [Bikin suara, musik, lalu video](#8-bikin-suara-musik-lalu-video)
9. [Ganti tampilan jadi milik proyekmu](#9-ganti-tampilan-jadi-milik-proyekmu)
10. [Membuat adegan baru](#10-membuat-adegan-baru)
11. [Bikin banyak episode](#11-bikin-banyak-episode)
12. [Simpan proyekmu di GitHub sendiri](#12-simpan-proyekmu-di-github-sendiri)
13. [Tips konten supaya ditonton](#13-tips-konten-supaya-ditonton)
14. [Kalau ada masalah](#14-kalau-ada-masalah)
15. [Jalan pintas pakai Claude Code](#15-jalan-pintas-pakai-claude-code)

---

## 1. Gambaran cara kerja

```
rekaman/narator.wav ─┐
                     ├─► npm run voice ─► public/voice/s1.wav, s2.wav, ... + src/voice.json (durasi)
src/script.json ─────┘
                         npm run music ─► public/audio/music.wav + efek suara
src/scenes/*.tsx ──────────────────────┐
                                       ├─► npm run render ─► out/video.mp4
src/timing.json, src/ui.tsx (warna) ───┘
```

- **Remotion** membuat video dari kode React. Satu adegan adalah satu komponen React.
- **Chatterbox-TTS-Indonesian** mengubah teks menjadi suara berlogat Indonesia dan meniru warna suaramu dari rekaman pendek.
- **Panjang tiap adegan otomatis mengikuti panjang suaranya.** Kamu tidak perlu mengatur detik secara manual.

Contoh bawaan di repo adalah aplikasi fiktif **"Catatku"** (pencatat pengeluaran) dengan 3 adegan. Tinggal kamu ganti dengan proyekmu.

---

## 2. Yang perlu dipasang dulu

| Program | Versi | Catatan |
|---|---|---|
| [Git](https://git-scm.com/downloads) | terbaru | Untuk mengambil kode dari GitHub |
| [Node.js](https://nodejs.org) | 18 atau lebih baru (pilih LTS) | Menjalankan Remotion |
| [Python](https://www.python.org/downloads/) | **3.11, 3.12, atau 3.13** | Menjalankan model suara. **Saat memasang di Windows, centang "Add python.exe to PATH".** |
| Ruang disk | ± 6 GB kosong | Model suara sekitar 5 GB |

Tidak perlu GPU. Suara dibuat dengan CPU, kira-kira 1 menit per kalimat.

Cek dulu di terminal (Windows: PowerShell atau Git Bash):

```bash
git --version
node --version
python --version
```

Ketiganya harus menampilkan nomor versi. Kalau `python` tidak dikenali, lihat [bagian 14](#14-kalau-ada-masalah).

---

## 3. Ambil kodenya dari GitHub

### Cara A: salin ke repo milikmu (disarankan)
1. Masuk ke akun GitHub-mu dan buka https://github.com/ammarhnfi/reels-starter
2. Klik **Fork** (kanan atas) dan beri nama sesuai proyekmu, misalnya `video-tokoku`.
3. Clone repo milikmu ke laptop. Ganti `USERNAME-KAMU` dan nama repo:

```bash
git clone https://github.com/USERNAME-KAMU/video-tokoku.git
cd video-tokoku
```

> Fork dari repo publik akan ikut publik. Kalau proyekmu masih rahasia, pakai **Cara B** lalu push ke repo **private** baru (lihat [bagian 12](#12-simpan-proyekmu-di-github-sendiri)).

### Cara B: clone langsung

```bash
git clone https://github.com/ammarhnfi/reels-starter.git
cd reels-starter
```

---

## 4. Pasang semuanya (sekali saja)

Jalankan di dalam folder proyek.

### 4a. Paket Node (Remotion dan kawan-kawan)

```bash
npm install
```

### 4b. Model suara

```bash
npm run setup:tts
```

Perintah ini:
- membuat lingkungan Python khusus di folder `.tts/`;
- memasang PyTorch dan Chatterbox;
- mengunduh model suara Indonesia (± 5 GB).

Waktunya **15–40 menit** tergantung internet, dan cukup sekali.

> **Pakai Mac atau Linux?** Sebelum menjalankan perintah di atas, ubah `.tts/venv/Scripts/python.exe` menjadi `.tts/venv/bin/python` di dua file berikut:
> - `scripts/setup-tts.mjs`
> - `scripts/voice.mjs`

Folder `.tts/` otomatis diabaikan Git, jadi model 5 GB tidak ikut ter-upload.

---

## 5. Lihat contoh bawaan di Studio

```bash
npm run studio
```

Remotion Studio akan terbuka di browser (biasanya `http://localhost:3000`). Pilih komposisi **Video** di kiri, lalu tekan play. Setiap kali kamu menyimpan file, pratinjau langsung ikut berubah. Untuk berhenti, tekan `Ctrl + C` di terminal.

Contoh bawaan masih bisu karena kamu belum membuat suara. Itu normal.

---

## 6. Rekam suaramu

Model hanya butuh contoh suara **10–12 detik**.

1. Rekam dengan HP atau laptop di ruangan **tenang**, tanpa kipas, musik, atau gema.
2. Bicaralah **senatural mungkin**, dengan gaya yang sama seperti narasi videomu nanti. Misalnya:
   > "Halo, aku lagi nyoba bikin video pakai suaraku sendiri. Nanti kalimat-kalimat di video ini diucapkan dengan suara yang mirip suaraku. Semoga hasilnya enak didengar ya."
3. Ubah ke format **WAV** kalau masih m4a atau mp3, misalnya dengan Audacity (gratis).
4. Simpan sebagai `rekaman/narator.wav`. Buat folder `rekaman/` kalau belum ada.

Folder `rekaman/` juga diabaikan Git, jadi suaramu tidak ikut ter-upload.

**Tips:**
- Hanya **10 detik pertama** yang dipakai. Potong jeda hening di awal rekaman.
- Kalau hasilnya kurang mirip, rekam ulang dengan suara lebih jelas dan sedikit lebih ekspresif.

---

## 7. Tulis naskah

Buka `src/script.json`. Isinya daftar kalimat, satu kalimat untuk satu adegan:

```json
[
  { "id": "s1", "say": "Gajian baru seminggu, kok saldo tinggal segini?", "sub": "Gajian baru seminggu, kok saldo tinggal segini?" },
  { "id": "s2", "say": "...", "sub": "..." },
  { "id": "s3", "say": "...", "sub": "..." }
]
```

| Kolom | Artinya |
|---|---|
| `id` | Nama adegan. Harus sama dengan kunci di `VIEWS` (lihat [bagian 10](#10-membuat-adegan-baru)) |
| `say` | Yang **diucapkan** AI. Tulis sesuai cara membacanya |
| `sub` | Yang **tampil sebagai subtitle**. Tulis dengan ejaan yang benar |

Keduanya dipisah supaya pengucapannya tepat tapi tulisannya tetap rapi. Contoh:

| say (diucapkan) | sub (ditulis) |
|---|---|
| `tiga ratus meter` | `300 meter` |
| `satu er te` | `1 RT` |
| `empat puluh satu persen` | `41%` |

**Aturan menulis:**
- Di `say`, tulis angka, singkatan, dan simbol dalam bentuk ucapan.
- Pakai koma untuk jeda pendek dan titik untuk jeda lebih panjang.
- Satu kalimat idealnya 3–6 detik saat diucapkan.
- Jumlah kata di `say` dan `sub` sebaiknya kurang lebih sama, karena subtitle karaoke membagi waktu per kata.

---

## 8. Bikin suara, musik, lalu video

Urutannya penting: **voice → music → render**.

### 8a. Suara

```bash
npm run voice
```

Perintah ini membuat `public/voice/s1.wav`, `s2.wav`, dan seterusnya, lalu menulis durasinya ke `src/voice.json`. Waktunya ± 1 menit per kalimat.

Kalau hanya satu kalimat yang kurang pas, ubah naskahnya lalu buat ulang kalimat itu saja:

```bash
node scripts/voice.mjs s2
```

Bisa juga beberapa sekaligus: `node scripts/voice.mjs s1 s3`.

> Kalau ada kata yang terdengar aneh, ubah penulisannya di `say`: tulis seperti diucapkan, tambahkan koma, atau ganti kata.

### 8b. Musik dan efek suara

```bash
npm run music
```

Perintah ini membuat `public/audio/music.wav` dan efek suara seperti whoosh, pop, dan ding. **Ulangi setiap kali suara berubah**, karena panjang musik mengikuti total durasi suara.

### 8c. Render

```bash
npm run render
```

Hasilnya **`out/video.mp4`**, siap diunggah.

Untuk mengambil satu gambar diam sebagai thumbnail:

```bash
npm run still
```

Hasilnya: `out/still.png`.

---

## 9. Ganti tampilan jadi milik proyekmu

| Mau mengubah | File | Caranya |
|---|---|---|
| Logo | `public/img/logo.png` | Ganti dengan logomu (PNG persegi) |
| Warna merek | `src/ui.tsx`, objek `C` | Ganti kode warna hex |
| Isi adegan | `src/scenes/*.tsx` | Ubah teks, angka, dan elemen |
| Nama dan slogan di penutup | `src/scenes/S3Penutup.tsx` | Ganti "Catatku" dan slogannya |
| Latar belakang | `src/Bg.tsx` | Gradasi, titik-titik, dan cahaya bokeh |
| Jeda dan durasi | `src/timing.json` | Lihat tabel di bawah |
| Volume musik | `src/Video.tsx` | Tambahkan prop `musicVol` ke `<Reel>` |

### Warna (`src/ui.tsx`)
```ts
export const C = {
  deep: "#0B1230", brand: "#3730A3", mid: "#312E81", green: "#6366F1", mint: "#A5B4FC",
  amber: "#F97316", gold: "#FACC15", cream: "#FFF7ED", ink: "#111827", paper: "#F5F6FA",
};
```
- `deep`, `brand`, `mid`: latar gelap dan warna utama merek.
- `green`, `mint`: aksen. Namanya saja yang "green"; isinya boleh warna apa pun.
- `amber`, `gold`: sorotan.
- `ink`: warna teks gelap.

Cukup ganti kodenya, dan semua adegan otomatis ikut berubah.

### Volume musik (`src/Video.tsx`)
```tsx
<Reel ... musicVol={[0.10, 0.20]} />
```
Angka pertama adalah volume saat ada suara narasi, angka kedua saat jeda. Bawaannya `[0.13, 0.24]`.

### Pengaturan waktu (`src/timing.json`)
```json
{ "fps": 30, "lead": 0.4, "tail": 0.7, "introExtra": 0.4, "outroExtra": 2.5, "style": "calm", "liftAt": 1 }
```
| Kunci | Artinya |
|---|---|
| `lead` | Jeda (detik) sebelum suara mulai di tiap adegan |
| `tail` | Jeda setelah suara selesai sebelum pindah adegan |
| `introExtra` | Tambahan waktu di adegan pertama |
| `outroExtra` | Tambahan waktu di adegan terakhir supaya penutupnya tidak terburu-buru |
| `style` | Gaya musik. `calm` tenang, tanpa ketukan drum |
| `liftAt` | Nomor adegan saat musik mulai sedikit "naik" |

### Komponen siap pakai (`src/ui.tsx`)
| Komponen | Fungsinya | Contoh |
|---|---|---|
| `Headline` | Judul besar, tiap baris muncul pada frame tertentu | `<Headline top={260} lines={[{ text: "Judul", at: 10 }]} />` |
| `Caption` | Subtitle karaoke | `<Caption text={s.sub} from={s.voiceFrom} dur={s.voiceDur} />` |
| `Phone` | Bingkai HP, isinya bebas | `<Phone><AppBar title="Aplikasiku" />...</Phone>` |
| `AppBar` | Bilah atas aplikasi di dalam HP | `<AppBar title="Pengeluaran" />` |
| `Sfx` | Efek suara pada frame tertentu | `<Sfx at={30} src="pop" />` |
| `usePop` | Angka 0→1 yang memantul, untuk animasi muncul | `const p = usePop(15)` |
| `wordAt` | Frame saat kata tertentu diucapkan | `s.voiceFrom + wordAt(s.sub, s.voiceDur, "saldo")` |

Pilihan `src` untuk `Sfx`: `whoosh`, `pop`, `ding`, `boom`, `sparkle`, `tick`, `send`.

Cara termudah belajar: buka `src/scenes/S1Judul.tsx` dan `S2Hp.tsx`, lalu tiru polanya. Trik paling berguna adalah membuat sesuatu muncul **tepat saat kata tertentu diucapkan**:

```tsx
const at = (w: string) => s.voiceFrom + wordAt(s.sub, s.voiceDur, w);
// lalu: <Sfx at={at("tinggal")} src="pop" />
```

---

## 10. Membuat adegan baru

Contoh: menambah adegan ke-4 `s4` berisi testimoni.

**Langkah 1.** Buat `src/scenes/S4Testimoni.tsx`:

```tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene } from "../timeline";
import { C, Caption, Headline, wordAt } from "../ui";

export const S4Testimoni: React.FC<{ s: Scene }> = ({ s }) => {
  const at = (w: string) => s.voiceFrom + wordAt(s.sub, s.voiceDur, w);
  return (
    <AbsoluteFill>
      <Headline top={420} size={88} lines={[
        { text: "Akhir bulan", at: at("akhir") - 6 },
        { text: "masih ada sisa.", at: at("sisa") - 6, color: C.gold },
      ]} />
      <Caption text={s.sub} from={s.voiceFrom} dur={s.voiceDur} />
    </AbsoluteFill>
  );
};
```

**Langkah 2.** Tambahkan kalimatnya di `src/script.json`. Urutan di file ini menentukan urutan adegan.

```json
{ "id": "s4", "say": "Sekarang tiap akhir bulan, masih ada sisa.", "sub": "Sekarang tiap akhir bulan, masih ada sisa." }
```

**Langkah 3.** Daftarkan adegannya di `src/Video.tsx`:

```tsx
import { S4Testimoni } from "./scenes/S4Testimoni";

const VIEWS = { s1: S1Judul, s2: S2Hp, s3: S3Penutup, s4: S4Testimoni };
```

**Langkah 4.** Buat suaranya, perbarui musik, lalu render:

```bash
node scripts/voice.mjs s4
npm run music
npm run render
```

Durasi total video otomatis bertambah. Untuk **menghapus** adegan, hapus barisnya di `script.json` dan di `VIEWS`.

### Mau efek 3D? (opsional)
```bash
npm install @remotion/three @react-three/fiber@8 three
```
Setelah itu pakai `<ThreeCanvas>` dari `@remotion/three` di dalam adegan. Lihat dokumentasi Remotion bagian "Three.js".

---

## 11. Bikin banyak episode

Skrip suara dan musik mendukung `--ep`, jadi beberapa video bisa hidup di satu proyek tanpa saling menimpa:

```
src/episodes/ep01/script.json
src/episodes/ep01/timing.json
```

```bash
node scripts/voice.mjs --ep ep01
node scripts/music.mjs --ep ep01
```

- Suara masuk ke `public/voice/ep01/`.
- Durasinya ke `src/episodes/ep01/voice.json`.
- Musiknya ke `public/audio/ep01-music.wav`.

Setelah itu buat komposisi baru di `src/Root.tsx` yang memakai `<Reel>` dengan `buildScenes(...)` dari file episode tersebut (`voiceDir="voice/ep01"`, `music="audio/ep01-music.wav"`). Contoh polanya ada di `src/Video.tsx` dan `src/timeline.ts`.

Kalau baru mulai, cara paling sederhana adalah satu video dulu sampai jadi, baru coba sistem episode.

---

## 12. Simpan proyekmu di GitHub sendiri

**Kalau pakai Cara A (fork):**

```bash
git add .
git commit -m "Video pertama untuk proyekku"
git push
```

**Kalau pakai Cara B (clone langsung):**
1. Buat repo kosong baru di GitHub, boleh **Private**, tanpa README.
2. Arahkan proyekmu ke repo itu lalu push:

```bash
git remote set-url origin https://github.com/USERNAME-KAMU/NAMA-REPO.git
git push -u origin master
```

**Yang tidak ikut ter-upload (sudah diatur di `.gitignore`):**

| Folder | Isi | Alasan |
|---|---|---|
| `.tts/` | Model suara 5 GB | Terlalu besar |
| `rekaman/` | Rekaman suaramu | Data pribadi |
| `public/voice/`, `public/audio/` | Suara dan musik hasil generate | Bisa dibuat ulang |
| `out/` | Video hasil render | Simpan di Drive kalau perlu |
| `node_modules/` | Paket Node | Dipasang ulang dengan `npm install` |

Jadi di laptop lain cukup: `git clone` → `npm install` → `npm run setup:tts` → salin rekaman ke `rekaman/` → `npm run voice`.

---

## 13. Tips konten supaya ditonton

1. **Satu video, satu masalah.** Jangan tur semua fitur sekaligus.
2. **Masalah dulu, produk belakangan.** Habiskan ± 60% durasi untuk cerita yang bikin penonton berpikir *"iya, aku juga gitu"*. Produkmu baru muncul sebagai jawaban.
3. **3 detik pertama menentukan.** Buka dengan pertanyaan atau gambar yang menohok, bukan logo.
4. **Durasi 20–40 detik.** 3–5 kalimat sudah cukup.
5. **Tutup dengan pertanyaan**, bukan "download sekarang". Misalnya: *"Uangmu biasanya habis di mana? Tulis di komentar."* Komentar lebih berharga daripada view.
6. **Jujur.** Beri tanda "ilustrasi" kalau angka atau nama di layar fiktif, dan jangan mengarang statistik.
7. **Konsisten** lebih penting daripada sering. Misalnya 3 video per minggu di jam yang sama.

**Saat mengunggah:**
- Caption 1–2 kalimat, sama dengan pertanyaan penutup, plus 3–5 tagar yang relevan.
- Cover dari `npm run still`, atau frame terbaik di Studio.
- Balas semua komentar di jam pertama.

---

## 14. Kalau ada masalah

| Gejala | Solusi |
|---|---|
| `python` tidak dikenali | Pasang ulang Python dan centang "Add python.exe to PATH", lalu buka terminal baru. Di Windows bisa coba `py --version`. |
| `Belum dipasang. Jalankan dulu: npm run setup:tts` | Model suara belum terpasang atau gagal di tengah jalan. Jalankan lagi `npm run setup:tts`. |
| Error `No module named 'pkg_resources'` atau soal `perth` | Windows: `.tts\venv\Scripts\python.exe -m pip install "setuptools<81"`. Mac/Linux: `.tts/venv/bin/python -m pip install "setuptools<81"`. |
| `Taruh rekaman suara narator di rekaman/narator.wav` | File rekaman belum ada atau bukan WAV. Lihat [bagian 6](#6-rekam-suaramu). |
| Pembuatan suara lama sekali | Normal di CPU (± 1 menit per kalimat). Buat ulang hanya kalimat yang berubah: `node scripts/voice.mjs s2`. |
| Disk penuh saat setup | Butuh ± 6 GB. Kosongkan ruang, hapus folder `.tts/`, lalu ulangi `npm run setup:tts`. |
| Video jadi tapi **tanpa suara** | `npm run voice` belum dijalankan atau gagal. Cek apakah ada file di `public/voice/`. |
| Suara terpotong atau adegan terlalu cepat | `src/voice.json` tidak cocok dengan file suara. Jalankan lagi `npm run voice`. |
| Musik berhenti sebelum video selesai | Musik dibuat sebelum suara terbaru. Jalankan lagi `npm run music`. |
| Suara tidak mirip | Rekam ulang di tempat lebih sunyi, bicara lebih jelas, dan pastikan 10 detik pertama berisi suara. |
| Ada kata yang diucapkan aneh | Ubah penulisannya di `say`: tulis seperti diucapkan, tambah koma, atau ganti kata. |
| Port Studio sudah terpakai | Tutup Studio lain (`Ctrl + C`), atau buka alamat yang tertulis di terminal. |
| Error setelah mengubah adegan | Baca pesan error di terminal atau Studio. Biasanya salah ketik nama komponen atau lupa `import`. |

---

## 15. Jalan pintas pakai Claude Code

Kalau kamu punya [Claude Code](https://claude.com/claude-code), buka folder proyek lalu minta dengan bahasa biasa. Contoh:

> Ini proyek Remotion untuk video Reels. Aku mau bikin video untuk **[nama produk + penjelasan singkat]**. Masalah yang dialami pengguna: **[masalahnya]**. Tolong:
> 1. tulis naskah 4 kalimat di `src/script.json` (pisahkan `say` dan `sub`),
> 2. ganti warna di `src/ui.tsx` jadi **[warna merek]** dan logo di `public/img/logo.png`,
> 3. sesuaikan adegan di `src/scenes/` dengan produkku,
> 4. lalu jalankan `npm run voice`, `npm run music`, dan `npm run render`.

Claude akan membaca kode di repo ini dan mengubahnya untukmu. Kamu tinggal cek hasilnya di `npm run studio`.

---

Selamat mencoba! Setelah video pertama diunggah, lihat komentar apa yang muncul. Dari situ kamu tahu episode berikutnya mau membahas apa.
