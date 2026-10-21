import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { T1Fan } from "../tests/T1Fan";
import { T2Seal } from "../tests/T2Seal";
import { T3Inflate } from "../tests/T3Inflate";
import { T4Flow } from "../tests/T4Flow";
import { AirLeak } from "./AirLeak";
import { EndCard, KeepRunning, Lineup } from "./Finale";
import { Opening } from "./Opening";
import { Power } from "./Power";
import { Retime } from "./time";
import { WearIn, WearPack } from "./Wear";

/** seconds of the corrected voiceover (Guide_v2) → frames */
const s = (sec: number) => Math.round(sec * 30);

/**
 * Edit decision list, all times on the Guide_v2 voiceover. Scenes authored as look-dev tests
 * are fitted to the narration with <Retime> (film frames → authored frames).
 */
export const CUTS = {
  opening: 0,
  fan: s(6.4),
  power: s(11.96),
  connect: s(25.58),
  wearIn: s(30.58),
  wearPack: s(34.57),
  airLeak: s(42.04),
  seal: s(50.24),
  inflate: s(66.18),
  lineup: s(79.18),
  keepRunning: s(81.83),
  endCard: s(86.5),
  end: s(89.73),
};
export const FILM_FRAMES = CUTS.end;

/** chapter changes get a full light wipe; cuts inside a chapter a softer one */
const WIPES: { at: number; strength: number }[] = [
  { at: CUTS.fan, strength: 1 },
  { at: CUTS.power, strength: 1 },
  { at: CUTS.connect, strength: 0.55 },
  { at: CUTS.wearIn, strength: 1 },
  { at: CUTS.wearPack, strength: 0.55 },
  { at: CUTS.airLeak, strength: 1 },
  { at: CUTS.seal, strength: 0.7 },
  { at: CUTS.inflate, strength: 1 },
  { at: CUTS.lineup, strength: 1 },
  { at: CUTS.keepRunning, strength: 0.7 },
  { at: CUTS.endCard, strength: 1 },
];

/**
 * Light wipe: a soft white bloom sweeps diagonally across the frame and hides the cut at its
 * peak (studio light passing the lens), instead of a flat cross-dissolve.
 */
const LightWipe: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {WIPES.map(({ at, strength }) => {
        const k = interpolate(f, [at - 8, at, at + 9], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (k <= 0) return null;
        const pos = interpolate(f, [at - 8, at + 9], [-40, 140]);
        return (
          <AbsoluteFill
            key={at}
            style={{
              pointerEvents: "none",
              opacity: k * strength,
              background: `linear-gradient(105deg, rgba(255,255,255,0) ${pos - 60}%, rgba(255,255,255,0.97) ${pos - 12}%, rgba(255,255,255,0.97) ${pos + 12}%, rgba(255,255,255,0) ${pos + 60}%), rgba(240,246,255,${0.55 * k})`,
            }}
          />
        );
      })}
    </>
  );
};

const len = (a: number, b: number) => b - a;

export const Film: React.FC = () => {
  const c = CUTS;
  return (
    <AbsoluteFill style={{ background: "#eef4fc" }}>
      <Sequence from={c.opening} durationInFrames={len(c.opening, c.fan)}>
        <Opening />
      </Sequence>
      <Sequence from={c.fan} durationInFrames={len(c.fan, c.power)}>
        <Retime src={[0, len(c.fan, c.power)]} dst={[0, 210]}>
          <T1Fan />
        </Retime>
      </Sequence>
      <Sequence from={c.power} durationInFrames={len(c.power, c.connect)}>
        <Power />
      </Sequence>
      <Sequence from={c.connect} durationInFrames={len(c.connect, c.wearIn)}>
        <T4Flow />
      </Sequence>
      <Sequence from={c.wearIn} durationInFrames={len(c.wearIn, c.wearPack)}>
        <WearIn />
      </Sequence>
      <Sequence from={c.wearPack} durationInFrames={len(c.wearPack, c.airLeak)}>
        <WearPack />
      </Sequence>
      <Sequence from={c.airLeak} durationInFrames={len(c.airLeak, c.seal)}>
        <AirLeak />
      </Sequence>
      <Sequence from={c.seal} durationInFrames={len(c.seal, c.inflate)}>
        {/* zipper to "עד הסוף" (53.62) · elastics (54.06–58.58) · drawstring "בעדינות" (59.5–63.0) */}
        <Retime src={[0, s(3.38), s(3.82), s(8.34), s(9.26), s(12.76), s(15.32), s(15.94)]} dst={[0, 118, 128, 180, 184, 236, 270, 270]}>
          <T2Seal />
        </Retime>
      </Sequence>
      <Sequence from={c.inflate} durationInFrames={len(c.inflate, c.lineup)}>
        {/* "הפעילו" 66.18 · "כחצי דקה" ~72.5 · full size / "וזהו" 77.66 */}
        <Retime src={[0, s(6.33), s(11.48), s(13.0)]} dst={[0, 150, 192, 270]}>
          <T3Inflate />
        </Retime>
      </Sequence>
      <Sequence from={c.lineup} durationInFrames={len(c.lineup, c.keepRunning)}>
        <Lineup />
      </Sequence>
      <Sequence from={c.keepRunning} durationInFrames={len(c.keepRunning, c.endCard)}>
        <KeepRunning />
      </Sequence>
      <Sequence from={c.endCard} durationInFrames={len(c.endCard, c.end)}>
        <EndCard />
      </Sequence>
      <LightWipe />
    </AbsoluteFill>
  );
};
