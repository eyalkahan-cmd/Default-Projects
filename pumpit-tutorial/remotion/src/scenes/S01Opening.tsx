import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_IN_OUT, EASE_OUT, pop } from "../components/anim";
import { Headline } from "../components/ui";
import { C, f } from "../theme";

const LINEUP = [
  "dino_blue",
  "unicorn",
  "alien",
  "sumo",
  "flamingo",
  "trex",
  "astronaut",
  "peacock",
  "rocket",
  "horse",
  "football",
  "dino_green",
];

/** 0–6.35s: "קניתם תחפושת מתנפחת ואתם מוכנים לגנוב את ההצגה? כך תנפחו אותה בקלות!" */
export const S01Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = f(4.0); // "כך תנפחו אותה בקלות"
  const revealP = interpolate(frame, [reveal, reveal + 16], [0, 1], { ...clamp, easing: EASE_IN_OUT });

  return (
    <AbsoluteFill style={{ backgroundColor: C.navyDeep }}>
      {/* stage */}
      <AbsoluteFill style={{ scale: `${interpolate(frame, [0, f(4.5)], [1.12, 1], clamp)}` }}>
        <Img src={staticFile("img/bg_stage.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,27,78,0.25) 0%, rgba(3,27,78,0.0) 40%, rgba(3,27,78,0.55) 100%)" }} />
      </AbsoluteFill>

      {/* costume line-up popping in on the beat */}
      <AbsoluteFill>
        {LINEUP.map((name, i) => {
          const p = pop(frame, fps, 4 + i * 3, 9);
          const n = LINEUP.length;
          const x = 80 + (i * (1920 - 160)) / (n - 1);
          const arc = Math.abs(i - (n - 1) / 2);
          const h = 420 - arc * 14;
          const bob = Math.sin((frame + i * 7) / 7) * 6;
          const exit = interpolate(frame, [reveal - 2, reveal + 10], [0, 1], { ...clamp, easing: EASE_IN_OUT });
          return (
            <Img
              key={name}
              src={staticFile(`cut/${name}.png`)}
              style={{
                position: "absolute",
                left: x,
                bottom: 40 + arc * 10,
                height: h,
                translate: `-50% ${interpolate(p, [0, 1], [500, 0]) + bob + exit * 700}px`,
                rotate: `${interpolate(p, [0, 1], [i % 2 ? 14 : -14, 0])}deg`,
                filter: "drop-shadow(0 18px 18px rgba(0,0,0,0.45))",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* "steal the show" */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 150 }}>
        <div style={{ opacity: interpolate(frame, [reveal - 4, reveal + 6], [1, 0], clamp) }}>
          <Headline text="גנבו את ההצגה!" start={f(2.2)} size={170} stagger={5} highlight={["ההצגה!"]} />
        </div>
      </AbsoluteFill>

      {/* balloon-mask reveal into the hero T-Rex */}
      <AbsoluteFill
        style={{
          clipPath: `circle(${interpolate(revealP, [0, 1], [0, 130])}% at 78% 55%)`,
        }}
      >
        <Img
          src={staticFile("img/trex_studio_inflated.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: `${interpolate(frame, [reveal, f(6.35)], [1.18, 1.04], { ...clamp, easing: EASE_OUT })}`,
          }}
        />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", paddingLeft: 110 }}>
          <div style={{ width: 980 }}>
            <Headline text="איך מנפחים תחפושת מתנפחת?" start={reveal + 8} size={112} stagger={4} highlight={["מנפחים"]} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
