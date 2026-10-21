import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Backdrop, Callout, Chapter, LensFinish } from "../overlay/Overlay";
import { Preload } from "../three/materials";
import { Airflow } from "../three/models/Airflow";
import { Blower } from "../three/models/Blower";
import { deflate, DeflatingCostume, IMG_H, IMG_W } from "../three/models/DeflatingCostume";
import { makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { C, HEEBO, look } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const H = 3;
const Wd = (H * IMG_W) / IMG_H;
const FLOOR = -H / 2;

/** Pressure: fan spins up, slow start, steady fill, small snap as the fabric goes taut, settle. */
const pressure = (frame: number) => {
  const fill = interpolate(frame, [34, 192], [0.12, 1], { ...clamp, easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
  const snap = interpolate(frame, [186, 195, 210], [0, 0.04, 0], clamp);
  return fill + snap;
};

/** Map an image-space point (u, v) through the current deflation to world space. */
const toWorld = (u: number, v: number, e: number, z = 0.12) => {
  const d = deflate(u, v, e);
  return new THREE.Vector3((d.u - 0.5) * Wd, (d.v - 0.5) * H, z);
};

const FAN_UV: [number, number] = [0.69, 0.37];

/**
 * LOOK-DEV 3 — AIRFLOW & INFLATION (9 s)
 * The real costume, collapsed on its wearer (head folded onto the chest, belly empty, tail on
 * the floor, horizontal drapes) → the blower spins up → cyan streamlines show the air entering at
 * the hip and travelling to the head, legs and tail → the fabric fills and pulls taut → it snaps
 * to the exact, untouched product photograph. Camera: macro on the blower, then a pull-back crane.
 */
export const T3Inflate: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const p = pressure(frame);
  const e = 1 - Math.min(1, p);
  const spinRate = interpolate(frame, [8, 40], [0, 1], { ...clamp, easing: (t) => t * t });
  const spin = spinRate * (frame - 8) * 0.9;

  const fan = toWorld(FAN_UV[0], FAN_UV[1], e, 0.02);
  // streamlines follow the current fabric shape (rebuilt every frame from the deflation field)
  const flows: THREE.Vector3[][] = [
    [[0.69, 0.37], [0.58, 0.46], [0.47, 0.6], [0.36, 0.76], [0.22, 0.88]].map(([u, v]) => toWorld(u, v, e)),
    [[0.69, 0.37], [0.66, 0.27], [0.78, 0.17], [0.92, 0.1]].map(([u, v]) => toWorld(u, v, e)),
    [[0.69, 0.37], [0.55, 0.3], [0.45, 0.17], [0.4, 0.06]].map(([u, v]) => toWorld(u, v, e)),
  ];
  const flowO = interpolate(frame, [40, 62, 150, 186], [0, 1, 1, 0], clamp);

  const rig = useMemo(
    () =>
      makeRig([
        { f: 0, pos: [0.85, -0.2, 3.1], target: [0.42, -0.35, 0], fov: 30 },
        { f: 70, pos: [0.6, -0.1, 4.1], target: [0.3, -0.2, 0], fov: 32 },
        { f: 190, pos: [0.15, 0.05, 6.4], target: [0.05, -0.05, 0], fov: 34 },
        { f: 270, pos: [0.05, 0.1, 6.0], target: [0.02, -0.02, 0], fov: 34 },
      ]),
    [],
  );
  const cam = rig(frame);
  const pFan = project(fan, cam, width, height);
  const pBody = project(toWorld(0.5, 0.55, e), cam, width, height);
  const timeO = interpolate(frame, [150, 166, 236, 250], [0, 1, 1, 0], clamp);
  const heroO = interpolate(frame, [212, 230], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.42} />
      {/* soft floor contact shadow, widening as the costume fills */}
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }}>
          <CameraDriver state={cam} />
          <Studio lights={false} />
          <ambientLight intensity={0.88} />
          <directionalLight position={[-2, 3, 4]} intensity={0.22} />
          <directionalLight position={[3, 2, 2]} intensity={0.6} color="#9fd2ff" />
          <mesh position={[0.05, FLOOR + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + 0.15 * (1 - e), 0.35, 1]}>
            <circleGeometry args={[1.05, 48]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.32} depthWrite={false} />
          </mesh>
          <DeflatingCostume pressure={p} height={H} />
          <Blower position={[fan.x, fan.y, fan.z]} rotation={[0, -0.35, 0]} spin={spin} scale={0.17} />
          <Airflow paths={flows} t={frame / fps} opacity={flowO} />
        </ThreeCanvas>
      </Preload>

      <Callout at={pFan} dx={170} dy={-150} start={8} end={74} title="מפעילים את המאוורר" />
      <Callout at={pBody} dx={-230} dy={-120} start={66} end={150} title="האוויר זורם פנימה" sub="וממלא את התחפושת" accent="#7fd6ff" />

      <div style={{ position: "absolute", left: 110, bottom: 110, fontFamily: HEEBO, color: look().text, direction: "rtl", opacity: timeO }}>
        <div style={{ fontSize: 26, fontWeight: 500, color: look().sub }}>זמן ניפוח משוער</div>
        <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: 0.5 }}>
          30–60 <span style={{ fontSize: 34, fontWeight: 500 }}>שניות</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 400, color: look().sub }}>משתנה לפי הדגם</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 130,
          top: 470,
          fontFamily: HEEBO,
          color: look().text,
          direction: "rtl",
          opacity: heroO,
          translate: `0 ${(1 - heroO) * 16}px`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 500, color: look().accent, letterSpacing: 1 }}>ניפוח מלא</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>למלוא גודלה</div>
      </div>

      <Chapter n="05" title="ניפוח" start={6} end={270} />
      <LensFinish />
    </AbsoluteFill>
  );
};
