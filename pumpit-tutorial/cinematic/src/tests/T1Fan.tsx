import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
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
 * Medium detail of the costume fabric → dolly in to the blower opening → arc to the side while a
 * cutaway plane slices the fabric to reveal how the housing sits behind it → follow the cable out.
 */
export const T1Fan: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rig = useMemo(
    () =>
      makeRig([
        { f: 0, pos: [1.1, 0.75, 3.4], target: [0, 0.05, 0], fov: 28 },
        { f: 60, pos: [0.55, 0.35, 1.75], target: [0, 0, -0.05], fov: 28 },
        { f: 135, pos: [1.65, 0.18, 0.62], target: [-0.04, -0.05, -0.16], fov: 30 },
        { f: 210, pos: [1.75, -0.35, 0.95], target: [0.7, -0.75, -0.2], fov: 32 },
      ]),
    [],
  );
  const cam = rig(frame);
  // cutaway: fabric with x > c is hidden; the plane sweeps right → left during the arc
  const c = interpolate(frame, [70, 120], [2.0, 0.02], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 2)], []);
  clip[0].constant = c;
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
        <Studio keyPos={[2.5, 3.2, 3]} rimPos={[-3, 2, -3]} floorY={-1.1} />
        <FabricPanel clip={clip} />
        <Blower position={FAN_POS} spin={spin} />
        <Cable points={CABLE} />
      </ThreeCanvas>
      </Preload>

      <Callout at={pGrille} dx={-230} dy={-95} start={42} end={128} title="הפתח הייעודי" sub="המאוורר נכנס לפתח בתחפושת" />
      <Callout at={pHousing} dx={170} dy={-170} start={128} end={200} title="המאוורר" sub="מותקן היטב וצמוד לבד" />
      <Callout at={pCable} dx={-170} dy={-120} start={176} title="כבל המאוורר" sub="ממשיך אל מקור החשמל" accent={look().air} />

      <Chapter n="01" title="התקנת המאוורר" start={8} end={210} />
      <LensFinish />
    </AbsoluteFill>
  );
};
