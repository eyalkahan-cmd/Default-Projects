import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { C, HEEBO, look } from "../theme";
import { CamKey, CamState, makeRig } from "../three/rig";
import { useFrame } from "./time";

/**
 * "Inflatable" motion language for the film: things don't fade in, they puff up — a quick
 * overshoot and a soft settle, like air filling nylon. Fun and rhythmic, still clean.
 */
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const FPS = 30;
/** one beat of the 124 BPM underscore in frames (14.52) */
export const BEAT = (60 / 124) * FPS;

/** puff-in scale 0 → ~1.08 → 1 starting at `start` */
export const puff = (frame: number, start: number, stiffness = 170) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 9, mass: 0.55, stiffness } });
/** puff-out 1 → 0 ending at `end` (quick deflate) */
export const deflateOut = (frame: number, end: number, len = 7) =>
  interpolate(frame, [end - len, end], [1, 0], { ...clamp, easing: (t) => t * t });

/** multi-camera: hard cuts between shots, each with its own rig authored from its own frame 0 */
export const multiCam = (shots: { from: number; keys: CamKey[] }[]) => {
  const rigs = shots.map((s) => ({ from: s.from, rig: makeRig(s.keys) }));
  return (frame: number): { cam: CamState; shot: number; local: number } => {
    let i = 0;
    for (let k = 0; k < rigs.length; k++) if (frame >= rigs[k].from) i = k;
    const local = frame - rigs[i].from;
    return { cam: rigs[i].rig(local), shot: i, local };
  };
};

/** A glossy inflated blob (brand colour), drawn in SVG: body gradient, soft shadow, highlight. */
export const PuffyBlob: React.FC<{ x: number; y: number; r: number; color: string; scale?: number; rot?: number; squash?: number; opacity?: number }> = ({
  x,
  y,
  r,
  color,
  scale = 1,
  rot = 0,
  squash = 1,
  opacity = 1,
}) => {
  const id = `pb${color.replace("#", "")}${Math.round(r)}`;
  return (
    <svg
      width={r * 2.4}
      height={r * 2.4}
      viewBox="-120 -120 240 240"
      style={{ position: "absolute", left: x - r * 1.2, top: y - r * 1.2, transform: `rotate(${rot}deg) scale(${scale * squash}, ${scale / squash})`, opacity, overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`${id}g`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="28%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
        <filter id={`${id}s`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <ellipse cx="6" cy="16" rx="98" ry="94" fill="rgba(11,31,77,0.18)" filter={`url(#${id}s)`} />
      <path d="M0,-100 C60,-100 100,-62 100,-4 C100,58 58,100 0,100 C-60,100 -100,60 -100,2 C-100,-58 -62,-100 0,-100 Z" fill={`url(#${id}g)`} />
      <ellipse cx="-36" cy="-48" rx="30" ry="14" fill="#ffffff" opacity="0.55" transform="rotate(-28 -36 -48)" />
    </svg>
  );
};

/** Big kinetic word that puffs in on a beat, with an accent underline that draws. */
export const KineticWord: React.FC<{ text: string; sub?: string; start: number; end: number; x: number; y: number; size?: number; color?: string; align?: "center" | "right" | "left" }> = ({
  text,
  sub,
  start,
  end,
  x,
  y,
  size = 140,
  color,
  align = "center",
}) => {
  const frame = useFrame();
  const L = look();
  const p = puff(frame, start);
  const o = deflateOut(frame, end);
  if (frame < start || frame > end) return null;
  const tx = align === "center" ? "-50%" : align === "right" ? "-100%" : "0%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        // puff in, then keep breathing forward a little while it holds
        transform: `translate(${tx}, -50%) scale(${p * o * (1 + 0.0009 * (frame - start))})`,
        transformOrigin: "50% 60%",
        direction: "rtl",
        textAlign: align,
        fontFamily: HEEBO,
        color: color ?? L.text,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontSize: size, fontWeight: 900, lineHeight: 1, letterSpacing: -1, textShadow: "0 10px 30px rgba(11,31,77,0.12)" }}>{text}</div>
      {sub ? <div style={{ fontSize: size * 0.26, fontWeight: 600, color: L.sub, marginTop: size * 0.12 }}>{sub}</div> : null}
    </div>
  );
};

export const STEPS = ["התקנת המאוורר", "מקור חשמל", "לובשים", "אטימה", "ניפוח"];

/**
 * Step bar (top right, RTL): "שלב 2 · מקור חשמל" on a soft pill + five progress segments; the
 * current one fills in blue. Replaces the static chapter marker.
 */
export const StepBar: React.FC<{ step: number; start: number; end: number }> = ({ step, start, end }) => {
  const frame = useFrame();
  const L = look();
  const p = puff(frame, start, 200);
  const o = deflateOut(frame, end, 6);
  const fill = interpolate(frame, [start + 6, start + 22], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        right: 64,
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        fontFamily: HEEBO,
        transform: `scale(${p * o})`,
        transformOrigin: "100% 0%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: L.plate, boxShadow: L.plateShadow, borderRadius: 40, padding: "10px 24px 10px 14px" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            background: `radial-gradient(circle at 35% 30%, #7cc8ff 0%, ${C.blue} 45%, #0a6fc0 100%)`,
            color: "#fff",
            fontWeight: 800,
            fontSize: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.15)",
          }}
        >
          {step}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: L.text }}>{STEPS[step - 1]}</div>
      </div>
      <div style={{ display: "flex", gap: 8, paddingRight: 16 }}>
        {STEPS.map((_, i) => {
          const n = i + 1;
          const w = n === step ? 84 : 40;
          const f = n < step ? 1 : n === step ? fill : 0;
          return (
            <div key={i} style={{ width: w, height: 14, borderRadius: 7, background: "rgba(11,31,77,0.16)", boxShadow: "inset 0 1px 2px rgba(11,31,77,0.15)", overflow: "hidden" }}>
              <div style={{ width: `${f * 100}%`, height: "100%", borderRadius: 7, background: `linear-gradient(180deg, #5bbcff, ${C.blue})` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Transition envelope for a shot: whip (horizontal slide + directional motion blur) or zoom
 * (push through with radial blur feel) on the way in and/or out. Wrap a scene's content.
 */
export const ShotFx: React.FC<{ len: number; inFx?: "whip" | "zoom" | "none"; outFx?: "whip" | "zoom" | "none"; dir?: 1 | -1; children: React.ReactNode }> = ({
  len,
  inFx = "none",
  outFx = "none",
  dir = 1,
  children,
}) => {
  const frame = useFrame();
  const D = 7;
  const tIn = inFx === "none" ? 1 : interpolate(frame, [0, D], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const tOut = outFx === "none" ? 0 : interpolate(frame, [len - D, len], [0, 1], { ...clamp, easing: (t) => t * t * t });
  let tx = 0;
  let sc = 1;
  let blur = 0;
  if (inFx === "whip") {
    tx += (1 - tIn) * 520 * dir;
    blur = Math.max(blur, (1 - tIn) * 40);
  }
  if (inFx === "zoom") {
    sc *= 1 + (1 - tIn) * 0.35;
    blur = Math.max(blur, (1 - tIn) * 18);
  }
  if (outFx === "whip") {
    tx -= tOut * 520 * dir;
    blur = Math.max(blur, tOut * 40);
  }
  if (outFx === "zoom") {
    sc *= 1 + tOut * 0.6;
    blur = Math.max(blur, tOut * 22);
  }
  // a bright streak sweeps with the move so the blurred frames read as intentional light, not mud
  const streak = Math.max(inFx === "none" ? 0 : 1 - tIn, outFx === "none" ? 0 : tOut);
  const sx = inFx !== "none" && 1 - tIn >= tOut ? (1 - tIn) * 100 * dir : -tOut * 100 * dir;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${tx}px) scale(${sc})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
      {streak > 0.02 ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            opacity: Math.min(1, streak * 1.4),
            background: `linear-gradient(100deg, rgba(255,255,255,0) ${35 + sx}%, rgba(255,255,255,0.9) ${50 + sx}%, rgba(255,255,255,0) ${65 + sx}%)`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Lens depth of field (cheap, convincing): everything outside a soft ellipse around the focus
 * point is blurred, as with a long lens wide open. Use on macro and product shots.
 */
export const LensBlur: React.FC<{ focus: { x: number; y: number }; rx?: number; ry?: number; strength?: number }> = ({ focus, rx = 520, ry = 360, strength = 7 }) => {
  const mask = `radial-gradient(ellipse ${rx}px ${ry}px at ${focus.x}px ${focus.y}px, transparent 45%, black 100%)`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backdropFilter: `blur(${strength}px)`,
        WebkitBackdropFilter: `blur(${strength}px)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};

/** A short flash ring that pops where something clicks into place. */
export const ClickRing: React.FC<{ at: { x: number; y: number }; start: number; color?: string }> = ({ at, start, color }) => {
  const frame = useFrame();
  const t = interpolate(frame, [start, start + 12], [0, 1], clamp);
  if (frame < start || t >= 1) return null;
  const r = 20 + t * 90;
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <circle cx={at.x} cy={at.y} r={r} fill="none" stroke={color ?? C.blue} strokeWidth={8 * (1 - t)} opacity={1 - t} />
      <circle cx={at.x} cy={at.y} r={r * 0.55} fill="none" stroke="#ffffff" strokeWidth={5 * (1 - t)} opacity={(1 - t) * 0.9} />
    </svg>
  );
};

/** film beat grid: beats of the underscore slice fall at 0.3 + n · BEAT frames */
export const beatSnap = (filmFrame: number) => Math.round(Math.round((filmFrame - 0.3) / BEAT) * BEAT + 0.3);
/** snap a scene-local cut (scene starting at `sceneStart` on the film) to the nearest beat */
export const cutOnBeat = (sceneStart: number, local: number) => beatSnap(sceneStart + local) - sceneStart;

/**
 * Restrict a piecewise-linear retime map (src → dst) to the window [a, b] of `src`, re-based
 * to start at 0 — so one long authored take can be split into several shots.
 */
export const subMap = (src: number[], dst: number[], a: number, b: number) => {
  const at = (x: number) => {
    for (let i = 0; i < src.length - 1; i++) {
      if (x <= src[i + 1]) {
        const t = (x - src[i]) / Math.max(1e-6, src[i + 1] - src[i]);
        return dst[i] + (dst[i + 1] - dst[i]) * Math.min(1, Math.max(0, t));
      }
    }
    return dst[dst.length - 1];
  };
  const s = [a, ...src.filter((x) => x > a && x < b), b];
  return { src: s.map((x) => x - a), dst: s.map(at) };
};
