import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, CAPTIONS, ease, fontFamily, s } from "./theme";

/** Animated gradient backdrop with drifting soft blobs and a dot grid. */
export const Background: React.FC<{ hue?: string; hue2?: string }> = ({
  hue = C.purple,
  hue2 = C.pink,
}) => {
  const frame = useCurrentFrame();
  const blobs = [
    { x: 300, y: 250, r: 520, c: hue, sp: 0.011 },
    { x: 1600, y: 800, r: 620, c: hue2, sp: 0.009 },
    { x: 1500, y: 150, r: 380, c: C.cyan, sp: 0.014 },
  ];
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${C.bgMid} 0%, ${C.bgDeep} 75%)`,
        overflow: "hidden",
      }}
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x + Math.sin(frame * b.sp + i) * 120 - b.r / 2,
            top: b.y + Math.cos(frame * b.sp * 1.3 + i) * 90 - b.r / 2,
            width: b.r,
            height: b.r,
            borderRadius: "50%",
            background: b.c,
            opacity: 0.35,
            filter: "blur(120px)",
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.10) 2px, transparent 2.5px)",
          backgroundSize: "48px 48px",
          backgroundPosition: `${(frame * 0.4) % 48}px ${(frame * 0.25) % 48}px`,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** "Step N" badge that springs in from the right (RTL reading order). */
export const StepBadge: React.FC<{
  n: number;
  title: string;
  color?: string;
  delay?: number;
}> = ({ n, title, color = C.lime, delay = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  const p2 = spring({ frame: frame - delay - 6, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        right: 80,
        display: "flex",
        alignItems: "center",
        gap: 24,
        direction: "rtl",
        fontFamily,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 36,
          background: color,
          color: C.ink,
          fontSize: 64,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(p),
          rotate: `${(1 - p) * -40}deg`,
          boxShadow: `0 16px 40px ${color}66`,
        }}
      >
        {String(n).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 900,
          color: C.white,
          opacity: p2,
          translate: `${(1 - p2) * 80}px 0`,
          textShadow: "0 6px 24px rgba(0,0,0,0.35)",
        }}
      >
        {title}
      </div>
    </div>
  );
};

/** Pill-shaped label. */
export const Chip: React.FC<{
  text: string;
  color?: string;
  textColor?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ text, color = C.yellow, textColor = C.ink, size = 44, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: `${size * 0.32}px ${size * 0.7}px`,
      borderRadius: 999,
      background: color,
      color: textColor,
      fontFamily,
      fontWeight: 700,
      fontSize: size,
      direction: "rtl",
      whiteSpace: "nowrap",
      boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
      ...style,
    }}
  >
    {text}
  </div>
);

/** Springy pop-in wrapper. */
export const Pop: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  damping?: number;
}> = ({ at, children, style, damping = 11 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping } });
  return (
    <div
      style={{
        position: "absolute",
        scale: String(p),
        opacity: Math.min(1, p * 2),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Bottom subtitles synced to narration phrases. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cur = CAPTIONS.find(([a, b]) => t >= a && t < b + 0.15);
  if (!cur) return null;
  const [a] = cur;
  const local = frame - s(a);
  const op = ease(local, [0, 6], [0, 1]);
  const y = ease(local, [0, 10], [18, 0]);
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 54 }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 700,
          fontSize: 44,
          color: C.white,
          direction: "rtl",
          padding: "14px 36px",
          borderRadius: 22,
          background: "rgba(16, 6, 32, 0.62)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.12)",
          opacity: op,
          translate: `0 ${y}px`,
          maxWidth: 1600,
          textAlign: "center",
        }}
      >
        {cur[2]}
      </div>
    </AbsoluteFill>
  );
};

/** Diagonal two-tone band that sweeps right→left, covering the cut at `at`. */
export const Wipe: React.FC<{ at: number; c1?: string; c2?: string }> = ({
  at,
  c1 = C.lime,
  c2 = C.pink,
}) => {
  const frame = useCurrentFrame();
  const band = (color: string, lag: number) => {
    const x = interpolate(frame, [at - 9 + lag, at + 9 + lag], [2000, -2700], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          position: "absolute",
          top: -100,
          left: x,
          width: 2700,
          height: 1280,
          background: color,
          transform: "skewX(-16deg)",
        }}
      />
    );
  };
  if (frame < at - 12 || frame > at + 14) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {band(c1, -2)}
      {band(c2, 1)}
    </AbsoluteFill>
  );
};

/** Burst of confetti starting at frame `at`. */
export const Confetti: React.FC<{ at: number; count?: number; cx?: number; cy?: number }> = ({
  at,
  count = 90,
  cx = 960,
  cy = 540,
}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0) return null;
  const colors = [C.lime, C.yellow, C.pink, C.cyan, C.white, C.purple];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const v = 14 + random(`v${i}`) * 26;
        const x = cx + Math.cos(ang) * v * f * 0.9;
        const y = cy + Math.sin(ang) * v * f * 0.9 + 0.55 * f * f;
        const rot = f * (6 + random(`r${i}`) * 14);
        const size = 12 + random(`s${i}`) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size * 0.5,
              borderRadius: 3,
              background: colors[i % colors.length],
              rotate: `${rot}deg`,
              opacity: interpolate(f, [40, 70], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Expanding ring pulse used to highlight a point. */
export const Pulse: React.FC<{
  x: number;
  y: number;
  at: number;
  color?: string;
  size?: number;
}> = ({ x, y, at, color = C.lime, size = 140 }) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0) return null;
  return (
    <>
      {[0, 12].map((d) => {
        const ff = (f - d + 1000) % 36;
        if (f - d < 0) return null;
        const sc = interpolate(ff, [0, 36], [0.3, 1.4]);
        const op = interpolate(ff, [0, 36], [0.9, 0]);
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `6px solid ${color}`,
              scale: String(sc),
              opacity: op,
            }}
          />
        );
      })}
    </>
  );
};
