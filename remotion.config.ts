import { Config } from "@remotion/cli/config";

// Kalau nanti memakai model 3D (@remotion/three), WebGL butuh renderer ini
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
