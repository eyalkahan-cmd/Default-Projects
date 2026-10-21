import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Backdrop, LensFinish } from "../overlay/Overlay";
import { HEEBO, look } from "../theme";
import { useFrame } from "./time";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** two beats of the 124 BPM underscore, in frames */
export const BAR2 = 29;

/**
 * A real product photograph standing in the light studio: soft contact shadow, an honest
 * photographic push-in. No fake 3D rotation of flat images.
 */
export const Photo: React.FC<{ src: string; h: number; cx: number; floor: number; push?: number; opacity?: number; shadow?: number }> = ({
  src,
  h,
  cx,
  floor,
  push = 1,
  opacity = 1,
  shadow = 1,
}) => (
  <div style={{ position: "absolute", left: cx, top: floor, opacity }}>
    <div
      style={{
        position: "absolute",
        left: -h * 0.3,
        top: -h * 0.03,
        width: h * 0.6,
        height: h * 0.07,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(20,40,80,0.32) 0%, rgba(20,40,80,0) 70%)",
        opacity: shadow,
        transform: `scale(${push})`,
      }}
    />
    <Img
      src={staticFile(src)}
      style={{ position: "absolute", height: h, left: 0, bottom: 0, transform: `translateX(-50%) scale(${push})`, transformOrigin: "50% 100%" }}
    />
  </div>
);

const MONTAGE = ["cut/astronaut.png", "cut/dino_blue.png", "cut/giraffe.png", "cut/unicorn.png"];

/**
 * OPENING (0–6.4 s): "קניתם תחפושת מתנפחת…" — a beat-cut run of real Pumpit costumes in the light
 * studio (two beats each), then "כך תנפחו אותה בקלות!" — the T-Rex hero with the film's title.
 */
export const Opening: React.FC = () => {
  const frame = useFrame();
  const L = look();
  const titleStart = MONTAGE.length * BAR2;
  const idx = Math.min(MONTAGE.length - 1, Math.floor(frame / BAR2));
  const local = frame - idx * BAR2;
  const t = easeOut(interpolate(frame, [titleStart, titleStart + 18], [0, 1], clamp));
  const heroPush = interpolate(frame, [titleStart, titleStart + 80], [1.0, 1.05], clamp);
  return (
    <AbsoluteFill>
      <Backdrop x={0.5} y={0.42} />
      {/* soft brand-blue disc behind the subject for depth (drifts slowly, never a graphic) */}
      <div
        style={{
          position: "absolute",
          left: 960 - 430 + interpolate(frame, [0, 200], [-30, 30]),
          top: 120,
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,153,234,0.16) 0%, rgba(16,153,234,0.05) 55%, rgba(16,153,234,0) 72%)",
        }}
      />
      {frame < titleStart ? (
        <Photo src={MONTAGE[idx]} h={860} cx={960 + (idx % 2 ? 60 : -60)} floor={1000} push={interpolate(local, [0, BAR2], [1.0, 1.045])} />
      ) : (
        <>
          <Photo src="img/trex_cutout_clean.png" h={900} cx={interpolate(t, [0, 1], [760, 620])} floor={1010} push={heroPush} opacity={t} />
          <div style={{ position: "absolute", right: 150, top: 330, direction: "rtl", fontFamily: HEEBO, color: L.text, opacity: t, translate: `${(1 - t) * 40}px 0` }}>
            <div style={{ fontSize: 34, fontWeight: 600, color: L.accent, letterSpacing: 1 }}>מדריך קצר</div>
            <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.02, marginTop: 8 }}>איך מנפחים</div>
            <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.02 }}>תחפושת מתנפחת</div>
            <div style={{ width: 120 * t, height: 6, borderRadius: 3, background: L.accent, marginTop: 26 }} />
          </div>
        </>
      )}
      <LensFinish />
    </AbsoluteFill>
  );
};
