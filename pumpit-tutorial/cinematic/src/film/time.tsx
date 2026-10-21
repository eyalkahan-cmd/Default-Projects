import React, { createContext, useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * Scene-local time. Scenes and overlays read their frame through useFrame(); <Retime> maps the
 * enclosing Sequence's frame onto a scene's own authored timeline (piecewise-linear), so the
 * look-dev scenes can be fitted to the voiceover without re-authoring their choreography.
 */
const FrameCtx = createContext<number | null>(null);

export const useFrame = () => {
  const real = useCurrentFrame();
  const mapped = useContext(FrameCtx);
  return mapped ?? real;
};

/** `src` frames of the Sequence → `dst` frames of the scene's authored timeline (same length arrays). */
export const Retime: React.FC<{ src: number[]; dst: number[]; children: React.ReactNode }> = ({ src, dst, children }) => {
  const f = useCurrentFrame();
  const mapped = interpolate(f, src, dst, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <FrameCtx.Provider value={mapped}>{children}</FrameCtx.Provider>;
};
