import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Backdrop, Callout, LensFinish } from "../../overlay/Overlay";
import { C, HEEBO, look } from "../../theme";
import { Preload } from "../../three/materials";
import { Cable, UsbPlug } from "../../three/models/Cable";
import { BatteryPack, PowerBank } from "../../three/models/PowerSources";
import { project } from "../../three/rig";
import { CameraDriver, Studio } from "../../three/Studio";
import { ClickRing, clamp, KineticWord, LensBlur, multiCam, puff, StepBar } from "../motion";
import { useFrame } from "../time";

const smooth = (t: number) => t * t * (3 - 2 * t);
const FLOOR = -0.5;
const PACK: [number, number, number] = [0, FLOOR + 0.475, 0];
const BANK: [number, number, number] = [2.4, FLOOR + 0.71, 0];
const BANK_PORT_TOP = BANK[1] + 0.715;
const DOWN = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

// shot boundaries (scene frames, 0 = 11.96 s), on the beat
const S = { top: 0, macro: 38, hero: 82, split: 132, bank: 204, usb: 278, end: 408 };

const CAMS = multiCam([
  // high front angle into the open tray: the first cells drop in
  { from: S.top, keys: [{ f: 0, pos: [-0.25, 0.85, 1.5], target: [0, 0.0, 0.2], fov: 30 }, { f: 38, pos: [-0.1, 0.72, 1.3], target: [0, 0.0, 0.2], fov: 30 }] },
  // low macro across the tray: cells three and four snap in
  { from: S.macro, keys: [{ f: 0, pos: [0.95, 0.12, 1.0], target: [-0.05, 0.02, 0.22], fov: 30 }, { f: 44, pos: [0.7, 0.18, 0.95], target: [-0.05, 0.02, 0.22], fov: 30 }] },
  // hero three-quarter pull-back, room for the kinetic "AA"
  { from: S.hero, keys: [{ f: 0, pos: [0.75, 0.55, 1.85], target: [-0.6, 0.22, 0.1], fov: 32 }, { f: 50, pos: [1.0, 0.6, 2.25], target: [-0.65, 0.26, 0.1], fov: 32 }] },
  // wide on both options for "או"
  { from: S.split, keys: [{ f: 0, pos: [1.2, 0.75, 5.2], target: [1.2, 0.2, 0.2], fov: 35 }, { f: 72, pos: [1.2, 0.65, 4.6], target: [1.2, 0.22, 0.2], fov: 35 }] },
  // orbit around the power bank
  { from: S.bank, keys: [{ f: 0, pos: [4.4, 0.75, 2.2], target: [2.15, 0.3, 0], fov: 32 }, { f: 74, pos: [2.9, 0.9, 3.4], target: [2.0, 0.3, 0], fov: 32 }] },
  // high three-quarter over the port: the plug comes in from above the frame and seats
  { from: S.usb, keys: [{ f: 0, pos: [3.05, 1.75, 1.75], target: [2.4, 0.8, 0], fov: 30 }, { f: 130, pos: [2.85, 1.55, 1.5], target: [2.4, 0.78, 0], fov: 30 }] },
]);

/**
 * 02 · POWER (11.96–25.58 s, 408 f): "הכניסו סוללות AA חדשות…" → "או… Power Bank" →
 * "דרך כבל ה-USB של המאוורר, אם הדגם תומך בכך". Six shots cut on the beat.
 */
export const PowerV2: React.FC = () => {
  const frame = useFrame();
  const { width, height } = useVideoConfig();
  const L = look();
  const { cam, shot } = CAMS(frame);
  const cells = [0, 1, 2, 3].map((i) => smooth(interpolate(frame, [10 + i * 17, 26 + i * 17], [0, 1], clamp)));
  const seatFrames = [26, 43, 60, 77];
  // the plug descends from above the frame, then seats
  const drop = smooth(interpolate(frame, [S.usb - 12, S.usb + 30], [0, 1], clamp));
  const seat = smooth(interpolate(frame, [S.usb + 48, S.usb + 68], [0, 1], clamp));
  const plugY = BANK_PORT_TOP - 0.1 + 0.32 + (1 - seat) * 0.3 + (1 - drop) * 0.3;
  // the cable hangs straight up out of the plug: off-frame until the plug itself enters
  const cable: [number, number, number][] = [
    [2.42, plugY + 2.6, -0.05],
    [2.41, plugY + 1.3, -0.02],
    [2.4, plugY + 0.45, 0],
    [2.4, plugY, 0],
  ];
  const showUsb = frame >= S.usb;
  const pCells = project([-0.075, 0.05, 0.3], cam, width, height);
  const pBank = project([BANK[0] + 0.3, BANK[1] + 0.2, 0.15], cam, width, height);
  const pPort = project([2.4, BANK_PORT_TOP, 0.03], cam, width, height);
  const pPlug = project([2.4, plugY - 0.12, 0.05], cam, width, height);
  const mid = project([1.2, 0.25, 0.2], cam, width, height);
  const orP = frame >= S.split && frame < S.bank ? puff(frame, S.split + 10) : 0;

  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      <Preload>
        <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} shadows>
          <CameraDriver state={cam} />
          <Studio keyPos={[2, 4, 3.5]} rimPos={[-4, 3, -3]} floorY={FLOOR} floorStyle="glossy" />
          <BatteryPack position={PACK} explode={1} cells={cells} />
          <PowerBank position={BANK} />
          {showUsb ? (
            <>
              {/* no cast shadow: the floor behind is out of shot, its shadow would read as a stray line */}
              <Cable points={cable} shadow={false} />
              <UsbPlug position={new THREE.Vector3(2.4, plugY, 0)} quaternion={DOWN} shadow={false} />
            </>
          ) : null}
        </ThreeCanvas>
      </Preload>
      {/* shallow depth of field on the close shots: focus on the subject, the rest falls away */}
      {shot === 0 || shot === 1 ? <LensBlur focus={pCells} rx={560} ry={420} strength={6} /> : null}
      {shot === 4 ? <LensBlur focus={pBank} rx={620} ry={520} strength={5} /> : null}
      {shot === 5 ? <LensBlur focus={pPort} rx={600} ry={460} strength={6} /> : null}

      {seatFrames.map((f) => (
        <ClickRing key={f} at={pCells} start={f} />
      ))}
      <KineticWord text="AA" sub="סוללות חדשות · בהתאם להוראות הדגם" start={S.hero + 4} end={S.split - 2} x={600} y={250} size={200} color={C.blue} />

      {/* "או": both options side by side */}
      {orP > 0 ? (
        <>
          <div style={{ position: "absolute", left: mid.x, top: mid.y - 330, width: 4, height: 660 * orP, borderRadius: 2, background: `linear-gradient(180deg, rgba(16,153,234,0), ${C.blue}, rgba(16,153,234,0))` }} />
          <div
            style={{
              position: "absolute",
              left: mid.x,
              top: mid.y,
              width: 150,
              height: 150,
              marginLeft: -75,
              marginTop: -75,
              borderRadius: 75,
              transform: `scale(${orP})`,
              background: `radial-gradient(circle at 35% 30%, #8fd0ff 0%, ${C.blue} 55%, #0a6fc0 100%)`,
              boxShadow: "0 16px 40px rgba(16,153,234,0.35), inset 0 -6px 14px rgba(0,0,0,0.18)",
              color: "#fff",
              fontFamily: HEEBO,
              fontWeight: 900,
              fontSize: 66,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            או
          </div>
        </>
      ) : null}
      {frame >= S.split && frame < S.bank ? <Callout at={pBank} dx={-160} dy={-230} start={S.split + 22} end={S.bank} title="Power Bank" sub="סוללת גיבוי ניידת" accent={L.air} /> : null}
      {frame >= S.bank && frame < S.usb ? <KineticWord text="Power Bank" sub="סוללת גיבוי ניידת" start={S.bank + 6} end={S.usb - 2} x={560} y={260} size={120} /> : null}
      <ClickRing at={pPort} start={S.usb + 68} />
      {showUsb ? <Callout at={pPlug} dx={-300} dy={-60} start={S.usb + 56} title="כבל ה-USB של המאוורר" sub="רק אם הדגם תומך בכך" accent={L.air} /> : null}
      <StepBar step={2} start={4} end={S.end + 200} />
      <LensFinish />
    </AbsoluteFill>
  );
};

