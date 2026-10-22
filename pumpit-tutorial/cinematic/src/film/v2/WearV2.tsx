import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CamKey } from "../../three/rig";
import { WearIn, WearPack } from "../Wear";
import { cutOnBeat, KineticWord, ShotFx, StepBar } from "../motion";
import { Retime } from "../time";

const START = 917; // 30.58 s on the film
const IN_END = 120;
const END = 344;

// costume framed left of centre (the title sits right), full height with floor room in both angles
const IN_WIDE: CamKey[] = [
  { f: 0, pos: [0.95, 0.05, 6.6], target: [0.7, -0.1, 0], fov: 34 },
  { f: 130, pos: [0.85, 0.0, 5.9], target: [0.65, -0.08, 0], fov: 34 },
];
const IN_LOW: CamKey[] = [
  { f: 0, pos: [1.6, -1.15, 6.0], target: [0.75, -0.05, 0], fov: 33 },
  { f: 130, pos: [1.25, -1.0, 5.6], target: [0.7, -0.02, 0], fov: 33 },
];
// WearPack authored frames: into the pocket 8–70, out 104–140, turn 120–165, onto the belt 168–205
const POCKET_HIGH: CamKey[] = [
  { f: 0, pos: [0.65, 1.35, 2.25], target: [0, 0.15, 0.05], fov: 32 },
  { f: 66, pos: [0.5, 1.15, 2.05], target: [0, 0.05, 0.05], fov: 32 },
];
const POCKET_LOW: CamKey[] = [
  { f: 60, pos: [0.75, -0.55, 1.55], target: [0, -0.1, 0.1], fov: 30 },
  { f: 108, pos: [0.6, -0.45, 1.4], target: [0, -0.05, 0.1], fov: 30 },
];
const CLIP_MACRO: CamKey[] = [
  { f: 104, pos: [2.3, 1.25, 1.75], target: [1.3, 0.95, 0], fov: 30 },
  { f: 168, pos: [2.0, 1.05, 1.45], target: [1.3, 0.8, 0], fov: 30 },
];
const BELT_SIDE: CamKey[] = [
  { f: 165, pos: [2.65, 0.95, 1.35], target: [1.3, 0.6, 0], fov: 30 },
  { f: 226, pos: [2.45, 0.8, 1.2], target: [1.3, 0.58, 0], fov: 30 },
];

/**
 * 03 · WEAR (30.58–42.04 s): the empty costume (two angles) → the pack slides into the inner pocket
 * (high, then low) → it rises and turns to show the clip (macro) → clips onto the belt (side).
 */
export const WearV2: React.FC = () => {
  const a = cutOnBeat(START, 60);
  const p1 = cutOnBeat(START, IN_END + 62);
  const p2 = cutOnBeat(START, IN_END + 104);
  const p3 = cutOnBeat(START, IN_END + 166);
  const shots: { from: number; to: number; el: React.ReactNode; fx?: "whip" | "zoom" }[] = [
    { from: 0, to: a, el: <WearIn chrome={false} keys={IN_WIDE} /> },
    { from: a, to: IN_END, el: <Retime src={[0, IN_END - a]} dst={[a, IN_END]}><WearIn chrome={false} keys={IN_LOW} /></Retime> },
    { from: IN_END, to: p1, fx: "whip", el: <Retime src={[0, p1 - IN_END]} dst={[0, p1 - IN_END]}><WearPack chrome={false} keys={POCKET_HIGH} /></Retime> },
    { from: p1, to: p2, el: <Retime src={[0, p2 - p1]} dst={[p1 - IN_END, p2 - IN_END]}><WearPack chrome={false} keys={POCKET_LOW} /></Retime> },
    { from: p2, to: p3, fx: "zoom", el: <Retime src={[0, p3 - p2]} dst={[p2 - IN_END, p3 - IN_END]}><WearPack chrome={false} keys={CLIP_MACRO} /></Retime> },
    { from: p3, to: END, el: <Retime src={[0, END - p3]} dst={[p3 - IN_END, END - IN_END]}><WearPack chrome={false} keys={BELT_SIDE} /></Retime> },
  ];
  return (
    <AbsoluteFill>
      {shots.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.to - s.from}>
          <ShotFx len={s.to - s.from} inFx={s.fx ?? "none"}>
            {s.el}
          </ShotFx>
        </Sequence>
      ))}
      <KineticWord text="נכנסים לתחפושת" sub="המאוורר עדיין כבוי" start={14} end={IN_END - 4} x={1440} y={330} size={104} />
      <StepBar step={3} start={4} end={END + 200} />
    </AbsoluteFill>
  );
};
