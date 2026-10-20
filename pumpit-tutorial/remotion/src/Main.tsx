import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { BandWipe, CaptionBar } from "./components/ui";
import { CAPTIONS } from "./data/captions";
import { S01Opening } from "./scenes/S01Opening";
import { S02Fan } from "./scenes/S02Fan";
import { S03Power } from "./scenes/S03Power";
import { S04Wear } from "./scenes/S04Wear";
import { S05Important } from "./scenes/S05Important";
import { S06Seal } from "./scenes/S06Seal";
import { S07Inflate } from "./scenes/S07Inflate";
import { S08Finale } from "./scenes/S08Finale";
import { S09Logo } from "./scenes/S09Logo";
import { f, FPS, T } from "./theme";

const span = (a: number, b: number) => ({ from: f(a), durationInFrames: f(b) - f(a) });

/** Music level (linear gain) at time `sec`: ducked under speech, lifted at the big moments. */
const musicGain = (sec: number) => {
  let dist = Infinity;
  for (const c of CAPTIONS) {
    if (sec >= c.start - 0.2 && sec <= c.end + 0.15) {
      dist = 0;
      break;
    }
    dist = Math.min(dist, Math.abs(sec - c.start), Math.abs(sec - c.end));
  }
  const duck = interpolate(dist, [0, 0.35], [0.16, 0.3], { extrapolateRight: "clamp" });
  const lift =
    sec < 0.45 ? 0.45 : sec >= 77.9 && sec < 78.6 ? 0.42 : sec >= 86.2 ? interpolate(sec, [86.2, 86.8], [duck, 0.55], { extrapolateRight: "clamp" }) : duck;
  return Math.max(duck, lift);
};

/** Preview mix. The delivered master is mixed and mastered separately (scripts/mix_master.py). */
export const PREVIEW_AUDIO = true;

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#031B4E" }}>
      <Sequence {...span(T.opening[0], T.opening[1])} name="01 Opening" layout="absolute-fill">
        <S01Opening />
      </Sequence>
      <Sequence {...span(T.fan[0], T.fan[1])} name="02 Fan" layout="absolute-fill">
        <S02Fan />
      </Sequence>
      <Sequence {...span(T.aa[0], T.powerbank[1])} name="03 Power" layout="absolute-fill">
        <S03Power />
      </Sequence>
      <Sequence {...span(T.cable[0], T.clip[1])} name="04 Wear" layout="absolute-fill">
        <S04Wear />
      </Sequence>
      <Sequence {...span(T.important[0], T.important[1])} name="05 Most important" layout="absolute-fill">
        <S05Important />
      </Sequence>
      <Sequence {...span(T.zip[0], T.straps[1])} name="06 Seal" layout="absolute-fill">
        <S06Seal />
      </Sequence>
      <Sequence {...span(T.switchOn[0], T.inflate[1])} name="07 Inflate" layout="absolute-fill">
        <S07Inflate />
      </Sequence>
      <Sequence {...span(T.ready[0], T.reminder[1])} name="08 Finale" layout="absolute-fill">
        <S08Finale />
      </Sequence>
      <Sequence {...span(T.logo[0], T.logo[1])} name="09 Logo" layout="absolute-fill">
        <S09Logo />
      </Sequence>

      {/* cut covers */}
      <BandWipe at={f(T.aa[0])} />
      <BandWipe at={f(T.cable[0])} dir={1} />
      <BandWipe at={f(T.enter[0])} />
      <BandWipe at={f(T.clip[0])} dir={1} />
      <BandWipe at={f(T.zip[0])} />
      <BandWipe at={f(T.elastic[0])} dir={1} />
      <BandWipe at={f(T.straps[0])} />
      <BandWipe at={f(T.switchOn[0])} dir={1} />
      <BandWipe at={f(T.inflate[0])} />
      <BandWipe at={f(T.logo[0])} dir={1} />

      {/* narration subtitles */}
      {CAPTIONS.map((c, i) => (
        <CaptionBar key={i} text={c.text} start={f(c.start)} end={f(c.end) + 4} />
      ))}

      {PREVIEW_AUDIO ? (
        <>
          <Audio src={staticFile("audio/voice.mp3")} />
          <Audio src={staticFile("audio/music_edit.wav")} volume={(fr) => musicGain(fr / FPS)} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
