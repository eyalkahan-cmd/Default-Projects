import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, HEEBO, look } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Deep-navy studio cyclorama behind the 3D canvas (the canvas is transparent). */
export const Backdrop: React.FC<{ x?: number; y?: number }> = ({ x = 0.55, y = 0.42 }) => (
  <AbsoluteFill
    style={{
      background: look().bg(x * 100, y * 100),
    }}
  />
);

/** Lens finish on top of everything: vignette + a fine animated film grain. */
export const LensFinish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, ${look().vignette} 100%)` }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: look().grain, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * A technical callout locked to a projected 3D point: a dot on the object, a thin leader
 * that draws out, then an RTL label (title + optional sub-line). No boxes, no giant type.
 */
export const Callout: React.FC<{
  at: { x: number; y: number };
  dx: number;
  dy: number;
  start: number;
  end?: number;
  title: string;
  sub?: string;
  accent?: string;
}> = ({ at, dx, dy, start, end = 1e9, title, sub, accent: accentProp }) => {
  const L = look();
  const accent = accentProp ?? L.accent;
  const frame = useCurrentFrame();
  const draw = easeOut(interpolate(frame, [start, start + 12], [0, 1], clamp));
  const text = easeOut(interpolate(frame, [start + 8, start + 20], [0, 1], clamp));
  const out = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const ex = at.x + dx * draw;
  const ey = at.y + dy * draw;
  const right = dx < 0; // label sits on the far side of the leader
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: out }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <circle cx={at.x} cy={at.y} r={7 * Math.min(1, draw * 3)} fill={accent} />
        <circle cx={at.x} cy={at.y} r={16 * Math.min(1, draw * 3)} fill="none" stroke={accent} strokeOpacity={0.45} strokeWidth={1.5} />
        <line x1={at.x} y1={at.y} x2={ex} y2={ey} stroke={L.leader} strokeWidth={1.6} />
        <line x1={ex} y1={ey} x2={ex + (right ? -26 : 26) * text} y2={ey} stroke={L.leader} strokeWidth={1.6} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: ey,
          ...(right ? { right: 1920 - ex + 40 } : { left: ex + 40 }),
          translate: `0 -50%`,
          direction: "rtl",
          whiteSpace: "nowrap",
          textAlign: right ? "right" : "left",
          fontFamily: HEEBO,
          color: L.text,
          opacity: text,
          filter: `blur(${(1 - text) * 6}px)`,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.1 }}>{title}</div>
        {sub ? <div style={{ fontSize: 26, fontWeight: 400, color: L.sub, marginTop: 6 }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/** Small chapter marker, top-right, RTL: "01 · התקנת המאוורר". Understated, never a giant headline. */
export const Chapter: React.FC<{ n: string; title: string; start: number; end: number }> = ({ n, title, start, end }) => {
  const frame = useCurrentFrame();
  const p = easeOut(interpolate(frame, [start, start + 14], [0, 1], clamp));
  const out = interpolate(frame, [end - 10, end], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        right: 84,
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: HEEBO,
        color: look().text,
        opacity: p * out,
        translate: `${(1 - p) * 30}px 0`,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color: look().accent, letterSpacing: 2 }}>{n}</div>
      <div style={{ width: 46 * p, height: 2, background: look().accent }} />
      <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: 0.5 }}>{title}</div>
    </div>
  );
};
