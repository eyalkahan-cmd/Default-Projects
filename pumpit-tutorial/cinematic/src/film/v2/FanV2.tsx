import React from "react";
import { AbsoluteFill, interpolate, Sequence, useVideoConfig } from "remotion";
import { Backdrop, Callout, LensFinish } from "../../overlay/Overlay";
import { C } from "../../theme";
import { T1Fan } from "../../tests/T1Fan";
import { CamKey } from "../../three/rig";
import { IMG_H, IMG_W } from "../../three/models/DeflatingCostume";
import { Character, characterLayout, characterPoint } from "../Character";
import { clamp, PuffyBlob, puff, settle, ShotFx, SPRING_OBJECT, StepBar } from "../motion";
import { Retime, useFrame } from "../time";
import { FAN as FAN_SHOTS } from "./timings";

// where the blower sits on the costume photo (fraction of the image box), measured on trex_cutout_v2
const FAN = { u: 0.76, v: 0.6 };

/** Shot A: the whole costume; the camera pushes toward the hip while a ring pulses on the fan opening. */
const WhereIsTheFan: React.FC<{ len: number }> = ({ len }) => {
  const frame = useFrame();
  const { height: compH } = useVideoConfig();
  // the camera pushes toward the hip; the push is applied to the costume itself, around its feet
  const push = interpolate(frame, [0, len], [1, 1.14], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const appear = settle(frame, -6);
  const H = 780;
  const cx = 840;
  const layout = characterLayout({ aspect: IMG_W / IMG_H, height: H, cx, scale: push, compH, breathing: true });
  const f = characterPoint(layout, FAN.u, FAN.v);
  const pulse = (k: number) => ((frame - 10 - k * 9) % 27) / 27;
  return (
    <AbsoluteFill style={{ overflow: "visible" }}>
      <Backdrop x={0.5} y={0.45} />
      <PuffyBlob x={cx - 40} y={layout.floor - H * 0.52 * layout.scale} r={330 * layout.scale} color="#dcedff" scale={puff(frame, 0, SPRING_OBJECT)} />
      <Character src="img/trex_cutout_v2.png" aspect={IMG_W / IMG_H} height={H} cx={cx} scale={push} appear={appear} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[0, 1, 2].map((k) => {
          const t = pulse(k);
          return frame > 10 + k * 9 ? <circle key={k} cx={f.x} cy={f.y} r={18 + t * 70} fill="none" stroke={C.blue} strokeWidth={6 * (1 - t)} opacity={1 - t} /> : null;
        })}
        <circle cx={f.x} cy={f.y} r={14 * puff(frame, 8)} fill={C.blue} stroke="#fff" strokeWidth={4} />
      </svg>
      <LensFinish />
      <Callout at={f} dx={-300} dy={-200} start={10} end={len + 4} title="פתח המאוורר" sub="כאן מותקן המאוורר" />
    </AbsoluteFill>
  );
};

/** low, rising three-quarter for the x-ray beat (authored on T1's own frame numbers) */
const LOW_ORBIT: CamKey[] = [
  { f: 100, pos: [-0.95, -0.55, 1.25], target: [0.05, -0.05, -0.15], fov: 30 },
  { f: 155, pos: [-0.55, -0.25, 1.05], target: [0.05, -0.05, -0.15], fov: 30 },
];

/**
 * 01 · FAN (6.40–11.96 s, 167 f), four shots cut on the beat: where the fan is on the costume →
 * zoom-through into the opening → low orbit while the nylon goes x-ray → tilt down the cable.
 */
export const FanV2: React.FC = () => {
  const { A, B, C: Cc, END } = FAN_SHOTS;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={A}>
        <ShotFx len={A} outFx="zoom">
          <WhereIsTheFan len={A} />
        </ShotFx>
      </Sequence>
      <Sequence from={A} durationInFrames={B - A}>
        <ShotFx len={B - A} inFx="zoom">
          <Retime src={[0, B - A]} dst={[22, 98]}>
            <T1Fan chrome={false} />
          </Retime>
        </ShotFx>
      </Sequence>
      <Sequence from={B} durationInFrames={Cc - B}>
        <Retime src={[0, Cc - B]} dst={[104, 152]}>
          <T1Fan chrome={false} keys={LOW_ORBIT} />
        </Retime>
      </Sequence>
      <Sequence from={Cc} durationInFrames={END - Cc}>
        <ShotFx len={END - Cc} inFx="whip" dir={-1}>
          <Retime src={[0, END - Cc]} dst={[158, 210]}>
            <T1Fan chrome={false} />
          </Retime>
        </ShotFx>
      </Sequence>
      <StepBar step={1} start={4} end={END + 20} />
    </AbsoluteFill>
  );
};
