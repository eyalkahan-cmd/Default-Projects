import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { ShotFx } from "../motion";
import { ConnectV2 } from "./ConnectV2";
import { FanV2 } from "./FanV2";
import { OpeningV2 } from "./OpeningV2";
import { PowerV2 } from "./PowerV2";
import { KeepRunning } from "../Finale";
import { EndCardV2, LineupV2 } from "./FinaleV2";
import { InflateV2 } from "./InflateV2";
import { AirLeakV2, SealV2 } from "./SealV2";
import { WearV2 } from "./WearV2";

const s = (sec: number) => Math.round(sec * 30);
/** one grade for photos and 3D alike: a touch of contrast and colour, slightly warm whites */
export const GRADE = "contrast(1.04) saturate(1.07) sepia(0.04)";
export const V2 = { opening: 0, fan: s(6.4), power: s(11.96), connect: s(25.58), end: s(30.58) };

/** v2 style test: opening + chapters 01–02 in the inflatable motion language, on Guide_v2. */
export const FilmV2Test: React.FC = () => {
  const c = V2;
  return (
    <AbsoluteFill style={{ background: "#eef4fc", filter: GRADE }}>
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

/** the full film in the v2 language, every chapter on the Guide_v2 voiceover */
export const F2 = {
  opening: 0,
  fan: s(6.4),
  power: s(11.96),
  connect: s(25.58),
  wear: s(30.58),
  leak: s(42.04),
  seal: s(50.24),
  inflate: s(66.18),
  lineup: s(79.18),
  keep: s(81.83),
  end: s(86.5),
  total: s(89.73),
};

export const FilmV2Full: React.FC = () => {
  const c = F2;
  const seq = (from: number, to: number, el: React.ReactNode, inFx: "whip" | "zoom" | "none" = "none", outFx: "whip" | "zoom" | "none" = "none") => (
    <Sequence from={from} durationInFrames={to - from}>
      <ShotFx len={to - from} inFx={inFx} outFx={outFx}>
        {el}
      </ShotFx>
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#eef4fc", filter: GRADE }}>
      {seq(c.opening, c.fan, <OpeningV2 />, "none", "zoom")}
      {seq(c.fan, c.power, <FanV2 />, "none", "whip")}
      {seq(c.power, c.connect, <PowerV2 />, "whip", "whip")}
      {seq(c.connect, c.wear, <ConnectV2 />, "none", "zoom")}
      {seq(c.wear, c.leak, <WearV2 />, "zoom", "whip")}
      {seq(c.leak, c.seal, <AirLeakV2 />, "whip", "none")}
      {seq(c.seal, c.inflate, <SealV2 />, "none", "zoom")}
      {seq(c.inflate, c.lineup, <InflateV2 />, "zoom", "whip")}
      {seq(c.lineup, c.keep, <LineupV2 />, "whip", "whip")}
      {seq(c.keep, c.end, <KeepRunning chrome={false} />, "whip", "zoom")}
      {seq(c.end, c.total, <EndCardV2 />, "zoom", "none")}
    </AbsoluteFill>
  );
};
