import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T2Seal } from "../../tests/T2Seal";
import { CamKey } from "../../three/rig";
import { AirLeak } from "../AirLeak";
import { cutOnBeat, ShotFx, StepBar, subMap } from "../motion";
import { Retime } from "../time";

const s = (sec: number) => Math.round(sec * 30);
const LEAK_START = 1261; // 42.04 s
const SEAL_START = 1507; // 50.24 s

// AirLeak authored frames: emphasis card 6–96, leaks from 104
const LEAK_FOOT: CamKey[] = [
  { f: 160, pos: [0.35, -1.05, 1.55], target: [-0.3, -1.3, 0], fov: 30 },
  { f: 246, pos: [0.2, -1.0, 1.35], target: [-0.3, -1.3, 0], fov: 30 },
];

/** 04 · part 1 (42.04–50.24 s): "השלב החשוב ביותר" → air escaping, wide → macro at the cuff. */
export const AirLeakV2: React.FC = () => {
  const b = cutOnBeat(LEAK_START, 166);
  const END = 246;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={b}>
        <AirLeak chrome={false} />
      </Sequence>
      <Sequence from={b} durationInFrames={END - b}>
        <ShotFx len={END - b} inFx="zoom">
          <Retime src={[0, END - b]} dst={[b, END]}>
            <AirLeak chrome={false} keys={LEAK_FOOT} />
          </Retime>
        </ShotFx>
      </Sequence>
      <StepBar step={4} start={100} end={END + 200} />
    </AbsoluteFill>
  );
};

// the T2 take fitted to the voiceover (film-local frames → T2 frames), split into shots
const SRC = [0, s(3.38), s(3.82), s(8.34), s(9.26), s(12.76), s(15.32), s(15.94)];
const DST = [0, 118, 128, 180, 184, 236, 270, 270];
const OPEN: [number, number, number] = [0, 3.62, 0];
const ZIP_LOW: CamKey[] = [
  { f: 0, pos: [0.5, -2.05, 0.38], target: [0, -1.5, 0], fov: 30 },
  { f: 62, pos: [0.45, -0.35, 0.4], target: [0, 0.15, 0], fov: 30 },
];
// elastics: a wide three-quarter orbit around the opening, then a close pass along the cuff
const ELASTIC: CamKey[] = [
  { f: 128, pos: [1.75, 4.35, 2.7], target: OPEN, fov: 33 },
  { f: 160, pos: [0.95, 4.1, 2.35], target: OPEN, fov: 33 },
];
const ELASTIC_CUFF: CamKey[] = [
  { f: 150, pos: [-1.75, 4.25, 2.05], target: [-0.5, 3.62, 0], fov: 30 },
  { f: 184, pos: [-1.35, 4.45, 1.8], target: [-0.45, 3.68, 0], fov: 30 },
];
const FIT_PUSH: CamKey[] = [
  { f: 236, pos: [1.35, 3.0, 2.75], target: [0.2, 3.34, 0], fov: 34 },
  { f: 270, pos: [0.7, 3.05, 2.05], target: [0.15, 3.38, 0], fov: 33 },
];
const LOCK_MACRO: CamKey[] = [
  { f: 182, pos: [1.45, 2.75, 0.85], target: [0.72, 2.78, 0.05], fov: 30 },
  { f: 238, pos: [1.3, 2.95, 0.75], target: [0.72, 2.95, 0.05], fov: 30 },
];

/** 04 · part 2 (50.24–66.18 s): zipper (low macro → follow) · elastics · cord lock macro → fit ring. */
export const SealV2: React.FC = () => {
  const END = SRC[SRC.length - 1];
  const c1 = cutOnBeat(SEAL_START, 52);
  const c2 = cutOnBeat(SEAL_START, SRC[2]);
  const c3 = cutOnBeat(SEAL_START, SRC[3]);
  const c4 = cutOnBeat(SEAL_START, s(12.4));
  const cE = cutOnBeat(SEAL_START, Math.round((c2 + c3) / 2));
  // the zipper label only appears in the follow shot (no jump across the cut), puffing in on it
  const zipIn = subMap(SRC, DST, c1, c2).dst[0] + 3;
  const shots: { a: number; b: number; keys?: CamKey[]; fx?: "whip" | "zoom"; zip?: number; el?: number }[] = [
    { a: 0, b: c1, keys: ZIP_LOW, zip: 999 },
    { a: c1, b: c2, zip: zipIn },
    { a: c2, b: cE, keys: ELASTIC, fx: "whip", el: 999 },
    { a: cE, b: c3, keys: ELASTIC_CUFF, el: subMap(SRC, DST, cE, c3).dst[0] + 3 },
    { a: c3, b: c4, keys: LOCK_MACRO, fx: "zoom" },
    { a: c4, b: END, keys: FIT_PUSH },
  ];
  return (
    <AbsoluteFill>
      {shots.map((sh, i) => {
        const m = subMap(SRC, DST, sh.a, sh.b);
        return (
          <Sequence key={i} from={sh.a} durationInFrames={sh.b - sh.a}>
            <ShotFx len={sh.b - sh.a} inFx={sh.fx ?? "none"}>
              <Retime src={m.src} dst={m.dst}>
                <T2Seal chrome={false} keys={sh.keys} zipStart={sh.zip} elasticStart={sh.el} />
              </Retime>
            </ShotFx>
          </Sequence>
        );
      })}
      <StepBar step={4} start={-30} end={END + 200} />
    </AbsoluteFill>
  );
};
