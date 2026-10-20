import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, HEEBO } from "../theme";
import { clamp, EASE_OUT, pop, rand } from "./anim";

/** Deep navy brand backdrop with a soft spotlight and drifting bokeh. */
export const BrandBg: React.FC<{ tint?: string; spot?: { x: number; y: number } }> = ({
  tint = C.navy,
  spot = { x: 0.5, y: 0.45 },
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${spot.x * 100}% ${spot.y * 100}%, ${tint} 0%, ${C.navyDark} 45%, ${C.navyDeep} 100%)`,
      }}
    >
      {new Array(18).fill(0).map((_, i) => {
        const x = rand(i) * 1920;
        const y = (rand(i + 50) * 1200 - frame * (0.2 + rand(i + 9) * 0.5)) % 1200;
        const r = 20 + rand(i + 3) * 90;
        const col = [C.yellow, C.pink, C.blue][i % 3];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < -100 ? y + 1200 : y,
              width: r,
              height: r,
              borderRadius: "50%",
              background: col,
              opacity: 0.07 + rand(i + 20) * 0.08,
              filter: "blur(18px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Kinetic RTL headline: words pop in one by one (right to left). */
export const Headline: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  stroke?: string;
  stagger?: number;
  highlight?: string[];
  style?: React.CSSProperties;
}> = ({ text, start, size = 120, color = C.white, stroke = C.navyDeep, stagger = 4, highlight = [], style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const isHebrew = /[֐-׿]/.test(text);
  return (
    <div
      style={{
        direction: isHebrew ? "rtl" : "ltr",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${size * 0.28}px`,
        fontFamily: HEEBO,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = pop(frame, fps, start + i * stagger, 10);
        const hl = highlight.includes(w);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: hl ? C.yellow : color,
              WebkitTextStroke: `${Math.max(2, size / 28)}px ${stroke}`,
              paintOrder: "stroke fill",
              textShadow: `0 ${size / 14}px 0 ${C.navyDeep}, 0 ${size / 8}px ${size / 4}px rgba(0,0,0,0.35)`,
              opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
              scale: `${interpolate(p, [0, 1], [0.3, 1])}`,
              translate: `0px ${interpolate(p, [0, 1], [size * 0.6, 0])}px`,
              rotate: `${interpolate(p, [0, 1], [i % 2 ? 8 : -8, 0])}deg`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Step badge (top-right, RTL): number disc + title. */
export const StepBadge: React.FC<{ n?: number; title: string; start: number; end: number }> = ({
  n,
  title,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, start, 14);
  const out = interpolate(frame, [end - 8, end], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 80,
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "16px 40px 16px 20px",
        borderRadius: 999,
        background: C.yellow,
        boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
        fontFamily: HEEBO,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - out),
        translate: `${interpolate(p, [0, 1], [260, 0]) + out * 200}px 0px`,
      }}
    >
      {n !== undefined ? (
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: C.navy,
            color: C.yellow,
            fontSize: 48,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </div>
      ) : null}
      <div style={{ color: C.navyDeep, fontSize: 50, fontWeight: 900 }}>{title}</div>
    </div>
  );
};

/** Label chip with a pointer line (RTL). */
export const Callout: React.FC<{
  text: string;
  x: number;
  y: number;
  start: number;
  end?: number;
  color?: string;
  textColor?: string;
  size?: number;
}> = ({ text, x, y, start, end = 1e9, color = C.white, textColor = C.navyDeep, size = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, start, 13);
  const out = interpolate(frame, [end - 6, end], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        direction: "rtl",
        padding: `${size * 0.3}px ${size * 0.7}px`,
        borderRadius: size,
        background: color,
        color: textColor,
        fontFamily: HEEBO,
        fontWeight: 800,
        fontSize: size,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - out),
        scale: `${interpolate(p, [0, 1], [0.6, 1]) * (1 - out * 0.3)}`,
      }}
    >
      {text}
    </div>
  );
};

/** Animated check mark in a circle. */
export const Check: React.FC<{ size: number; start: number; color?: string; style?: React.CSSProperties }> = ({
  size,
  start,
  color = C.green,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, start, 12);
  const draw = interpolate(frame, [start + 4, start + 16], [0, 1], { ...clamp, easing: EASE_OUT });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ scale: `${p}`, ...style }}>
      <circle cx={50} cy={50} r={46} fill={color} />
      <path
        d="M 28 52 L 44 67 L 73 36"
        fill="none"
        stroke="#fff"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={70}
        strokeDashoffset={70 * (1 - draw)}
      />
    </svg>
  );
};

/** Bottom subtitle line for the narration (always readable, never the main visual language). */
export const CaptionBar: React.FC<{ text: string; start: number; end: number }> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [start, start + 5, end - 4, end], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 46,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          direction: "rtl",
          maxWidth: 1500,
          padding: "12px 34px",
          borderRadius: 18,
          background: "rgba(3,27,78,0.72)",
          color: C.white,
          fontFamily: HEEBO,
          fontWeight: 500,
          fontSize: 40,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Confetti burst / rain in brand colors. */
export const Confetti: React.FC<{ start: number; count?: number; seed?: number }> = ({
  start,
  count = 90,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const s = seed * 1000 + i;
        const vx = (rand(s) - 0.5) * 34;
        const vy = -18 - rand(s + 1) * 26;
        const g = 0.9;
        const x = 960 + vx * t;
        const y = 640 + vy * t + 0.5 * g * t * t;
        const col = [C.yellow, C.pink, C.blue, C.white, C.fan][i % 5];
        const w = 12 + rand(s + 2) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: w * 0.45,
              background: col,
              borderRadius: 3,
              rotate: `${t * (8 + rand(s + 3) * 20) * (i % 2 ? 1 : -1)}deg`,
              opacity: interpolate(t, [0, 3, 70, 90], [0, 1, 1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Quick skewed color-band wipe used to cover hard cuts (centered on `at`). */
export const BandWipe: React.FC<{ at: number; color?: string; color2?: string; dir?: 1 | -1 }> = ({
  at,
  color = C.yellow,
  color2 = C.pink,
  dir = -1,
}) => {
  const frame = useCurrentFrame();
  const t = frame - (at - 9);
  if (t < 0 || t > 20) return null;
  // Linear travel so the main band fully covers the frame exactly at `at` (t = 9).
  const x = interpolate(t, [0, 18], dir === -1 ? [2200, -2900] : [-2900, 2200], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: -300, bottom: -300, left: x - 520, width: 640, background: color2, transform: "skewX(-18deg)" }} />
      <div style={{ position: "absolute", top: -300, bottom: -300, left: x, width: 2700, background: color, transform: "skewX(-18deg)" }} />
      <div style={{ position: "absolute", top: -300, bottom: -300, left: x + 2580, width: 640, background: color2, transform: "skewX(-18deg)" }} />
    </AbsoluteFill>
  );
};
