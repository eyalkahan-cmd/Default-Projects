import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useFrame } from "../film/time";
import { Backdrop, Callout, Chapter, LensFinish } from "../overlay/Overlay";
import { Preload } from "../three/materials";
import { Drawstring, LOCK_X, lockYFor } from "../three/models/Drawstring";
import { Zipper } from "../three/models/Zipper";
import { CamKey, makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { HEEBO, look } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (t: number) => t * t * (3 - 2 * t);
const OPENING: [number, number, number] = [0, 3.62, 0.0];

/**
 * LOOK-DEV 2 — ZIPPER → GENTLE TIGHTENING (9 s)
 * Low macro that rides alongside the slider as it closes the chain, keeps travelling up the
 * closed zipper (directional continuity) and cranes up onto the drawstring opening, where
 * the cord lock is slid up gently and a fit ring shows the comfortable target.
 */
export const T2Seal: React.FC<{ keys?: CamKey[]; chrome?: boolean }> = ({ keys, chrome = true }) => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const slider = interpolate(frame, [18, 118], [-1.7, 2.03], { ...clamp, easing: smooth });
  const tighten = interpolate(frame, [182, 236], [0, 1], { ...clamp, easing: smooth });
  const rig = useMemo(
    () =>
      makeRig(keys ?? [
        { f: 0, pos: [0.75, -2.2, 0.62], target: [0, -1.6, 0.0], fov: 30 },
        { f: 64, pos: [0.62, -0.3, 0.6], target: [0, 0.15, 0.0], fov: 30 },
        { f: 120, pos: [0.55, 1.45, 0.7], target: [0, 1.95, 0.0], fov: 31 },
        { f: 172, pos: [0.5, 2.85, 2.35], target: [0.15, 3.38, 0.0], fov: 34 },
        { f: 270, pos: [0.95, 2.9, 2.3], target: [0.2, 3.34, 0.0], fov: 34 },
      ]),
    [keys],
  );
  const cam = rig(frame);
  const pSlider = project([0.06, slider, 0.06], cam, width, height);
  const pTop = project([0.0, 2.1, 0.02], cam, width, height);
  const pElastic = project([OPENING[0] - 0.66, OPENING[1] + 0.12, 0.06], cam, width, height);
  const pLock = project([OPENING[0] + LOCK_X, OPENING[1] + lockYFor(tighten), 0.1], cam, width, height);

  // fit ring: the comfortable target size, drawn once the cord lock moves
  const rFit = 0.52;
  const ringPts = new Array(73).fill(0).map((_, i) => {
    const a = (i / 72) * Math.PI * 2;
    return project([OPENING[0] + Math.cos(a) * (rFit + 0.07), OPENING[1] + Math.sin(a) * (rFit + 0.07), 0.06], cam, width, height);
  });
  const ringO = interpolate(frame, [176, 196, 255, 270], [0, 1, 1, 0.6], clamp);
  const okO = interpolate(frame, [232, 244], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Backdrop x={0.45} y={0.45} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} shadows>
          <CameraDriver state={cam} />
          <Studio keyPos={[1.6, 3.5, 2.6]} rimPos={[-2.5, 3, -2]} floor={false} />
          <Zipper slider={slider} />
          <Drawstring tighten={tighten} center={OPENING} />
        </ThreeCanvas>
      </Preload>

      <Callout at={pSlider} dx={-210} dy={-120} start={34} end={112} title="סוגרים את הרוכסן" sub="עד הסוף, בלי רווחים" />
      <Callout at={pTop} dx={-200} dy={-90} start={116} end={140} title="עד הסוף" />
      <Callout at={pElastic} dx={-220} dy={-130} start={140} end={180} title="הגומיות סביב הפתחים" sub="יושבות צמוד ונוח" />

      {/* comfortable fit ring (cyan = technical/airflow family) */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: ringO }}>
        <polyline
          points={ringPts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={look().air}
          strokeWidth={2.2}
          strokeDasharray="10 9"
        />
      </svg>
      <Callout at={pLock} dx={-230} dy={40} start={186} title="מהדקים בעדינות" sub="צמוד ונוח, בלי להדק יתר על המידה" accent={look().air} />
      <div
        style={{
          position: "absolute",
          left: ringPts[18].x + 30,
          top: ringPts[18].y - 30,
          fontFamily: HEEBO,
          fontWeight: 700,
          fontSize: 28,
          color: look().air,
          direction: "rtl",
          opacity: okO,
        }}
      >
        ✓ נוח
      </div>

      {chrome ? (
      <Chapter n="04" title="אטימה" start={6} end={270} />
      ) : null}
      <LensFinish />
    </AbsoluteFill>
  );
};
