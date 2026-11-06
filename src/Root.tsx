import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, TOTAL } from "./timeline";

// Format Reels/Shorts/TikTok: 1080×1920, 30 fps. Durasi mengikuti panjang suara.
export const RemotionRoot: React.FC = () => (
  <Composition id="Video" component={Video} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
