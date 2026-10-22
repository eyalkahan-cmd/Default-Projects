import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T3Inflate } from "../../tests/T3Inflate";
import { CamKey } from "../../three/rig";
import { cutOnBeat, ShotFx, StepBar, subMap } from "../motion";
import { Retime } from "../time";

const s = (sec: number) => Math.round(sec * 30);
const START = 1985; // 66.18 s
// "הפעילו" 66.18 · "כחצי דקה" ~72.5 · full size / "וזהו" 77.66 (on the drop)
const SRC = [0, s(6.33), s(11.48), s(13.0)];
const DST = [0, 150, 192, 270];
const FAN_MACRO: CamKey[] = [
  { f: 0, pos: [1.25, -0.35, 1.25], target: [0.5, -0.42, 0], fov: 30 },
  { f: 40, pos: [1.1, -0.3, 1.45], target: [0.48, -0.4, 0], fov: 30 },
];
const LOW_HERO: CamKey[] = [
  { f: 150, pos: [-1.35, -1.2, 6.3], target: [-0.45, -0.05, 0], fov: 33 },
  { f: 192, pos: [-1.0, -1.05, 5.85], target: [-0.42, 0.0, 0], fov: 33 },
];

/** 05 · INFLATE (66.18–79.18 s): fan macro → wide airflow → low hero as it fills → full size on the drop. */
export const InflateV2: React.FC = () => {
  const END = SRC[SRC.length - 1];
  const c1 = cutOnBeat(START, 62);
  const c2 = cutOnBeat(START, 198);
  const c3 = cutOnBeat(START, SRC[2]);
  const shots: { a: number; b: number; keys?: CamKey[]; fx?: "whip" | "zoom" }[] = [
    { a: 0, b: c1, keys: FAN_MACRO },
    { a: c1, b: c2, fx: "zoom" },
    { a: c2, b: c3, keys: LOW_HERO },
    { a: c3, b: END, fx: "zoom" },
  ];
  return (
    <AbsoluteFill>
      {shots.map((sh, i) => {
        const m = subMap(SRC, DST, sh.a, sh.b);
        return (
          <Sequence key={i} from={sh.a} durationInFrames={sh.b - sh.a}>
            <ShotFx len={sh.b - sh.a} inFx={sh.fx ?? "none"}>
              <Retime src={m.src} dst={m.dst}>
                <T3Inflate chrome={false} keys={sh.keys} />
              </Retime>
            </ShotFx>
          </Sequence>
        );
      })}
      <StepBar step={5} start={4} end={END + 200} />
    </AbsoluteFill>
  );
};
