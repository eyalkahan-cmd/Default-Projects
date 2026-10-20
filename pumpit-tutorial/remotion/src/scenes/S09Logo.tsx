import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../components/anim";
import { BrandBg, Confetti } from "../components/ui";
import { C, f, HEEBO } from "../theme";

/** 86.67–90.67s: logo "inflates" on the music's final hit (film 88.82s = local 2.15s). */
export const S09Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit = f(2.15);
  // balloon-like inflate: small, wobbling, then a springy pop to full size on the hit
  const pre = interpolate(frame, [0, hit], [0.12, 0.5], clamp);
  const popS = spring({ frame: frame - hit, fps, config: { damping: 8, stiffness: 160, mass: 0.8 } });
  const scale = frame < hit ? pre + Math.sin(frame / 2) * 0.015 : interpolate(popS, [0, 1], [0.5, 1]);
  const url = spring({ frame: frame - hit - 10, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill>
      <BrandBg tint={C.blue} spot={{ x: 0.5, y: 0.45 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile("img/logo.png")}
          style={{
            width: 1180,
            scale: `${scale}`,
            filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.45))",
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontFamily: HEEBO,
            fontWeight: 800,
            fontSize: 58,
            color: C.white,
            letterSpacing: 2,
            opacity: url,
            translate: `0px ${interpolate(url, [0, 1], [30, 0])}px`,
          }}
        >
          pumpit.co.il
        </div>
      </AbsoluteFill>
      <Confetti start={hit} count={80} seed={11} />
    </AbsoluteFill>
  );
};
