import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, Callout, Chapter, LensFinish } from "../overlay/Overlay";
import { Preload } from "../three/materials";
import { Blower } from "../three/models/Blower";
import { Cable } from "../three/models/Cable";
import { FabricPanel } from "../three/models/FabricPanel";
import { makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { look } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Blower sits behind the fabric; its grille is flush with the opening (fabric at z = 0).
const FAN_POS: [number, number, number] = [0, 0, -0.205];
const CABLE: [number, number, number][] = [
  [0.05, -0.3, -0.33],
  [0.25, -0.62, -0.45],
  [0.75, -0.95, -0.3],
  [1.5, -1.0, 0.1],
  [2.4, -1.0, 0.25],
];

/**
 * LOOK-DEV 1 — FAN INSTALLATION (7 s)
 * Medium detail of the costume fabric → dolly in to the blower opening → gentle arc while the
 * nylon ghosts ("x-ray") to reveal how the housing sits behind it → tilt down along the cable.
 * The camera stays in front of the fabric so its edges are never seen; no floor in this macro.
 */
export const T1Fan: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rig = useMemo(
    () =>
      makeRig([
        { f: 0, pos: [0.6, 0.4, 3.2], target: [0, 0, 0], fov: 28 },
        { f: 70, pos: [0.3, 0.15, 1.6], target: [0, 0, -0.05], fov: 28 },
        { f: 135, pos: [0.95, 0.12, 1.35], target: [0.05, -0.05, -0.15], fov: 30 },
        { f: 210, pos: [1.05, -0.3, 1.5], target: [0.35, -0.5, -0.25], fov: 32 },
      ]),
    [],
  );
  const cam = rig(frame);
  // x-ray: the nylon ghosts during the arc so the housing behind it reads, then stays ghosted
  const ghost = interpolate(frame, [92, 128], [1, 0.38], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const spin = frame * 0.05;

  const pGrille = project([0.0, 0.3, 0.02], cam, width, height);
  const pHousing = project([0.43, -0.05, -0.18], cam, width, height);
  const pCable = project([0.75, -0.95, -0.3], cam, width, height);

  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.4} />
      <Preload>
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} shadows>
        <CameraDriver state={cam} />
        <Studio keyPos={[2.5, 3.2, 3]} rimPos={[-3, 2, -3]} floor={false} />
        <FabricPanel opacity={ghost} />
        <Blower position={FAN_POS} spin={spin} />
        <Cable points={CABLE} />
      </ThreeCanvas>
      </Preload>

      <Callout at={pGrille} dx={-330} dy={80} start={40} end={112} title="הפתח הייעודי" sub="המאוורר נכנס לפתח בתחפושת" />
      <Callout at={pHousing} dx={170} dy={-170} start={124} end={190} title="המאוורר" sub="מותקן היטב וצמוד לבד" />
      <Callout at={pCable} dx={-170} dy={-120} start={168} title="כבל המאוורר" sub="ממשיך אל מקור החשמל" accent={look().air} />

      <Chapter n="01" title="התקנת המאוורר" start={8} end={210} />
      <LensFinish />
    </AbsoluteFill>
  );
};
