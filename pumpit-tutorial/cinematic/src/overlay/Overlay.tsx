import React from "react";
import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import { useFilmFrame, useFrame } from "../film/time";
import { GLASS, puff } from "../film/motion";
import { HEEBO, look } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Studio cyclorama behind the 3D canvas (the canvas is transparent). In the daylight look it is
 * alive: the soft key of the radial gradient drifts slowly, and its tint breathes between the
 * brand's light blue, sky and a warm orange (interpolateColors on the film clock, ~24 s cycle),
 * continuous across cuts.
 */
export const Backdrop: React.FC<{ x?: number; y?: number }> = ({ x = 0.55, y = 0.42 }) => {
  const L = look();
  const f = useFilmFrame();
  if (L.id !== "daylight") return <AbsoluteFill style={{ background: L.bg(x * 100, y * 100) }} />;
  const T = f / 30;
  const cx = x * 100 + Math.sin(T * 0.21) * 6;
  const cy = y * 100 + Math.cos(T * 0.17) * 4;
  const ph = (Math.sin((T / 24) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const stops = [0, 0.5, 1];
  const inner = interpolateColors(ph, stops, ["#ffffff", "#f6fcff", "#fffaf3"]);
  const mid = interpolateColors(ph, stops, ["#eaf2fc", "#e2f3fc", "#f8eee3"]);
  const outer = interpolateColors(ph, stops, ["#cbdcf1", "#c6e3f4", "#ead8c6"]);
  // a faint second light (warm orange ↔ brand blue) wandering on the opposite side
  const gx = 100 - cx + Math.sin(T * 0.13) * 10;
  const gy = 70 + Math.sin(T * 0.11) * 8;
  const glow = interpolateColors(ph, stops, ["rgba(16,153,234,0.10)", "rgba(120,200,255,0.10)", "rgba(255,150,60,0.10)"]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 45% 50% at ${gx}% ${gy}%, ${glow} 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 80% 90% at ${cx}% ${cy}%, ${inner} 0%, ${mid} 40%, ${outer} 100%)`,
      }}
    />
  );
};

/** Lens finish on top of everything: vignette + a fine animated film grain. */
export const LensFinish: React.FC = () => {
  const frame = useFrame();
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
 * that draws out, then an RTL label (title + optional sub-line) on a soft plate with an accent edge.
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
  const frame = useFrame();
  const draw = Math.min(1, puff(frame, start));
  const text = Math.min(1, puff(frame, start + 8));
  const out = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const ex = at.x + dx * draw;
  const ey = at.y + dy * draw;
  const right = dx < 0; // label sits on the far side of the leader
  // keep the plate inside a 60 px safe area (width estimated from Heebo 800/500 metrics)
  const SAFE = 60;
  const w = Math.max(title.length * 36, (sub ?? "").length * 19) + 70; // Rubik metrics
  const offRight = Math.min(1920 - ex + 30, 1920 - SAFE - w);
  const offLeft = Math.min(ex + 30, 1920 - SAFE - w);
  // vertical: keep the plate centre clear of the top edge and the chapter pill row
  const top = Math.min(Math.max(ey, SAFE + 120), 1080 - SAFE - 70);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: out }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <circle cx={at.x} cy={at.y} r={9 * Math.min(1, draw * 3)} fill={accent} stroke={L.plate} strokeWidth={2} />
        <circle cx={at.x} cy={at.y} r={20 * Math.min(1, draw * 3)} fill="none" stroke={accent} strokeOpacity={0.55} strokeWidth={2} />
        <line x1={at.x} y1={at.y} x2={ex} y2={ey} stroke={L.leader} strokeWidth={2.4} />
        <line x1={ex} y1={ey} x2={ex + (right ? -26 : 26) * text} y2={ey} stroke={L.leader} strokeWidth={2.4} />
      </svg>
      <div
        style={{
          position: "absolute",
          top,
          ...(right ? { right: Math.max(SAFE, offRight) } : { left: Math.max(SAFE, offLeft) }),
          direction: "rtl",
          whiteSpace: "nowrap",
          textAlign: right ? "right" : "left",
          fontFamily: HEEBO,
          color: L.text,
          opacity: Math.min(1, text * 2),
          translate: "0 -50%",
          transform: `scale(${puff(frame, start + 8)})`,
          transformOrigin: right ? "100% 50%" : "0% 50%",
          ...GLASS,
          // accent edge on the reading-start side (right, RTL), drawn as an inset shadow so the glass border stays uniform
          boxShadow: `${GLASS.boxShadow}, inset -5px 0 0 ${accent}`,
          borderRadius: 22,
          padding: "14px 30px 16px 28px",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 0.2, lineHeight: 1.05 }}>{title}</div>
        {sub ? <div style={{ fontSize: 32, fontWeight: 500, color: L.sub, marginTop: 6, lineHeight: 1.15 }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/** Chapter marker, top-right, RTL: "01 · התקנת המאוורר", on a soft pill. Clear but never a giant headline. */
export const Chapter: React.FC<{ n: string; title: string; start: number; end: number }> = ({ n, title, start, end }) => {
  const frame = useFrame();
  const p = easeOut(interpolate(frame, [start, start + 14], [0, 1], clamp));
  const out = interpolate(frame, [end - 10, end], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        right: 72,
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        gap: 18,
        background: look().plate,
        boxShadow: look().plateShadow,
        borderRadius: 40,
        padding: "12px 28px",
        fontFamily: HEEBO,
        color: look().text,
        opacity: p * out,
        translate: `${(1 - p) * 30}px 0`,
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 800, color: look().accent, letterSpacing: 2 }}>{n}</div>
      <div style={{ width: 46 * p, height: 2, background: look().accent }} />
      <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 0.5 }}>{title}</div>
    </div>
  );
};
