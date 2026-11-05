import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";

const fontFamily = "Heebo";
loadFont({ family: fontFamily, url: staticFile("heebo-hebrew.woff2"), weight: "100 900", unicodeRange: "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F" });
loadFont({ family: fontFamily, url: staticFile("heebo-latin.woff2"), weight: "100 900", unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" });

const FPS = 30;
const W = 1080;
const H = 1920;
const YELLOW = "#FFD60A";
const RED = "#E63946";

// ---------- Timeline (frames @30fps) ----------
const HOOK_END = 54; // hook: two photos
const ZOOM_END = 66; // photo 1 flies to full screen
// Time remap of the AI transition clip: speed (x realtime) per output frame,
// with eased (smootherstep) ramps instead of hard speed cuts.
const SRC_FPS = 24;
const SRC_FRAMES = 193;
const smoother = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const RAMP_OUT = [196, 246]; // slow-mo -> realtime, eased in/out
const speedAt = (f: number) => {
  if (f < 136) return 1.25; // riding to the ramp
  if (f < RAMP_OUT[0]) return 0.5; // takeoff + flip in slow-mo (DROP)
  if (f < RAMP_OUT[1]) return 0.5 + 0.5 * smoother((f - RAMP_OUT[0]) / (RAMP_OUT[1] - RAMP_OUT[0]));
  if (f < 276) return 1.0; // freefall morphs into the tunnel
  if (f < 306) return 1.0 - 0.25 * smoother((f - 276) / 30); // settle into the tunnel
  return 0.75;
};
const VIDEO_START = 66;
const VIDEO_END = 348;
// source time (seconds) for every output frame of the clip
const SRC_TIME: number[] = [];
{
  let t = 0;
  for (let f = VIDEO_START; f < VIDEO_END; f++) {
    SRC_TIME[f] = Math.min(t, (SRC_FRAMES - 1) / SRC_FPS);
    t += speedAt(f) / FPS;
  }
}
const DROP = 136;
const REVEAL = 260;
const END = 438;
const WIND_IN = 178; // freefall wind: from the freefall shot ("צניחה חופשית...") until FlyBox
const BIKE_IN = 90; // riding sound starts once he is actually riding (3s)
// Music: the first bass kick of the drop (70.47s in the track) lands exactly on the
// takeoff from the ramp lip (source frame ~68.6 -> output frame ~135.3)
const TAKEOFF_FRAME = 135.3;

// Music versions. kickSec = the first bass kick of the drop in the track; it is placed on the takeoff.
export type MusicProps = { music: string; kickSec: number; bpm: number; volume: number };
export const MUSIC_V1: MusicProps = { music: "music.mp3", kickSec: 70.47, bpm: 150, volume: 0.9 }; // OLLiGAN - Get Up (Gear Up)
export const MUSIC_V2: MusicProps = { music: "music2.mp3", kickSec: 41.82, bpm: 93, volume: 0.9 }; // Korshun - Own the Moment

const textStyle: React.CSSProperties = {
  fontFamily,
  fontWeight: 900,
  color: "white",
  direction: "rtl",
  textAlign: "center",
  lineHeight: 1.05,
  textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 0 40px rgba(0,0,0,0.55)",
};

const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 180, mass: 0.6 } });

// ---------- Hook ----------
const CARD_W = 460;
const CARD_H = Math.round((CARD_W * 1672) / 941);
const CARD1 = { x: W / 2 + 14, y: 545, rot: 6 }; // right side (RTL: first)
const CARD2 = { x: W / 2 - CARD_W - 14, y: 580, rot: -6 };

const PhotoCard: React.FC<{
  src: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  scale: number;
  opacity?: number;
  radius: number;
  border: number;
  labelOpacity: number;
}> = ({ src, label, x, y, w, h, rot, scale, opacity = 1, radius, border, labelOpacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      transform: `rotate(${rot}deg) scale(${scale})`,
      opacity,
      borderRadius: radius,
      border: `${border}px solid white`,
      boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      overflow: "hidden",
      background: "#111",
    }}
  >
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <div
      style={{
        ...textStyle,
        position: "absolute",
        bottom: 22,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: labelOpacity,
      }}
    >
      <span
        style={{
          background: YELLOW,
          color: "#111",
          textShadow: "none",
          fontSize: 46,
          padding: "6px 26px",
          borderRadius: 999,
        }}
      >
        {label}
      </span>
    </div>
  </div>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = pop(frame, fps, 2);
  const c2 = pop(frame, fps, 10);
  const title = pop(frame, fps, 0);
  const sub = pop(frame, fps, 22);
  const arrow = interpolate(frame, [16, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // zoom transition: card 1 becomes the full frame
  const z = interpolate(frame, [HOOK_END, ZOOM_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const fadeOut = 1 - z;
  const lerp = (a: number, b: number) => a + (b - a) * z;

  const card1Scale = interpolate(c1, [0, 1], [1.8, 1]);
  const card2Scale = interpolate(c2, [0, 1], [1.8, 1]);
  const wiggle = Math.sin(frame / 5) * 1.2;

  return (
    <AbsoluteFill style={{ background: "#0b0b0f" }}>
      {/* blurred backdrop */}
      <AbsoluteFill style={{ opacity: 0.45 * fadeOut }}>
        <Img
          src={staticFile("photo2.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.6)" }}
        />
      </AbsoluteFill>

      <div
        style={{
          ...textStyle,
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          fontSize: 124,
          transform: `scale(${interpolate(title, [0, 1], [2.2, 1])})`,
          opacity: Math.min(1, title * 2) * fadeOut,
        }}
      >
        רק <span style={{ color: YELLOW }}>2</span> תמונות.
      </div>

      <PhotoCard
        src={staticFile("photo2.jpg")}
        label="תמונה 2"
        x={CARD2.x}
        y={CARD2.y}
        w={CARD_W}
        h={CARD_H}
        rot={CARD2.rot - wiggle}
        scale={card2Scale}
        opacity={Math.min(1, c2 * 3) * fadeOut}
        radius={28}
        border={8}
        labelOpacity={1}
      />

      {/* arrow from photo 1 (right) to photo 2 (left) */}
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, opacity: fadeOut }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 740 522 Q 540 432 340 522"
          stroke={YELLOW}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={600}
          strokeDashoffset={600 * (1 - arrow)}
          filter="url(#glow)"
        />
        <path
          d="M 346 478 L 336 524 L 384 528"
          stroke={YELLOW}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={arrow > 0.95 ? 1 : 0}
          filter="url(#glow)"
        />
        <text
          x={540}
          y={448}
          fill={YELLOW}
          fontFamily={fontFamily}
          fontWeight={900}
          fontSize={52}
          textAnchor="middle"
          opacity={arrow}
          style={{ filter: "url(#glow)" }}
        >
          {""}
        </text>
      </svg>

      <PhotoCard
        src={staticFile("photo1.jpg")}
        label="תמונה 1"
        x={lerp(CARD1.x, 0)}
        y={lerp(CARD1.y, 0)}
        w={lerp(CARD_W, W)}
        h={lerp(CARD_H, H)}
        rot={lerp(CARD1.rot + wiggle, 0)}
        scale={lerp(card1Scale, 1)}
        opacity={Math.min(1, c1 * 3)}
        radius={lerp(28, 0)}
        border={lerp(8, 0)}
        labelOpacity={fadeOut}
      />

      <div
        style={{
          ...textStyle,
          position: "absolute",
          top: 1470,
          left: 20,
          right: 20,
          fontSize: 76,
          transform: `translateY(${interpolate(sub, [0, 1], [60, 0])}px)`,
          opacity: Math.min(1, sub * 2) * fadeOut,
        }}
      >
        תראו איזה <span style={{ color: YELLOW }}>מעבר גדילה</span> יצרנו
      </div>
    </AbsoluteFill>
  );
};

// ---------- Transition video with speed ramps ----------
const impact = (frame: number, at: number, len = 14) =>
  interpolate(frame, [at, at + len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
  (frame >= at ? 1 : 0);

const TransitionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = Math.max(impact(frame, DROP), impact(frame, REVEAL));
  const shakeX = Math.sin(frame * 2.7) * 22 * hit;
  const shakeY = Math.cos(frame * 3.3) * 22 * hit;
  const punch = 1 + 0.14 * hit;
  // slow push-in during the slow-mo
  const push = interpolate(frame, [DROP, RAMP_OUT[0], RAMP_OUT[1]], [1, 1.07, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const visible = frame >= VIDEO_START && frame < VIDEO_END;
  const srcPos = visible ? SRC_TIME[frame] * SRC_FPS : 0;
  const f0 = Math.floor(srcPos);
  const f1 = Math.min(SRC_FRAMES - 1, f0 + 1);
  const frameSrc = (n: number) => staticFile(`frames/f${String(n).padStart(3, "0")}.jpg`);
  const imgStyle: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", objectFit: "cover" };
  if (!visible) return null;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${punch * push})`,
      }}
    >
      <Img src={frameSrc(Math.round(srcPos) > f0 ? f1 : f0)} style={imgStyle} />
    </AbsoluteFill>
  );
};

// ---------- Overlays ----------
const ProgressStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [VIDEO_START, VIDEO_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const appear = pop(frame, fps, VIDEO_START);
  const done = pop(frame, fps, REVEAL);
  const R = 62;
  const xStart = W - 110; // photo 1 on the right (RTL)
  const xEnd = 110;
  const y = 170;
  const dotX = xStart - R - 80 + (xEnd - xStart + 2 * R + 160) * p;

  const thumb = (src: string, x: number, highlight: number, label: string) => (
    <div
      style={{
        position: "absolute",
        left: x - R,
        top: y - R,
        width: R * 2,
        height: R * 2,
        borderRadius: "50%",
        overflow: "visible",
        transform: `scale(${1 + 0.18 * highlight})`,
      }}
    >
      <Img
        src={src}
        style={{
          width: R * 2,
          height: R * 2,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "50% 25%",
          border: `6px solid ${highlight > 0.5 ? YELLOW : "white"}`,
          boxShadow: highlight > 0.5 ? `0 0 30px ${YELLOW}` : "0 6px 20px rgba(0,0,0,0.5)",
        }}
      />
      <div
        style={{
          ...textStyle,
          position: "absolute",
          top: R * 2 + 6,
          left: -40,
          right: -40,
          fontSize: 32,
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: appear, transform: `translateY(${(1 - appear) * -80}px)` }}>
      <div
        style={{
          position: "absolute",
          left: xEnd,
          width: xStart - xEnd,
          top: y - 5,
          height: 10,
          borderRadius: 10,
          background: "rgba(255,255,255,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: dotX,
          width: xStart - dotX,
          top: y - 5,
          height: 10,
          borderRadius: 10,
          background: YELLOW,
          boxShadow: `0 0 24px ${YELLOW}`,
        }}
      />
      <div
        style={{
          ...textStyle,
          position: "absolute",
          left: dotX - 70,
          top: y - 40,
          width: 140,
          height: 80,
          borderRadius: 40,
          background: "#111",
          border: `5px solid ${YELLOW}`,
          fontSize: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "ltr",
          color: YELLOW,
          textShadow: "none",
        }}
      >
        AI
      </div>
      {thumb(staticFile("photo1.jpg"), xStart, frame < VIDEO_START + 20 ? 1 : 0, "תמונה 1")}
      {thumb(staticFile("photo2.jpg"), xEnd, done, "תמונה 2")}
    </AbsoluteFill>
  );
};

const CAPTIONS: { from: number; to: number; text: React.ReactNode; size?: number; color?: string }[] = [
  { from: 70, to: 136, text: "מתחיל באופניים..." },
  { from: 136, to: 182, text: "קפיצה", size: 190, color: YELLOW },
  { from: 182, to: 226, text: "צניחה חופשית..." },
  { from: 226, to: REVEAL, text: "רגע..." },
  { from: REVEAL, to: VIDEO_END, text: <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>FlyBox!</span>, size: 180, color: YELLOW },
];

const Caption: React.FC<{ text: React.ReactNode; size?: number; color?: string; dur: number }> = ({
  text,
  size = 104,
  color = "white",
  dur,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps);
  const out = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        ...textStyle,
        position: "absolute",
        top: 1130,
        left: 30,
        right: 30,
        fontSize: size,
        color,
        WebkitTextStroke: "4px rgba(0,0,0,0.85)",
        paintOrder: "stroke fill",
        transform: `scale(${interpolate(s, [0, 1], [1.7, 1])}) rotate(${interpolate(s, [0, 1], [-6, 0])}deg)`,
        opacity: Math.min(1, s * 2) * out,
      }}
    >
      {text}
    </div>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const f = Math.max(impact(frame, DROP, 8), impact(frame, REVEAL, 10), impact(frame, VIDEO_END, 8));
  return <AbsoluteFill style={{ background: "white", opacity: f * 0.9 }} />;
};

// ---------- End card: before / after slider ----------
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // divider position (x of the seam). Photo 2 is revealed on the left of the seam.
  const seam = interpolate(frame, [0, 22, 40, 58], [W, 0, W * 0.75, W / 2], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const t1 = pop(frame, fps, 6);
  const t2 = pop(frame, fps, 16);
  const t3 = pop(frame, fps, 24);
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Img src={staticFile("photo1.jpg")} style={{ width: W, height: H, objectFit: "cover", position: "absolute" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: seam, height: H, overflow: "hidden" }}>
        <Img src={staticFile("photo2.jpg")} style={{ width: W, height: H, objectFit: "cover" }} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.7) 100%)" }} />
      <div
        style={{
          position: "absolute",
          left: seam - 5,
          top: 0,
          width: 10,
          height: H,
          background: "white",
          boxShadow: `0 0 30px ${YELLOW}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: seam - 60,
          top: H / 2 - 60,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: YELLOW,
          border: "6px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 44,
          color: "#111",
        }}
      >
        AI
      </div>
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            transform: `scale(${interpolate(t1, [0, 1], [1.6, 1])}) rotate(-2deg)`,
            opacity: Math.min(1, t1 * 2),
            boxShadow: "0 16px 44px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontFamily,
              fontWeight: 900,
              fontSize: 120,
              lineHeight: 1.1,
              color: "#111",
              background: YELLOW,
              padding: "6px 40px 14px",
              direction: "rtl",
            }}
          >
            סרטון גדילה <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>AI</span>
          </div>
          {/* light sheen sweeping across */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 160,
              left: `${interpolate(frame, [22, 42], [-25, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
              background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
              transform: "skewX(-18deg)",
            }}
          />
        </div>
        {[
          { d: t2, el: <>בהתאמה אישית</> },
          { d: t3, el: <>עם מעברים <span style={{ color: YELLOW }}>מושלמים!</span></> },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              ...textStyle,
              fontSize: 94,
              marginTop: i === 0 ? 30 : 4,
              WebkitTextStroke: "3px rgba(0,0,0,0.6)",
              paintOrder: "stroke fill",
              textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 0 50px rgba(0,0,0,0.85)",
              transform: `translateY(${interpolate(l.d, [0, 1], [70, 0])}px)`,
              opacity: Math.min(1, l.d * 2),
            }}
          >
            {l.el}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Persistent overlays (whole video) ----------
const GrowthBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 6);
  return (
    <div
      style={{
        position: "absolute",
        top: 292,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, s * 2),
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
      }}
    >
      <div
        style={{
          ...textStyle,
          fontSize: 54,
          fontWeight: 900,
          textShadow: "none",
          background: "rgba(10,10,15,0.85)",
          border: "4px solid white",
          borderRadius: 999,
          padding: "10px 42px 12px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: RED, boxShadow: `0 0 12px ${RED}`, opacity: Math.floor(frame / 15) % 2 ? 0.35 : 1 }} />
        קטע מעבר מתוך <span style={{ color: YELLOW }}>סרטון גדילה</span>
      </div>
    </div>
  );
};

const CTA: React.FC<{ bpm: number }> = ({ bpm }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, DROP); // CTA lands on the music drop
  const endBoost = pop(frame, fps, VIDEO_END + 20);
  const beat = 1 + 0.035 * Math.max(0, Math.sin((frame / fps) * Math.PI * (bpm / 60))); // tempo-matched pulse
  return (
    <div
      style={{
        position: "absolute",
        top: 1420,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, s * 2),
        transform: `translateY(${interpolate(s, [0, 1], [120, 0])}px) scale(${1 + 0.12 * endBoost})`,
      }}
    >
      <div
        style={{
          ...textStyle,
          textShadow: "none",
          background: "rgba(10,10,15,0.82)",
          border: `4px solid ${YELLOW}`,
          borderRadius: 36,
          padding: "16px 50px 20px",
          boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 ${20 + 20 * endBoost}px rgba(255,214,10,0.45)`,
        }}
      >
        <div style={{ fontSize: 54, fontWeight: 900 }}>רוצים סרטון גדילה? פרטים באתר:</div>
        <div
          style={{
            fontSize: 92,
            color: YELLOW,
            direction: "ltr",
            transform: `scale(${beat})`,
          }}
        >
          OneStory.co.il
        </div>
      </div>
    </div>
  );
};

// ---------- Main ----------
export const Reel: React.FC<MusicProps> = ({ music, kickSec, bpm, volume }) => {
  const frame = useCurrentFrame();
  const musicStartSec = kickSec - TAKEOFF_FRAME / FPS;
  const musicVol = (f: number) =>
    interpolate(f, [0, 6, END - 18, END], [0, volume, volume, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <TransitionVideo />
      <Sequence durationInFrames={ZOOM_END}>
        <Hook />
      </Sequence>
      {frame >= VIDEO_START && frame < VIDEO_END ? <ProgressStrip /> : null}
      {CAPTIONS.map((c) => (
        <Sequence key={c.from} from={c.from} durationInFrames={c.to - c.from}>
          <Caption text={c.text} size={c.size} color={c.color} dur={c.to - c.from} />
        </Sequence>
      ))}
      <Sequence from={VIDEO_END} durationInFrames={END - VIDEO_END}>
        <EndCard />
      </Sequence>
      <Flash />
      {frame < VIDEO_END ? <GrowthBadge /> : null}
      <CTA bpm={bpm} />

      {/* audio */}
      <Audio src={staticFile(music)} trimBefore={Math.round(musicStartSec * FPS)} volume={musicVol} />
      <Sequence from={2} durationInFrames={15}><Audio src={staticFile("snap.wav")} volume={0.7} /></Sequence>
      <Sequence from={10} durationInFrames={15}><Audio src={staticFile("snap.wav")} volume={0.7} /></Sequence>
      <Sequence from={HOOK_END - 8} durationInFrames={20}><Audio src={staticFile("whoosh.wav")} volume={0.8} /></Sequence>
      {/* off-road riding: builds under the music from the first pedal stroke to the takeoff */}
      <Sequence from={BIKE_IN} durationInFrames={DROP - BIKE_IN + 6}>
        <Audio
          src={staticFile("bike.wav")}
          volume={(f) =>
            interpolate(f, [0, 8, DROP - BIKE_IN - 6, DROP - BIKE_IN + 2, DROP - BIKE_IN + 6], [0, 0.32, 0.5, 0.5, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>
      {/* freefall wind: eases in with the freefall shot, eases out just before the FlyBox reveal */}
      <Sequence from={WIND_IN} durationInFrames={REVEAL - WIND_IN}>
        <Audio
          src={staticFile("wind.wav")}
          volume={(f) =>
            interpolate(f, [0, 16, REVEAL - WIND_IN - 26, REVEAL - WIND_IN - 2], [0, 0.55, 0.55, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.sin),
            })
          }
        />
      </Sequence>
      <Sequence from={DROP - 42} durationInFrames={44}><Audio src={staticFile("riser.wav")} volume={0.45} /></Sequence>
      <Sequence from={DROP} durationInFrames={54}><Audio src={staticFile("boom.wav")} volume={0.9} /></Sequence>
      <Sequence from={REVEAL - 10} durationInFrames={20}><Audio src={staticFile("whoosh.wav")} volume={0.7} /></Sequence>
      <Sequence from={REVEAL} durationInFrames={54}><Audio src={staticFile("boom.wav")} volume={0.8} /></Sequence>
      <Sequence from={VIDEO_END - 10} durationInFrames={20}><Audio src={staticFile("whoosh.wav")} volume={0.8} /></Sequence>
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="TransitionReel"
        component={Reel}
        defaultProps={MUSIC_V1}
        durationInFrames={END}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="TransitionReelV2"
        component={Reel}
        defaultProps={MUSIC_V2}
        durationInFrames={END}
        fps={FPS}
        width={W}
        height={H}
      />
    </>
  );
};
