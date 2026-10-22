import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T3Inflate } from "../../tests/T3Inflate";
import { CamKey } from "../../three/rig";
import { ShotFx, StepBar, subMap } from "../motion";
import { Retime } from "../time";
import { INFLATE, INFLATE_DST, INFLATE_SRC } from "./timings";


// "הפעילו" 66.18 · "כחצי דקה" ~72.5 · full size / "וזהו" 77.66 (on the drop)
const SRC = INFLATE_SRC;
const DST = INFLATE_DST;
// opening shot of step 5: close on the fan at the hip, but always the whole costume, feet included
// (the full-body guard holds it at ≤ 85 % of the frame)
const FAN_MACRO: CamKey[] = [
  { f: 0, pos: [1.5, -0.55, 5.0], target: [0.4, -0.25, 0], fov: 30 },
  { f: 40, pos: [1.25, -0.5, 4.7], target: [0.38, -0.22, 0], fov: 30 },
];
const LOW_HERO: CamKey[] = [
  { f: 150, pos: [-1.35, -1.2, 6.3], target: [-0.45, -0.05, 0], fov: 33 },
  { f: 192, pos: [-1.0, -1.05, 5.85], target: [-0.42, 0.0, 0], fov: 33 },
];

/** 05 · INFLATE (66.18–79.18 s): fan macro → wide airflow → low hero as it fills → full size on the drop. */
export const InflateV2: React.FC = () => {
  const { END, c1, c2, c3 } = INFLATE;
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
