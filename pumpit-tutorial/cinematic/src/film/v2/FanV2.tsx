import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile } from "remotion";
import { Backdrop, Callout, LensFinish } from "../../overlay/Overlay";
import { C } from "../../theme";
import { T1Fan } from "../../tests/T1Fan";
import { CamKey } from "../../three/rig";
import { clamp, PuffyBlob, puff, ShotFx, StepBar } from "../motion";
import { Retime, useFrame } from "../time";

// where the blower sits on the costume photo (fraction of the image box), measured on trex_cutout_v2
const IMG_W = 914;
const IMG_H = 1311;
const FAN = { u: 0.78, v: 0.6 };

/** Shot A: the whole costume; the camera pushes toward the hip while a ring pulses on the fan opening. */
const WhereIsTheFan: React.FC<{ len: number }> = ({ len }) => {
  const frame = useFrame();
  const h = 920;
  const w = (h * IMG_W) / IMG_H;
  const left = 960 - w / 2 - 120;
  const top = 1040 - h;
  const fx = left + FAN.u * w;
  const fy = top + FAN.v * h;
  const push = interpolate(frame, [0, len], [1, 1.32], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const pulse = (k: number) => ((frame - 10 - k * 9) % 27) / 27;
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.45} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${fx}px ${fy}px` }}>
        <PuffyBlob x={fx - 40} y={560} r={330} color="#dcedff" scale={puff(frame, 0, 120)} />
        <Img src={staticFile("img/trex_cutout_v2.png")} style={{ position: "absolute", left, top, height: h }} />
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2].map((k) => {
            const t = pulse(k);
            return frame > 10 + k * 9 ? <circle key={k} cx={fx} cy={fy} r={18 + t * 70} fill="none" stroke={C.blue} strokeWidth={6 * (1 - t)} opacity={1 - t} /> : null;
          })}
          <circle cx={fx} cy={fy} r={14 * puff(frame, 8, 220)} fill={C.blue} stroke="#fff" strokeWidth={4} />
        </svg>
      </AbsoluteFill>
      <LensFinish />
      <Callout at={{ x: 960 + (fx - 960) * push, y: 540 + (fy - 540) * push }} dx={-300} dy={-200} start={10} end={len + 4} title="פתח המאוורר" sub="כאן מותקן המאוורר" />
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
  const A = 44;
  const B = 92;
  const Cc = 130;
  const END = 167;
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
