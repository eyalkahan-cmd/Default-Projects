import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { useFrame } from "../film/time";
import * as THREE from "three";
import { Backdrop, Callout, Chapter, LensFinish } from "../overlay/Overlay";
import { Preload } from "../three/materials";
import { Blower } from "../three/models/Blower";
import { Cable, UsbPlug } from "../three/models/Cable";
import { BatteryPack, PowerBank } from "../three/models/PowerSources";
import { CamKey, makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { C, HEEBO, look } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (t: number) => t * t * (3 - 2 * t);
const FLOOR = -0.5;
const PACK: [number, number, number] = [0, FLOOR + 0.475, 0];
const PORT_TOP = PACK[1] + 0.485;
const BANK: [number, number, number] = [2.4, FLOOR + 0.71, 0];
const BANK_PORT_TOP = BANK[1] + 0.715;
const DOWN = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

/**
 * LOOK-DEV 4 — CONTINUOUS FLOW: FAN → CABLE → POWER (10 s)
 * One camera move: starts on the blower's cable exit (continuing look-dev 1), tracks low along
 * the cable across the floor, arrives as the USB plug seats in the pack's top socket, arcs while
 * the lid lifts in an exploded view of the 4 × AA, then trucks right to the alternative: a
 * power bank, qualified as model-dependent. No cuts.
 */
export const T4Flow: React.FC<{ keys?: CamKey[]; chrome?: boolean }> = ({ keys, chrome = true }) => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const plugIn = interpolate(frame, [96, 132], [0, 1], { ...clamp, easing: smooth });
  const plugY = PORT_TOP - 0.1 + 0.32 + (1 - plugIn) * 0.38;
  const explode = interpolate(frame, [150, 190], [0, 1], { ...clamp, easing: smooth });
  const bankCable = interpolate(frame, [205, 245], [0, 1], { ...clamp, easing: smooth });

  const cable: [number, number, number][] = [
    [-3.05, -0.28, -0.3],
    [-2.6, FLOOR + 0.02, 0.05],
    [-1.7, FLOOR + 0.02, 0.45],
    [-0.75, FLOOR + 0.02, 0.4],
    [-0.42, FLOOR + 0.22, 0.3],
    // rise beside the box, arc over and drop straight into the top of the plug boot
    [-0.26, plugY + 0.12, 0.1],
    [-0.08, plugY + 0.2, 0.02],
    [0, plugY + 0.1, 0],
    [0, plugY, 0],
  ];
  const bankPlugY = BANK_PORT_TOP - 0.1 + 0.32;
  const cable2: [number, number, number][] = [
    [1.0, FLOOR + 0.02, -0.9],
    [1.7, FLOOR + 0.02, -0.2],
    [2.15, FLOOR + 0.4, 0.05],
    [2.36, bankPlugY - 0.25, 0.02],
    [2.4, bankPlugY + 0.012, 0],
  ];

  const rig = useMemo(
    () =>
      makeRig(keys ?? [
        { f: 0, pos: [-2.2, 0.3, 1.5], target: [-2.95, -0.3, -0.15], fov: 32 },
        { f: 62, pos: [-1.25, -0.05, 1.45], target: [-1.45, -0.45, 0.35], fov: 32 },
        { f: 122, pos: [0.6, 0.85, 1.55], target: [0.0, 0.45, 0.1], fov: 32 },
        { f: 180, pos: [0.85, 0.55, 2.75], target: [0.0, 0.05, 0.35], fov: 33 },
        { f: 240, pos: [1.25, 0.65, 5.0], target: [1.2, 0.25, 0.2], fov: 35 },
        { f: 300, pos: [1.2, 0.65, 5.25], target: [1.2, 0.27, 0.2], fov: 35 },
      ]),
    [keys],
  );
  const cam = rig(frame);
  const pPlug = project([0, plugY - 0.12, 0.05], cam, width, height);
  const pCells = project([-0.075, 0.05, 0.3], cam, width, height);
  const pBank = project([BANK[0] + 0.3, BANK[1] + 0.2, 0.15], cam, width, height);
  const mid = project([1.2, 0.25, 0.2], cam, width, height);
  const orO = interpolate(frame, [205, 222], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} shadows>
          <CameraDriver state={cam} />
          <Studio keyPos={[2, 4, 3.5]} rimPos={[-4, 3, -3]} floorY={FLOOR} floorStyle="glossy" />
          <Blower position={[-3, 0, 0]} rotation={[0, 0.6, 0]} spin={0} />
          <Cable points={cable} />
          <UsbPlug position={new THREE.Vector3(0, plugY, 0)} quaternion={DOWN} />
          <BatteryPack position={PACK} explode={explode} />
          <PowerBank position={BANK} />
          {bankCable > 0 ? (
            <>
              <Cable points={cable2} reveal={bankCable} />
              {bankCable >= 0.999 ? <UsbPlug position={new THREE.Vector3(2.4, bankPlugY, 0)} quaternion={DOWN} /> : null}
            </>
          ) : null}
        </ThreeCanvas>
      </Preload>

      <Callout at={pPlug} dx={-210} dy={-110} start={104} end={150} title="מחברים לקופסת הסוללות" sub="כבל ה-USB של המאוורר" />
      <Callout at={pCells} dx={-150} dy={-210} start={170} title="סוללות AA" sub="סוג וכמות בהתאם לדגם" />
      <Callout at={pBank} dx={-150} dy={-250} start={240} title="Power Bank" sub="רק אם הדגם תומך בכך" accent={look().air} />

      {/* "or" marker on the split between the two power options */}
      <div
        style={{
          position: "absolute",
          left: mid.x,
          top: mid.y - 300,
          width: 2,
          height: 600 * orO,
          background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: mid.x,
          top: mid.y,
          translate: "-50% -50%",
          fontFamily: HEEBO,
          fontWeight: 700,
          fontSize: 34,
          color: C.white,
          background: "#062a6d",
          padding: "6px 18px",
          borderRadius: 30,
          border: "1.5px solid rgba(255,255,255,0.6)",
          opacity: orO,
        }}
      >
        או
      </div>

      {chrome ? (
      <Chapter n="02" title="מקור חשמל" start={6} end={300} />
      ) : null}
      <LensFinish />
    </AbsoluteFill>
  );
};
