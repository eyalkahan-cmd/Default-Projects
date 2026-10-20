import { Easing, interpolate, spring } from "remotion";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** Bouncy 0→1 pop starting at `delay` frames. */
export const pop = (frame: number, fps: number, delay = 0, damping = 11) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 170, mass: 0.7 } });

/** Smooth 0→1 settle starting at `delay` frames. */
export const settle = (frame: number, fps: number, delay = 0, dur?: number) =>
  spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: dur });

/** Fade in over `inF` frames from `start`, fade out over `outF` frames before `end`. */
export const fadeInOut = (frame: number, start: number, end: number, inF = 8, outF = 8) =>
  interpolate(frame, [start, start + inF, end - outF, end], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE_OUT,
  });

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
