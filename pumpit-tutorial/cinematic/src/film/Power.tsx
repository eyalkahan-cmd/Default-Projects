import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Backdrop, Callout, Chapter, LensFinish } from "../overlay/Overlay";
import { HEEBO, look } from "../theme";
import { Preload } from "../three/materials";
import { Cable, UsbPlug } from "../three/models/Cable";
import { BatteryPack, PowerBank } from "../three/models/PowerSources";
import { makeRig, project } from "../three/rig";
import { CameraDriver, Studio } from "../three/Studio";
import { useFrame } from "./time";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (t: number) => t * t * (3 - 2 * t);
const FLOOR = -0.5;
const PACK: [number, number, number] = [0, FLOOR + 0.475, 0];
const BANK: [number, number, number] = [2.4, FLOOR + 0.71, 0];
const BANK_PORT_TOP = BANK[1] + 0.715;
const DOWN = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

/**
 * POWER (11.96–25.58 s, 408 f): "הכניסו סוללות AA חדשות…" — the lid is off, four AA cells drop
 * into the tray one by one in alternating orientation → "או… Power Bank" — the camera trucks
 * right to the alternative → "דרך כבל ה-USB של המאוורר, אם הדגם תומך בכך" — the fan's USB
 * cable runs in and its plug seats in the power bank's port.
 */
export const Power: React.FC = () => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const cells = [0, 1, 2, 3].map((i) => smooth(interpolate(frame, [22 + i * 16, 40 + i * 16], [0, 1], clamp)));
  const usb = smooth(interpolate(frame, [292, 340], [0, 1], clamp));
  const seat = smooth(interpolate(frame, [340, 368], [0, 1], clamp));
  const plugY = BANK_PORT_TOP - 0.1 + 0.32 + (1 - seat) * 0.38;
  const cable: [number, number, number][] = [
    [0.9, FLOOR + 0.02, -1.1],
    [1.6, FLOOR + 0.02, -0.35],
    [2.12, FLOOR + 0.35, 0.02],
    [2.36, plugY - 0.25, 0.02],
    [2.4, plugY + 0.012, 0],
  ];

  const rig = useMemo(
    () =>
      makeRig([
        { f: 0, pos: [0.95, 0.95, 2.6], target: [0, 0.0, 0.15], fov: 32 },
        { f: 120, pos: [0.7, 0.8, 2.75], target: [0, 0.0, 0.15], fov: 32 },
        { f: 200, pos: [1.25, 0.6, 4.6], target: [1.2, 0.2, 0.2], fov: 35 },
        { f: 270, pos: [1.3, 0.62, 4.75], target: [1.2, 0.22, 0.2], fov: 35 },
        { f: 330, pos: [3.1, 1.25, 3.4], target: [2.2, 0.45, 0.0], fov: 32 },
        { f: 408, pos: [3.2, 1.2, 3.2], target: [2.25, 0.5, 0.0], fov: 32 },
      ]),
    [],
  );
  const cam = rig(frame);
  const pCells = project([-0.075, 0.05, 0.3], cam, width, height);
  const pBank = project([BANK[0] + 0.3, BANK[1] + 0.2, 0.15], cam, width, height);
  const pPlug = project([2.4, plugY - 0.12, 0.05], cam, width, height);
  const mid = project([1.2, 0.25, 0.2], cam, width, height);
  const orO = interpolate(frame, [150, 168, 262, 280], [0, 1, 1, 0], clamp);
  const L = look();

  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} shadows>
          <CameraDriver state={cam} />
          <Studio keyPos={[2, 4, 3.5]} rimPos={[-4, 3, -3]} floorY={FLOOR} floorStyle="glossy" />
          <BatteryPack position={PACK} explode={1} cells={cells} />
          <PowerBank position={BANK} />
          {usb > 0 ? <Cable points={cable} reveal={usb} /> : null}
          {usb >= 0.999 ? <UsbPlug position={new THREE.Vector3(2.4, plugY, 0)} quaternion={DOWN} /> : null}
        </ThreeCanvas>
      </Preload>

      <Callout at={pCells} dx={-170} dy={-200} start={40} end={150} title="סוללות AA חדשות" sub="בהתאם להוראות הדגם" />
      <Callout at={pBank} dx={-170} dy={-230} start={196} end={290} title="Power Bank" sub="סוללת גיבוי ניידת" accent={L.air} />
      <Callout at={pPlug} dx={-240} dy={-90} start={350} title="כבל ה-USB של המאוורר" sub="רק אם הדגם תומך בכך" accent={L.air} />

      {/* "או": the split between the two power options */}
      <div style={{ position: "absolute", left: mid.x, top: mid.y - 300, width: 2, height: 600 * orO, background: `linear-gradient(180deg, rgba(0,0,0,0), ${L.leader}, rgba(0,0,0,0))`, opacity: orO }} />
      <div
        style={{
          position: "absolute",
          left: mid.x,
          top: mid.y,
          translate: "-50% -50%",
          fontFamily: HEEBO,
          fontWeight: 800,
          fontSize: 40,
          color: L.text,
          background: L.plate,
          boxShadow: L.plateShadow,
          padding: "8px 24px",
          borderRadius: 40,
          opacity: orO,
        }}
      >
        או
      </div>

      <Chapter n="02" title="מקור חשמל" start={6} end={430} />
      <LensFinish />
    </AbsoluteFill>
  );
};
