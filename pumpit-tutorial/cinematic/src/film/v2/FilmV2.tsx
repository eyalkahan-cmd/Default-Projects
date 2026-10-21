import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { ShotFx } from "../motion";
import { ConnectV2 } from "./ConnectV2";
import { FanV2 } from "./FanV2";
import { OpeningV2 } from "./OpeningV2";
import { PowerV2 } from "./PowerV2";

const s = (sec: number) => Math.round(sec * 30);
export const V2 = { opening: 0, fan: s(6.4), power: s(11.96), connect: s(25.58), end: s(30.58) };

/** v2 style test: opening + chapters 01–02 in the inflatable motion language, on Guide_v2. */
export const FilmV2Test: React.FC = () => {
  const c = V2;
  return (
    <AbsoluteFill style={{ background: "#eef4fc" }}>
      <Sequence durationInFrames={c.fan}>
        <ShotFx len={c.fan} outFx="zoom">
          <OpeningV2 />
        </ShotFx>
      </Sequence>
      <Sequence from={c.fan} durationInFrames={c.power - c.fan}>
        <ShotFx len={c.power - c.fan} outFx="whip">
          <FanV2 />
        </ShotFx>
      </Sequence>
      <Sequence from={c.power} durationInFrames={c.connect - c.power}>
        <ShotFx len={c.connect - c.power} inFx="whip" outFx="whip">
          <PowerV2 />
        </ShotFx>
      </Sequence>
      <Sequence from={c.connect} durationInFrames={c.end - c.connect}>
        <ConnectV2 />
      </Sequence>
    </AbsoluteFill>
  );
};
