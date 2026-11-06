import React from "react";
import { Bg } from "./Bg";
import { Reel } from "./Reel";
import { S1Judul } from "./scenes/S1Judul";
import { S2Hp } from "./scenes/S2Hp";
import { S3Penutup } from "./scenes/S3Penutup";
import { SCENES } from "./timeline";

// id di src/script.json → komponen adegannya. Tambah adegan: buat file di scenes/, daftarkan di sini.
const VIEWS = { s1: S1Judul, s2: S2Hp, s3: S3Penutup };

export const Video: React.FC = () => <Reel scenes={SCENES} views={VIEWS} voiceDir="voice" music="audio/music.wav" bg={<Bg />} />;
