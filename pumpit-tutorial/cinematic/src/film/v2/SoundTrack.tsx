import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { AUDIO, CUES, FPS, MUSIC_IN, SCENES, SFX_LENGTH, TIMINGS } from "./timings";
import duck from "./voice_duck.json";

const db = (d: number) => Math.pow(10, d / 20);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * The whole soundtrack as Remotion <Audio> layers, every one placed from TIMINGS:
 * - the voiceover (Guide_v2, untouched) from frame 0,
 * - the music, trimmed in (`trimBefore`) so its drop lands on MUSIC_DROP_FRAME, ducked 6 dB
 *   under speech, lifted 3 dB for the drop, faded out at the end,
 * - each sound effect in its own Sequence: it starts `peak` before the frame it must hit
 *   (trimmed with `trimBefore` if that is before the film starts) and is cut to its length
 *   (`durationInFrames`) with a short fade-out.
 * (`trimBefore` / `durationInFrames` are Remotion's current names for `startFrom` / `endAt`.)
 */
export const SoundTrack: React.FC = () => {
  const total = SCENES.total;
  const drop = TIMINGS.MUSIC_DROP_FRAME;
  return (
    <>
      <Audio src={staticFile(AUDIO.voice)} name="voice" />
      <Audio
        name="music"
        src={staticFile(AUDIO.music)}
        trimBefore={Math.round(MUSIC_IN * FPS)}
        durationInFrames={total}
        volume={(f) => {
          const d = (duck as number[])[f] ?? 0;
          const lift = interpolate(f, [drop, drop + 9, drop + 30, drop + 48], [0, 1, 1, 0], clamp);
          const fade = interpolate(f, [0, 10, total - 72, total], [0, 1, 1, 0], clamp);
          return db(AUDIO.musicDb - AUDIO.duckDb * d + 3 * lift) * fade;
        }}
      />
      {CUES.map((c, i) => {
        const start = Math.round(c.at - (c.peak ?? 0) * FPS);
        const len = Math.max(1, Math.round(Math.min(c.len ?? Infinity, SFX_LENGTH[c.file]) * FPS));
        const pre = Math.max(0, -start); // a cue that would start before the film: trim its head
        const dur = Math.min(len - pre, total - Math.max(0, start));
        if (dur <= 0) return null;
        const tail = Math.min(12, Math.round(len / 3));
        return (
          <Sequence key={i} from={Math.max(0, start)} durationInFrames={dur} name={`sfx ${c.file}`} layout="none">
            <Audio
              src={staticFile(`sfx/${c.file}.wav`)}
              trimBefore={pre}
              durationInFrames={dur}
              volume={(f) => db(c.db) * interpolate(f, [dur - tail, dur], [1, 0], clamp)}
            />
          </Sequence>
        );
      })}
    </>
  );
};
