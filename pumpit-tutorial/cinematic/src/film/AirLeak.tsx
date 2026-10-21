import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Backdrop, Callout, Chapter, LensFinish } from "../overlay/Overlay";
import { C, HEEBO, look } from "../theme";
import { Preload } from "../three/materials";
import { Airflow } from "../three/models/Airflow";
import { deflate, DeflatingCostume, IMG_H, IMG_W } from "../three/models/DeflatingCostume";
import { makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { useFrame } from "./time";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const H = 3;
const Wd = (H * IMG_W) / IMG_H;
const toWorld = (u: number, v: number, e: number, z = 0.12) => {
  const d = deflate(u, v, e);
  return new THREE.Vector3((d.u - 0.5) * Wd, (d.v - 0.5) * H, z);
};
/** a short wisp leaving the costume at (u, v) along image-space direction (du, dv) */
const wisp = (u: number, v: number, du: number, dv: number, e: number) =>
  [0, 0.35, 0.7, 1].map((k) => toWorld(u + du * k, v + dv * k, e, 0.12 + k * 0.25));

/**
 * MOST IMPORTANT (42.04–50.24 s): "עכשיו מגיע השלב החשוב ביותר!" — a clear, calm emphasis card
 * over the costume → "…חשוב לצמצם בריחת אוויר" — the costume can't reach full pressure: short
 * pink wisps show air escaping at the cuffs and along an open zipper.
 */
export const AirLeak: React.FC = () => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const L = look();
  const p = 0.8 + 0.025 * Math.sin(frame / 9);
  const e = 1 - p;
  const leaks = [wisp(0.36, 0.03, -0.12, 0.0, e), wisp(0.56, 0.03, 0.12, 0.0, e), wisp(0.64, 0.56, 0.16, 0.04, e), wisp(0.3, 0.4, -0.14, 0.02, e)];
  const leakO = interpolate(frame, [104, 126], [0, 1], clamp);
  const card = easeOut(interpolate(frame, [6, 24], [0, 1], clamp)) * interpolate(frame, [80, 96], [1, 0], clamp);
  const rig = useMemo(
    () =>
      makeRig([
        { f: 0, pos: [0.1, 0.05, 6.4], target: [0.05, -0.05, 0], fov: 34 },
        { f: 246, pos: [0.4, -0.05, 5.4], target: [0.15, -0.2, 0], fov: 34 },
      ]),
    [],
  );
  const cam = rig(frame);
  const pLeak = project(leaks[2][1], cam, width, height);
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.42} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }}>
          <CameraDriver state={cam} />
          <Studio lights={false} />
          <DeflatingCostume pressure={p} height={H} />
          <Airflow paths={leaks} t={frame / 30} opacity={leakO} color={C.pink} pulse="#d10b55" />
        </ThreeCanvas>
      </Preload>
      {/* emphasis card: the one moment the film raises its voice, still clean and quiet */}
      <AbsoluteFill style={{ background: `rgba(238,244,252,${0.72 * card})` }} />
      <div
        style={{
          position: "absolute",
          top: 440,
          left: 0,
          right: 0,
          textAlign: "center",
          direction: "rtl",
          fontFamily: HEEBO,
          color: L.text,
          opacity: card,
          transform: `scale(${0.96 + 0.04 * card})`,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 600, color: L.accent, letterSpacing: 1 }}>עכשיו</div>
        <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1.05 }}>השלב החשוב ביותר</div>
      </div>
      <Callout at={pLeak} dx={-300} dy={-160} start={120} title="בריחת אוויר" sub="בפתחים וברוכסן פתוח" accent={C.pink} />
      <Chapter n="04" title="אטימה" start={100} end={246} />
      <LensFinish />
    </AbsoluteFill>
  );
};
