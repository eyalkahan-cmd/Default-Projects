import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Backdrop, Callout, LensFinish } from "../overlay/Overlay";
import { HEEBO, look } from "../theme";
import { Preload } from "../three/materials";
import { Airflow } from "../three/models/Airflow";
import { Blower } from "../three/models/Blower";
import { makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { Photo } from "./Opening";
import { useFrame } from "./time";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const LINEUP: { src: string; h: number; cx: number }[] = [
  { src: "cut/unicorn.png", h: 600, cx: 330 },
  { src: "cut/dino_blue.png", h: 660, cx: 640 },
  { src: "img/trex_cutout_clean.png", h: 760, cx: 960 },
  { src: "cut/astronaut.png", h: 650, cx: 1280 },
  { src: "cut/giraffe.png", h: 640, cx: 1590 },
];

/** "אתם מוכנים לגנוב את ההצגה!" — the line-up of real costumes rising in, staggered on the beat. */
export const Lineup: React.FC = () => {
  const frame = useFrame();
  const L = look();
  const head = easeOut(interpolate(frame, [10, 28], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      {LINEUP.map((p, i) => {
        const s = 4 + Math.abs(i - 2) * 7; // centre first, then outwards
        const e = easeOut(interpolate(frame, [s, s + 16], [0, 1], clamp));
        return <Photo key={p.src} src={p.src} h={p.h} cx={p.cx} floor={1000 + (1 - e) * 60} opacity={e} push={interpolate(frame, [0, 90], [1, 1.03])} />;
      })}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          textAlign: "center",
          direction: "rtl",
          fontFamily: HEEBO,
          fontSize: 84,
          fontWeight: 900,
          color: L.text,
          opacity: head,
          translate: `0 ${(1 - head) * 24}px`,
        }}
      >
        מוכנים לגנוב את ההצגה!
      </div>
      <LensFinish />
    </AbsoluteFill>
  );
};

/** "רק זכרו להשאיר את המאוורר פועל…" — the blower running, air drawn in, one clear reminder. */
export const KeepRunning: React.FC = () => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const rig = useMemo(
    () =>
      makeRig([
        { f: 0, pos: [1.25, 0.35, 1.9], target: [0.05, -0.02, 0], fov: 30 },
        { f: 140, pos: [0.85, 0.28, 1.65], target: [0.05, -0.02, 0], fov: 30 },
      ]),
    [],
  );
  const cam = rig(frame);
  const paths = useMemo(
    () =>
      [-0.18, 0, 0.18].map((y, i) => [
        new THREE.Vector3(1.2, y + 0.25, 1.1 - i * 0.2),
        new THREE.Vector3(0.6, y * 0.6 + 0.1, 0.55),
        new THREE.Vector3(0.12, y * 0.3, 0.12),
        new THREE.Vector3(0, y * 0.2, -0.05),
      ]),
    [],
  );
  const pFan = project([0.0, 0.32, 0.08], cam, width, height);
  return (
    <AbsoluteFill>
      <Backdrop x={0.45} y={0.45} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} shadows>
          <CameraDriver state={cam} />
          <Studio keyPos={[2.5, 3, 3]} rimPos={[-3, 2, -3]} floorY={-0.55} floorStyle="glossy" />
          <Blower position={[0, 0, 0]} rotation={[0, -0.25, 0]} spin={frame * 0.9} />
          <Airflow paths={paths} t={frame / 30} opacity={interpolate(frame, [6, 24], [0, 1], clamp)} />
        </ThreeCanvas>
      </Preload>
      <Callout at={pFan} dx={-260} dy={-170} start={14} title="המאוורר נשאר פועל" sub="כל זמן שלובשים את התחפושת" />
      <LensFinish />
    </AbsoluteFill>
  );
};

/** End card: the Pumpit logo on the light studio, site address beneath. */
export const EndCard: React.FC = () => {
  const frame = useFrame();
  const L = look();
  const a = easeOut(interpolate(frame, [0, 20], [0, 1], clamp));
  const b = easeOut(interpolate(frame, [12, 30], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      <Img
        src={staticFile("img/logo.png")}
        style={{ position: "absolute", left: 960, top: 470, width: 860, transform: `translate(-50%, -50%) scale(${0.92 + 0.08 * a})`, opacity: a }}
      />
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", fontFamily: HEEBO, fontSize: 44, fontWeight: 700, color: L.text, opacity: b, letterSpacing: 1 }}>
        pumpit.co.il
      </div>
      <LensFinish />
    </AbsoluteFill>
  );
};
