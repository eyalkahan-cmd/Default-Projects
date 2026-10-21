import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { T4Flow } from "../../tests/T4Flow";
import { CamKey, makeRig, project } from "../../three/rig";
import { ClickRing, ShotFx, StepBar } from "../motion";
import { Retime } from "../time";

// T4's authored frames: plug descends 96–132 onto the box (PORT_TOP = FLOOR + 0.475 + 0.485)
const BLOWER_EXIT: CamKey[] = [
  { f: 0, pos: [-2.15, 0.15, 1.15], target: [-3.0, -0.25, -0.1], fov: 30 },
  { f: 60, pos: [-1.75, 0.0, 1.25], target: [-2.6, -0.4, 0.05], fov: 30 },
];
const OVER_PORT: CamKey[] = [
  { f: 84, pos: [0.62, 1.35, 1.05], target: [0, 0.55, 0], fov: 30 },
  { f: 150, pos: [0.5, 1.2, 0.95], target: [0, 0.55, 0], fov: 30 },
];

/**
 * 02 · CONNECT (25.58–30.58 s, 150 f): "ודאו שכבל המאוורר מחובר למקור החשמל" — the cable leaves
 * the blower (macro) → whip → high three-quarter over the battery box as the plug drops in
 * straight from above and seats with a click.
 */
export const ConnectV2: React.FC = () => {
  const { width, height } = useVideoConfig();
  const A = 52;
  const END = 150;
  // seat moment in this scene: T4 frame 132 mapped through the second shot's retime (84→150 over A→END)
  const seatLocal = A + ((132 - 84) / (150 - 84)) * (END - A);
  const portCam = makeRig(OVER_PORT)(132);
  const pPort = project([0, -0.5 + 0.475 + 0.485, 0.02], portCam, width, height);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={A}>
        <ShotFx len={A} outFx="whip">
          <Retime src={[0, A]} dst={[0, 60]}>
            <T4Flow chrome={false} keys={BLOWER_EXIT} />
          </Retime>
        </ShotFx>
      </Sequence>
      <Sequence from={A} durationInFrames={END - A}>
        <ShotFx len={END - A} inFx="whip">
          <Retime src={[0, END - A]} dst={[84, 150]}>
            <T4Flow chrome={false} keys={OVER_PORT} />
          </Retime>
        </ShotFx>
      </Sequence>
      <ClickRing at={pPort} start={Math.round(seatLocal)} />
      <StepBar step={2} start={-30} end={END + 200} />
    </AbsoluteFill>
  );
};
